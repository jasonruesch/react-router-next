import { isAbsolute, relative, resolve } from "node:path";
import type { Plugin } from "vite";
import { renderRuntimeModule } from "./render";
import { ROUTE_FILE_RE, routeKeyFor, scanAppDir, toPosix } from "./scan";
import { generateRouteTypes } from "./typegen";

export type RouteTypegenOptions = {
  /** Source-of-truth directory containing `page.tsx`/`layout.tsx`. Defaults to `src/app`. */
  appDir?: string;
  /** Where the ambient `routes.d.ts` shim is written. Defaults to `<root>/node_modules/.react-router-next`. */
  outDir?: string;
};

const VIRTUAL_PREFIX = "virtual:react-router-next/";
const APP_TREE_ID = `${VIRTUAL_PREFIX}app-tree`;

const RESOLVED_PREFIX = "\0";

function isOurVirtual(id: string): boolean {
  return id.startsWith(VIRTUAL_PREFIX);
}

function resolveOpt(root: string, p: string): string {
  return isAbsolute(p) ? p : resolve(root, p);
}

export function routeTypegen(options: RouteTypegenOptions = {}): Plugin {
  let root = process.cwd();
  let appDir = "";
  let outDir = "";
  let routeKeys = new Set<string>();

  function resolvePaths(viteRoot: string): void {
    root = viteRoot;
    appDir = resolveOpt(root, options.appDir ?? "src/app");
    outDir = resolveOpt(
      root,
      options.outDir ?? "node_modules/.react-router-next",
    );
  }

  function regenerate(): void {
    const result = generateRouteTypes({ root, appDir, outDir });
    routeKeys = new Set(result.routeKeys);
  }

  function refreshKnownKeys(): void {
    const { routeDirs } = scanAppDir(appDir);
    routeKeys = new Set(routeDirs.map((d) => routeKeyFor(appDir, d)));
  }

  return {
    name: "react-router-next:typegen",
    enforce: "pre",

    configResolved(config) {
      resolvePaths(config.root);
      refreshKnownKeys();
    },

    buildStart() {
      regenerate();
    },

    configureServer(server) {
      const onChange = (file: string): void => {
        if (ROUTE_FILE_RE.test(file)) regenerate();
      };
      server.watcher.on("add", onChange);
      server.watcher.on("unlink", onChange);
    },

    resolveId(id) {
      if (id === APP_TREE_ID) return RESOLVED_PREFIX + APP_TREE_ID;
      if (isOurVirtual(id)) return RESOLVED_PREFIX + id;
      return null;
    },

    load(id) {
      if (!id.startsWith(RESOLVED_PREFIX)) return null;
      const realId = id.slice(RESOLVED_PREFIX.length);

      if (realId === APP_TREE_ID) {
        // Vite resolves `import.meta.glob` patterns relative to the project
        // root when they begin with `/`. Virtual modules have no importer
        // path, so absolute filesystem paths or `./` patterns won't match —
        // root-relative is the only form that works here. The keys Vite
        // returns are also root-relative (e.g. "/src/app/page.tsx"), so we
        // export a matching `appDir` for the tree builder to strip.
        const rootRelative =
          "/" + toPosix(relative(root, appDir)).replace(/^\/+/, "");
        const pattern = `${rootRelative}/**/{page,layout,loader,loading,error,default,template,not-found}.{tsx,jsx,ts,js}`;
        return `\
const modules = import.meta.glob(${JSON.stringify(pattern)}, { eager: true });
const appDir = ${JSON.stringify(rootRelative)};
export { modules, appDir };
`;
      }

      if (!isOurVirtual(realId)) return null;
      const slug = realId.slice(VIRTUAL_PREFIX.length);
      const routeKey = slug === "_root" ? "" : slug;
      if (!routeKeys.has(routeKey)) {
        // Refresh in case a new page was just added before the watcher fired.
        refreshKnownKeys();
        if (!routeKeys.has(routeKey)) {
          this.error(
            `[react-router-next] Unknown route "${routeKey}". ` +
              `Expected a page.tsx or layout.tsx under ${appDir}.`,
          );
        }
      }
      return renderRuntimeModule(routeKey);
    },
  };
}

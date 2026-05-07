import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { renderDtsShim } from "./render";
import { routeKeyFor, scanAppDir } from "./scan";

export type GenerateOptions = {
  /** Project root used to resolve relative paths. Defaults to `process.cwd()`. */
  root?: string;
  /** Source-of-truth directory containing `page.tsx`/`layout.tsx`. Defaults to `src/app`. */
  appDir?: string;
  /** Where the ambient `routes.d.ts` shim is written. Defaults to `<root>/node_modules/.react-router-next`. */
  outDir?: string;
};

export type GenerateResult = {
  appDir: string;
  outDir: string;
  routeKeys: string[];
  shimPath: string;
  written: boolean;
};

function resolveAgainst(root: string, p: string): string {
  return isAbsolute(p) ? p : resolve(root, p);
}

function writeIfChanged(path: string, contents: string): boolean {
  try {
    const existing = readFileSync(path, "utf8");
    if (existing === contents) return false;
  } catch {
    // file missing — fall through to write
  }
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, contents);
  return true;
}

export function generateRouteTypes(opts: GenerateOptions = {}): GenerateResult {
  const root = opts.root ?? process.cwd();
  const appDir = resolveAgainst(root, opts.appDir ?? "src/app");
  const outDir = resolveAgainst(
    root,
    opts.outDir ?? "node_modules/.react-router-next",
  );

  const { routeDirs } = scanAppDir(appDir);
  const routeKeys = [
    ...new Set(routeDirs.map((dir) => routeKeyFor(appDir, dir))),
  ].sort((a, b) => a.localeCompare(b));

  const shimPath = join(outDir, "routes.d.ts");
  const written = writeIfChanged(shimPath, renderDtsShim(routeKeys));

  return { appDir, outDir, routeKeys, shimPath, written };
}

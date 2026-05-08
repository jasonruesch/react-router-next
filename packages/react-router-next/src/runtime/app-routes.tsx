import type { ComponentType, ReactElement, ReactNode } from "react";
import type { LoaderFunction, RouteObject } from "react-router";
import { ComponentWithParams, LoadingBoundary } from "./route-components";
import {
  InterceptedRoute,
  ParallelLayout,
  TemplateRemount,
  type SlotConfig,
} from "./parallel-routes";

type LayoutWithSlots = ComponentType<{
  params?: RouteParamsRecord;
  [slot: string]: unknown;
}>;

type RouteParamsRecord = Record<string, string | string[] | undefined>;

export type RouteModule = {
  default?: ComponentType<{
    params?: RouteParamsRecord;
    [slot: string]: unknown;
  }>;
  loader?: LoaderFunction;
};

export type RouteModuleMap = Record<string, RouteModule>;

type FileKind =
  | "page"
  | "layout"
  | "loader"
  | "loading"
  | "error"
  | "default"
  | "template"
  | "not-found";

type Node = {
  files: Partial<Record<FileKind, RouteModule>>;
  children: Map<string, Node>;
  slots: Map<string, Node>;
};

type Intercept = {
  /** Resolved target URL pattern in routeKey form (e.g. "photos/[id]"). */
  targetKey: string;
  node: Node;
};

type Tree = {
  root: Node;
  intercepts: Intercept[];
};

const FILE_KINDS = new Set<FileKind>([
  "page",
  "layout",
  "loader",
  "loading",
  "error",
  "default",
  "template",
  "not-found",
]);

function emptyNode(): Node {
  return { files: {}, children: new Map(), slots: new Map() };
}

function isPrivateSegment(seg: string): boolean {
  return seg.startsWith("_");
}

function isSlotSegment(seg: string): boolean {
  return seg.startsWith("@") && seg.length > 1;
}

type InterceptDepth = 1 | 2 | 3 | "root";

function parseInterceptPrefix(
  seg: string,
): { depth: InterceptDepth; rest: string } | null {
  if (seg.startsWith("(...)")) return { depth: "root", rest: seg.slice(5) };
  if (seg.startsWith("(..)(..)")) return { depth: 3, rest: seg.slice(8) };
  if (seg.startsWith("(..)")) return { depth: 2, rest: seg.slice(4) };
  if (seg.startsWith("(.)")) return { depth: 1, rest: seg.slice(3) };
  return null;
}

function isRouteGroupSegment(seg: string): boolean {
  return (
    seg.startsWith("(") &&
    seg.endsWith(")") &&
    parseInterceptPrefix(seg) === null
  );
}

function routeKeySegmentsOf(parts: readonly string[]): string[] {
  return parts.filter((s) => !isSlotSegment(s) && !isPrivateSegment(s));
}

function resolveInterceptTargetKey(
  fsPrefix: readonly string[],
  intercept: { depth: InterceptDepth; rest: string },
  postIntercept: readonly string[],
): string {
  let resolved: readonly string[];
  if (intercept.depth === "root") {
    resolved = [];
  } else {
    const popCount = intercept.depth - 1;
    resolved = fsPrefix.slice(0, Math.max(0, fsPrefix.length - popCount));
  }
  const prefixSegs = routeKeySegmentsOf(resolved);
  const tail: string[] = [];
  if (intercept.rest) tail.push(intercept.rest);
  tail.push(...postIntercept);
  return [...prefixSegs, ...routeKeySegmentsOf(tail)].join("/");
}

function buildTree(modules: RouteModuleMap, appDir: string): Tree {
  const root = emptyNode();
  const intercepts: Intercept[] = [];
  /** Re-use the same Node across multiple files in the same interceptor folder. */
  const interceptNodes = new Map<string, Node>();
  const prefix = appDir.endsWith("/") ? appDir : `${appDir}/`;

  for (const path in modules) {
    const fromAppDir = path.startsWith(prefix)
      ? path.slice(prefix.length)
      : path;
    const rel = fromAppDir.replace(/\.[jt]sx?$/, "");
    const parts = rel.split("/");
    const last = parts.pop();
    if (!last || !FILE_KINDS.has(last as FileKind)) continue;
    if (parts.some(isPrivateSegment)) continue;

    let interceptIdx = -1;
    let interceptParse: { depth: InterceptDepth; rest: string } | null = null;
    for (let i = 0; i < parts.length; i++) {
      const p = parseInterceptPrefix(parts[i]);
      if (p) {
        interceptIdx = i;
        interceptParse = p;
        break;
      }
    }

    if (interceptParse === null) {
      let node = root;
      for (const seg of parts) {
        if (isSlotSegment(seg)) {
          const name = seg.slice(1);
          let child = node.slots.get(name);
          if (!child) {
            child = emptyNode();
            node.slots.set(name, child);
          }
          node = child;
        } else {
          let child = node.children.get(seg);
          if (!child) {
            child = emptyNode();
            node.children.set(seg, child);
          }
          node = child;
        }
      }
      node.files[last as FileKind] = modules[path];
      continue;
    }

    const fsPrefix = parts.slice(0, interceptIdx);
    const interceptSeg = parts[interceptIdx];
    const postIntercept = parts.slice(interceptIdx + 1);
    const targetKey = resolveInterceptTargetKey(
      fsPrefix,
      interceptParse,
      postIntercept,
    );
    const folderKey = [...fsPrefix, interceptSeg].join("/");
    let node = interceptNodes.get(folderKey);
    if (!node) {
      node = emptyNode();
      interceptNodes.set(folderKey, node);
      intercepts.push({ targetKey, node });
    }
    let cur = node;
    for (const seg of postIntercept) {
      if (isSlotSegment(seg)) {
        const name = seg.slice(1);
        let child = cur.slots.get(name);
        if (!child) {
          child = emptyNode();
          cur.slots.set(name, child);
        }
        cur = child;
      } else {
        let child = cur.children.get(seg);
        if (!child) {
          child = emptyNode();
          cur.children.set(seg, child);
        }
        cur = child;
      }
    }
    cur.files[last as FileKind] = modules[path];
  }

  return { root, intercepts };
}

type RouteSpec = { path?: string; index?: true };

function segmentToSpecs(segment: string): RouteSpec[] {
  if (isRouteGroupSegment(segment)) return [{}];
  if (segment.startsWith("[[...") && segment.endsWith("]]"))
    return [{ index: true }, { path: "*" }];
  if (segment.startsWith("[[") && segment.endsWith("]]"))
    return [{ path: `:${segment.slice(2, -2)}?` }];
  if (segment.startsWith("[...") && segment.endsWith("]"))
    return [{ path: "*" }];
  if (segment.startsWith("[") && segment.endsWith("]"))
    return [{ path: `:${segment.slice(1, -1)}` }];
  return [{ path: segment }];
}

function routeHasParams(route: string): boolean {
  return route.includes("[");
}

function renderComponent(
  Component: ComponentType<{ params?: RouteParamsRecord }>,
  route: string,
): ReactElement {
  return routeHasParams(route) ? (
    <ComponentWithParams Component={Component} route={route} />
  ) : (
    <Component />
  );
}

function lowerSlotToConfig(slotNode: Node, slotPath: string): SlotConfig {
  const Default = slotNode.files.default?.default;
  const defaultElement: ReactNode | null = Default
    ? renderComponent(Default, slotPath)
    : null;
  // Strip the default file before lowering — it's a sibling fallback, not a page.
  const stripped: Node = {
    files: { ...slotNode.files, default: undefined },
    children: slotNode.children,
    slots: slotNode.slots,
  };
  const routes = nodeToRoute(stripped, null, slotPath, undefined);
  return { routes, defaultElement };
}

function lowerInterceptor(node: Node, targetKey: string): ReactNode {
  if (node.files.loader) {
    console.warn(
      `[react-router-next] Loader on intercepting route "${targetKey}" is ignored. ` +
        `Interceptor loaders are not supported in V1.`,
    );
  }
  if (node.files.layout) {
    console.warn(
      `[react-router-next] Layout on intercepting route "${targetKey}" is ignored. ` +
        `Interceptor layouts are not supported in V1.`,
    );
  }
  const Page = node.files.page?.default;
  if (!Page) {
    throw new Error(
      `[react-router-next] Intercepting route at "${targetKey}" is missing page.tsx.`,
    );
  }
  return renderComponent(Page, targetKey);
}

function nodeToRoute(
  node: Node,
  segment: string | null,
  path: string,
  NotFound: ComponentType | undefined,
): RouteObject[] {
  const Layout = node.files.layout?.default;
  const Page = node.files.page?.default;
  const Loading = node.files.loading?.default;
  const ErrorEl = node.files.error?.default;
  const Template = node.files.template?.default;
  const loader =
    node.files.loader?.loader ??
    (node.files.loader?.default as LoaderFunction | undefined);

  const childRoutes: RouteObject[] = [];
  for (const [childSegment, childNode] of node.children) {
    const childPath = path === "" ? childSegment : `${path}/${childSegment}`;
    childRoutes.push(
      ...nodeToRoute(childNode, childSegment, childPath, NotFound),
    );
  }

  const pageEl = Page ? renderComponent(Page, path) : null;

  const pageLeaf: RouteObject | null = pageEl
    ? { index: true, element: pageEl, loader }
    : null;

  const inner: RouteObject[] = [];
  if (pageLeaf) inner.push(pageLeaf);
  inner.push(...childRoutes);

  if (
    NotFound &&
    inner.some((c) => c.path === "*") &&
    !inner.some((c) => c.index)
  ) {
    inner.unshift({ index: true, element: <NotFound /> });
  }

  // Lower @slot subtrees once per layout that owns them.
  let slotConfigs: Record<string, SlotConfig> | null = null;
  if (node.slots.size > 0) {
    if (!Layout) {
      console.warn(
        `[react-router-next] Parallel-route slots at "${path || "/"}" require a layout.tsx to render. Slots ignored.`,
      );
    } else {
      slotConfigs = {};
      for (const [slotName, slotNode] of node.slots) {
        if (slotNode.files.loader) {
          console.warn(
            `[react-router-next] Loader inside @${slotName} at "${path || "/"}" is ignored. ` +
              `Slot loaders are not supported in V1.`,
          );
        }
        slotConfigs[slotName] = lowerSlotToConfig(slotNode, path);
      }
    }
  }

  const specs: RouteSpec[] = segment === null ? [{}] : segmentToSpecs(segment);

  const buildLayoutElement = (): ReactElement | null => {
    if (!Layout) return null;
    if (slotConfigs) {
      return (
        <ParallelLayout
          Component={Layout as LayoutWithSlots}
          slots={slotConfigs}
          route={path}
        />
      );
    }
    return renderComponent(Layout, path);
  };

  return specs.map((spec) => {
    const route: RouteObject = { ...spec };
    if (ErrorEl) route.errorElement = <ErrorEl />;

    const layoutElement = buildLayoutElement();

    if (layoutElement) {
      route.element = layoutElement;
      const wrappedInner: RouteObject[] = Template
        ? [
            {
              element: <TemplateRemount Template={Template} />,
              children: inner,
            },
          ]
        : inner;
      route.children = Loading
        ? [
            {
              element: <LoadingBoundary Loading={Loading} />,
              children: wrappedInner,
            },
          ]
        : wrappedInner;
    } else if (Template) {
      route.element = <TemplateRemount Template={Template} />;
      route.children = Loading
        ? [{ element: <LoadingBoundary Loading={Loading} />, children: inner }]
        : inner;
    } else if (Loading) {
      route.element = <LoadingBoundary Loading={Loading} />;
      route.children = inner;
    } else if (pageEl && childRoutes.length === 0) {
      route.element = pageEl;
      if (loader) route.loader = loader;
    } else if (inner.length > 0) {
      route.children = inner;
    }
    return route;
  });
}

/** Convert a routeKey like "photos/[id]" to RR-style URL pattern segments. */
function routeKeyToRrSegments(routeKey: string): string[] {
  if (routeKey === "") return [];
  const out: string[] = [];
  for (const s of routeKey.split("/")) {
    if (s === "") continue;
    if (isRouteGroupSegment(s)) continue;
    if (s.startsWith("[[...") && s.endsWith("]]")) {
      out.push("*");
    } else if (s.startsWith("[...") && s.endsWith("]")) {
      out.push("*");
    } else if (s.startsWith("[[") && s.endsWith("]]")) {
      out.push(`:${s.slice(2, -2)}?`);
    } else if (s.startsWith("[") && s.endsWith("]")) {
      out.push(`:${s.slice(1, -1)}`);
    } else {
      out.push(s);
    }
  }
  return out;
}

/**
 * Walk a lowered route tree to find the route whose URL pattern matches
 * `targetSegments`. Descends transparently through pathless route-group
 * routes (where `path === undefined`).
 */
function findRouteByPath(
  routes: readonly RouteObject[],
  targetSegments: readonly string[],
): RouteObject | null {
  if (targetSegments.length === 0) {
    for (const r of routes) {
      if (r.index) return r;
    }
    return null;
  }
  const [head, ...rest] = targetSegments;
  for (const r of routes) {
    if (r.index) continue;
    if (r.path === undefined) {
      if (r.children) {
        const found = findRouteByPath(r.children, targetSegments);
        if (found) return found;
      }
      continue;
    }
    if (r.path === head) {
      if (rest.length === 0) {
        if (r.children) {
          for (const c of r.children) {
            if (c.index) return c;
          }
        }
        return r;
      }
      if (r.children) {
        const found = findRouteByPath(r.children, rest);
        if (found) return found;
      }
    }
  }
  return null;
}

function applyIntercept(rootRoute: RouteObject, intercept: Intercept): void {
  const segs = routeKeyToRrSegments(intercept.targetKey);
  const target = findRouteByPath([rootRoute], segs);
  if (!target) {
    throw new Error(
      `[react-router-next] Intercepting route targets "${intercept.targetKey}", ` +
        `but no matching route exists. Add a page.tsx at that path or remove the interceptor.`,
    );
  }
  if (target.element === undefined) {
    throw new Error(
      `[react-router-next] Intercepting route target "${intercept.targetKey}" has no element to wrap.`,
    );
  }
  const interceptorEl = lowerInterceptor(intercept.node, intercept.targetKey);
  target.element = (
    <InterceptedRoute Interceptor={interceptorEl} Target={target.element} />
  );
}

export function buildRoutesFromModules(
  modules: RouteModuleMap,
  appDir: string,
): RouteObject[] {
  const tree = buildTree(modules, appDir);
  const NotFound = tree.root.files["not-found"]?.default;
  const [root] = nodeToRoute(tree.root, null, "", NotFound);
  for (const intercept of tree.intercepts) {
    applyIntercept(root, intercept);
  }
  if (NotFound) {
    (root.children ??= []).push({ path: "*", element: <NotFound /> });
  }
  return [root];
}

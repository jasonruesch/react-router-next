import type { ComponentType, ReactElement } from "react";
import type { LoaderFunction, RouteObject } from "react-router";
import { ComponentWithParams, LoadingBoundary } from "./route-components";

type RouteParamsRecord = Record<string, string | string[] | undefined>;

export type RouteModule = {
  default?: ComponentType<{ params?: RouteParamsRecord }>;
  loader?: LoaderFunction;
};

export type RouteModuleMap = Record<string, RouteModule>;

type FileKind = "page" | "layout" | "loader" | "loading" | "error" | "404";

type Node = {
  files: Partial<Record<FileKind, RouteModule>>;
  children: Map<string, Node>;
};

const FILE_KINDS = new Set<FileKind>([
  "page",
  "layout",
  "loader",
  "loading",
  "error",
  "404",
]);

function emptyNode(): Node {
  return { files: {}, children: new Map() };
}

function buildTree(modules: RouteModuleMap, appDir: string): Node {
  const root = emptyNode();
  const prefix = appDir.endsWith("/") ? appDir : `${appDir}/`;
  for (const path in modules) {
    const fromAppDir = path.startsWith(prefix) ? path.slice(prefix.length) : path;
    const rel = fromAppDir.replace(/\.[jt]sx?$/, "");
    const parts = rel.split("/");
    const last = parts.pop();
    if (!last || !FILE_KINDS.has(last as FileKind)) continue;
    let node = root;
    for (const segment of parts) {
      let child = node.children.get(segment);
      if (!child) {
        child = emptyNode();
        node.children.set(segment, child);
      }
      node = child;
    }
    node.files[last as FileKind] = modules[path];
  }
  return root;
}

type RouteSpec = { path?: string; index?: true };

function segmentToSpecs(segment: string): RouteSpec[] {
  if (segment.startsWith("(") && segment.endsWith(")")) return [{}];
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

  const specs: RouteSpec[] = segment === null ? [{}] : segmentToSpecs(segment);

  return specs.map((spec) => {
    const route: RouteObject = { ...spec };
    if (ErrorEl) route.errorElement = <ErrorEl />;

    if (Layout) {
      route.element = renderComponent(Layout, path);
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

export function buildRoutesFromModules(
  modules: RouteModuleMap,
  appDir: string,
): RouteObject[] {
  const tree = buildTree(modules, appDir);
  const NotFound = tree.files["404"]?.default;
  const [root] = nodeToRoute(tree, null, "", NotFound);
  if (NotFound) {
    (root.children ??= []).push({ path: "*", element: <NotFound /> });
  }
  return [root];
}

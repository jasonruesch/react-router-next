import type { ComponentType, ReactElement, ReactNode } from "react";
import type { LoaderFunction, RouteObject } from "react-router";
import {
  InterceptedRoute,
  ParallelLayout,
  TemplateRemount,
  type SlotConfig,
} from "./parallel-routes";
import {
  ComponentWithParams,
  LoadingBoundary,
  NotFoundBoundary,
  SegmentBoundary,
} from "./route-components";

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
  /** True when the intercept folder lives under at least one `@slot` segment. */
  slotOwned: boolean;
  /**
   * Route key of the layout that owns the slot (e.g. "photos" for an intercept
   * at `photos/@modal/(.)[id]`). Empty for root-level layouts. Only meaningful
   * when `slotOwned` is true.
   */
  parentLayoutKey: string;
  /**
   * Name of the innermost `@slot` enclosing the intercept (without the `@`).
   * Only meaningful when `slotOwned` is true.
   */
  slotName: string | null;
  /** Intercept folder path, used in build-time warnings. */
  folderPath: string;
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
      const slotOwned = fsPrefix.some(isSlotSegment);
      // Parent layout = the deepest non-slot ancestor. `routeKeySegmentsOf`
      // already strips `@slot` and `_private` segments.
      const parentLayoutKey = routeKeySegmentsOf(fsPrefix).join("/");
      let slotName: string | null = null;
      for (let i = fsPrefix.length - 1; i >= 0; i--) {
        if (isSlotSegment(fsPrefix[i])) {
          slotName = fsPrefix[i].slice(1);
          break;
        }
      }
      intercepts.push({
        targetKey,
        node,
        slotOwned,
        parentLayoutKey,
        slotName,
        folderPath: folderKey,
      });
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

function lowerSlotToConfig(
  slotNode: Node,
  slotPath: string,
  allIntercepts: readonly Intercept[],
  slotIntercepts: readonly Intercept[],
): SlotConfig {
  const Default = slotNode.files.default?.default;
  const defaultElement: ReactNode | null = Default
    ? renderComponent(Default, slotPath)
    : null;
  const ErrorComponent = slotNode.files.error?.default;
  const NotFoundComponent = slotNode.files["not-found"]?.default;
  // Strip the default file before lowering — it's a sibling fallback, not a page.
  const stripped: Node = {
    files: { ...slotNode.files, default: undefined },
    children: slotNode.children,
    slots: slotNode.slots,
  };
  const routes = nodeToRoute(
    stripped,
    null,
    slotPath,
    undefined,
    allIntercepts,
  );
  // Inject slot-owned intercept routes so `useRoutes(slot.routes)` matches the
  // intercept URL pattern on soft navigation. Wrap the interceptor element in
  // `InterceptedRoute` so hard loads (POP) fall through to the slot's default.
  for (const intercept of slotIntercepts) {
    const interceptorEl = lowerInterceptor(intercept.node, intercept.targetKey);
    const targetSegs = routeKeyToRrSegments(intercept.targetKey);
    const parentSegs = routeKeyToRrSegments(intercept.parentLayoutKey);
    const relSegs = targetSegs.slice(parentSegs.length);
    if (relSegs.length === 0) continue;
    routes.push({
      path: relSegs.join("/"),
      element: <InterceptedRoute Interceptor={interceptorEl} Target={null} />,
    });
  }
  return { routes, defaultElement, ErrorComponent, NotFoundComponent };
}

function lowerInterceptor(node: Node, targetKey: string): ReactNode {
  if (node.files.loader) {
    console.warn(
      `[react-router-next] Loader on intercepting route "${targetKey}" is ignored. ` +
        `Interceptor loaders are not supported.`,
    );
  }
  if (node.files.layout) {
    console.warn(
      `[react-router-next] Layout on intercepting route "${targetKey}" is ignored. ` +
        `Interceptor layouts are not supported.`,
    );
  }
  const Page = node.files.page?.default;
  if (!Page) {
    throw new Error(
      `[react-router-next] Intercepting route at "${targetKey}" is missing page.tsx.`,
    );
  }
  const Loading = node.files.loading?.default;
  const ErrorComponent = node.files.error?.default;
  const NotFoundComponent = node.files["not-found"]?.default;
  const pageEl = renderComponent(Page, targetKey);
  if (!Loading && !ErrorComponent && !NotFoundComponent) return pageEl;
  return (
    <SegmentBoundary
      Loading={Loading}
      ErrorComponent={ErrorComponent}
      NotFoundComponent={NotFoundComponent}
    >
      {pageEl}
    </SegmentBoundary>
  );
}

function nodeToRoute(
  node: Node,
  segment: string | null,
  path: string,
  inheritedNotFound: ComponentType | undefined,
  intercepts: readonly Intercept[],
): RouteObject[] {
  const Layout = node.files.layout?.default;
  const Page = node.files.page?.default;
  const Loading = node.files.loading?.default;
  const ErrorEl = node.files.error?.default;
  const Template = node.files.template?.default;
  const OwnNotFound = node.files["not-found"]?.default;
  const NearestNotFound = OwnNotFound ?? inheritedNotFound;
  const loader =
    node.files.loader?.loader ??
    (node.files.loader?.default as LoaderFunction | undefined);

  const childRoutes: RouteObject[] = [];
  for (const [childSegment, childNode] of node.children) {
    const childPath = path === "" ? childSegment : `${path}/${childSegment}`;
    childRoutes.push(
      ...nodeToRoute(
        childNode,
        childSegment,
        childPath,
        NearestNotFound,
        intercepts,
      ),
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
    NearestNotFound &&
    inner.some((c) => c.path === "*") &&
    !inner.some((c) => c.index)
  ) {
    inner.unshift({ index: true, element: <NearestNotFound /> });
  }

  // A segment that owns a `not-found.tsx` claims all unmatched paths beneath it
  // via a splat child. Any deeper segment with its own `not-found.tsx` shadows
  // this one because its splat sits below in the tree and matches first.
  if (OwnNotFound && !inner.some((c) => c.path === "*")) {
    inner.push({ path: "*", element: <OwnNotFound /> });
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
              `Slot loaders are not supported.`,
          );
        }
        const slotIntercepts = intercepts.filter(
          (i) =>
            i.slotOwned &&
            i.parentLayoutKey === path &&
            i.slotName === slotName,
        );
        slotConfigs[slotName] = lowerSlotToConfig(
          slotNode,
          path,
          intercepts,
          slotIntercepts,
        );
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

  const errorElement: ReactElement | undefined =
    ErrorEl || OwnNotFound ? (
      <NotFoundBoundary NotFound={NearestNotFound} ErrorComponent={ErrorEl} />
    ) : undefined;

  return specs.map((spec) => {
    const route: RouteObject = { ...spec };

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
      const innerChildren = Loading
        ? [
            {
              element: <LoadingBoundary Loading={Loading} />,
              children: wrappedInner,
            },
          ]
        : wrappedInner;
      // When a layout owns this segment, attach `errorElement` to a pathless
      // wrapper INSIDE the layout's children rather than on the route itself.
      // react-router's `errorElement` replaces the *route's* element when an
      // error bubbles up to it, so putting it on the layout route would
      // unmount the layout when `notFound()` fires. The pathless wrapper has
      // no element of its own — when its `errorElement` fires, only the inner
      // subtree is replaced and the layout's `<Outlet>` keeps rendering the
      // not-found inside the surviving layout chrome (matching Next.js).
      route.children = errorElement
        ? [{ errorElement, children: innerChildren }]
        : innerChildren;
    } else if (Template) {
      if (errorElement) route.errorElement = errorElement;
      route.element = <TemplateRemount Template={Template} />;
      route.children = Loading
        ? [{ element: <LoadingBoundary Loading={Loading} />, children: inner }]
        : inner;
    } else if (Loading) {
      if (errorElement) route.errorElement = errorElement;
      route.element = <LoadingBoundary Loading={Loading} />;
      route.children = inner;
    } else if (pageEl && childRoutes.length === 0) {
      if (errorElement) route.errorElement = errorElement;
      route.element = pageEl;
      if (loader) route.loader = loader;
    } else if (inner.length > 0) {
      if (errorElement) route.errorElement = errorElement;
      route.children = inner;
    } else if (errorElement) {
      route.errorElement = errorElement;
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

/**
 * Find the `index: true` leaf under a parent layout. `findRouteByPath` may
 * return either the layout route or its index leaf directly, so handle both:
 * if `route` is itself an index leaf, return it; otherwise descend through
 * pathless wrapper routes (`LoadingBoundary`, `TemplateRemount`, route groups)
 * to find the index child. Returns `null` when the parent has no page.
 */
function findIndexLeaf(route: RouteObject | null): RouteObject | null {
  if (!route) return null;
  if (route.index) return route;
  if (!route.children) return null;
  for (const c of route.children) {
    if (c.index) return c;
    if (c.path === undefined && c.children) {
      const found = findIndexLeaf(c);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Find the path-matching route directly (NOT its inner index child). Used
 * for slot-owned intercepts where we need to wrap at the same depth as the
 * parent layout's outlet swaps between matched children, so the wrapper type
 * stays stable across the soft nav and React reconciles the inner page
 * instead of unmounting and remounting it.
 *
 * Contrast with `findRouteByPath`, which returns the index leaf when the
 * matched route has children (used by legacy intercepts to preserve any
 * `template.tsx` / `loading.tsx` wrapping above the page).
 */
function findRouteAtPath(
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
        const found = findRouteAtPath(r.children, targetSegments);
        if (found) return found;
      }
      continue;
    }
    if (r.path === head) {
      if (rest.length === 0) return r;
      if (r.children) {
        const found = findRouteAtPath(r.children, rest);
        if (found) return found;
      }
    }
  }
  return null;
}

function applyIntercept(
  rootRoute: RouteObject,
  intercept: Intercept,
  /**
   * Caches the *original* index element per parent layout so multiple slot-
   * owned intercepts under the same parent share the same Interceptor and the
   * index leaf is wrapped exactly once. Mutated as a side effect.
   */
  parentIndexCache: Map<string, ReactNode>,
): void {
  const segs = routeKeyToRrSegments(intercept.targetKey);
  // Slot-owned intercepts wrap at the route level (the depth at which the
  // parent layout's outlet swaps between matched children) so the outlet
  // sees the same wrapper type for both index and `:id`. Legacy intercepts
  // wrap at the inner page leaf so any `template.tsx` / `loading.tsx` above
  // it still applies to the interceptor's render.
  const target = intercept.slotOwned
    ? findRouteAtPath([rootRoute], segs)
    : findRouteByPath([rootRoute], segs);
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
  // Slot-owned intercepts: the interceptor renders
  // inside its `@slot`, and the main outlet's matched [id] route should
  // "freeze" to the parent layout's page on soft navigation, so the underlying
  // page (e.g. a photo grid) stays visible behind the modal slot. The actual
  // interceptor element is injected into the slot's `routes` by
  // `lowerSlotToConfig`; here we wrap both the target and the parent's index
  // leaf with `InterceptedRoute` so the outlet position renders the same
  // wrapper type whether the matched route is the index or the [id] — React
  // reconciles the wrapper and keeps the inner page mounted, avoiding a
  // remount flicker as the modal opens.
  //
  // Note: this is a static approximation of Next.js's "freeze to pre-nav URL"
  // — it always anchors to the parent layout's `page.tsx`, not whatever the
  // user navigated *from*. Sufficient for the canonical pattern; revisit if
  // freezing to deeper sibling URLs is needed.
  if (intercept.slotOwned) {
    const key = intercept.parentLayoutKey;
    let originalIndexEl: ReactNode;
    if (parentIndexCache.has(key)) {
      originalIndexEl = parentIndexCache.get(key) ?? null;
    } else {
      const parentSegs = routeKeyToRrSegments(key);
      const parentRoute = findRouteByPath([rootRoute], parentSegs);
      const indexLeaf = findIndexLeaf(parentRoute);
      originalIndexEl = indexLeaf?.element ?? null;
      parentIndexCache.set(key, originalIndexEl);
      if (originalIndexEl === null) {
        console.warn(
          `[react-router-next] Slot-owned intercepting route at "${intercept.folderPath}" ` +
            `cannot freeze: parent layout at "${key || "/"}" ` +
            `has no page.tsx. Soft navigation will render nothing in the main outlet.`,
        );
      } else if (indexLeaf) {
        indexLeaf.element = (
          <InterceptedRoute
            Interceptor={originalIndexEl}
            Target={originalIndexEl}
          />
        );
      }
    }
    target.element = (
      <InterceptedRoute Interceptor={originalIndexEl} Target={target.element} />
    );
    return;
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
  const [root] = nodeToRoute(tree.root, null, "", undefined, tree.intercepts);
  const parentIndexCache = new Map<string, ReactNode>();
  for (const intercept of tree.intercepts) {
    applyIntercept(root, intercept, parentIndexCache);
  }
  return [root];
}

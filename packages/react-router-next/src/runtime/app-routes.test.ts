import { isValidElement, type ComponentType, type ReactElement } from "react";
import type { RouteObject } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { buildRoutesFromModules, type RouteModuleMap } from "./app-routes";
import {
  InterceptedRoute,
  ParallelLayout,
  type SlotConfig,
} from "./parallel-routes";
import { ComponentWithParams, NotFoundBoundary } from "./route-components";

const APP_DIR = "/src/app";

function asElement<T>(value: unknown): ReactElement<T> {
  if (!isValidElement(value)) {
    throw new Error(
      `Expected a React element, got: ${Object.prototype.toString.call(value)}`,
    );
  }
  return value as ReactElement<T>;
}

function comp(name: string): ComponentType {
  const C: ComponentType = () => null;
  Object.defineProperty(C, "name", { value: name });
  return C;
}

function findChild(
  route: RouteObject,
  predicate: (r: RouteObject) => boolean,
): RouteObject {
  const found = route.children?.find(predicate);
  if (!found) throw new Error("child route not found");
  return found;
}

describe("buildRoutesFromModules — slot-owned intercepting routes", () => {
  const PhotosLayout = comp("PhotosLayout");
  const Feed = comp("Feed");
  const FullPage = comp("FullPage");
  const ModalDefault = comp("ModalDefault");
  const ModalPage = comp("ModalPage");

  const modules: RouteModuleMap = {
    [`${APP_DIR}/photos/layout.tsx`]: { default: PhotosLayout },
    [`${APP_DIR}/photos/page.tsx`]: { default: Feed },
    [`${APP_DIR}/photos/[id]/page.tsx`]: { default: FullPage },
    [`${APP_DIR}/photos/@modal/default.tsx`]: { default: ModalDefault },
    [`${APP_DIR}/photos/@modal/(.)[id]/page.tsx`]: { default: ModalPage },
  };

  it("wraps the main-tree [id] target with the parent layout's index element as Interceptor", () => {
    const [root] = buildRoutesFromModules(modules, APP_DIR);
    const photos = findChild(root, (r) => r.path === "photos");
    const idRoute = findChild(photos, (r) => r.path === ":id");
    const wrapper = asElement<{ Interceptor: unknown; Target: unknown }>(
      idRoute.element,
    );

    expect(wrapper.type).toBe(InterceptedRoute);

    // Interceptor is the feed (parent's index element), NOT the modal Dialog.
    // photos has no params, so the feed is rendered directly as <Feed />.
    const interceptor = asElement<Record<string, unknown>>(
      wrapper.props.Interceptor,
    );
    expect(interceptor.type).toBe(Feed);

    // Target is the original [id]/page.tsx element.
    const target = asElement<{ Component: ComponentType; route: string }>(
      wrapper.props.Target,
    );
    expect(target.type).toBe(ComponentWithParams);
    expect(target.props.Component).toBe(FullPage);
    expect(target.props.route).toBe("photos/[id]");
  });

  it("also wraps the parent's index leaf so the outlet renders the same wrapper type for both matched routes (no remount flicker)", () => {
    const [root] = buildRoutesFromModules(modules, APP_DIR);
    const photos = findChild(root, (r) => r.path === "photos");
    const indexLeaf = photos.children!.find((r) => r.index)!;
    const wrapper = asElement<{ Interceptor: unknown; Target: unknown }>(
      indexLeaf.element,
    );

    // Both children of the photos layout (index leaf and :id) now share the
    // same wrapper type, so React reconciles the Outlet position and the
    // inner feed stays mounted across the soft nav.
    expect(wrapper.type).toBe(InterceptedRoute);

    const interceptor = asElement<Record<string, unknown>>(
      wrapper.props.Interceptor,
    );
    const target = asElement<Record<string, unknown>>(wrapper.props.Target);
    // On the index leaf both branches resolve to the feed, regardless of nav type.
    expect(interceptor.type).toBe(Feed);
    expect(target.type).toBe(Feed);
  });

  it("injects an InterceptedRoute at :id into the @modal slot's routes", () => {
    const [root] = buildRoutesFromModules(modules, APP_DIR);
    const photos = findChild(root, (r) => r.path === "photos");
    const layoutEl = asElement<{
      slots: Record<string, SlotConfig>;
    }>(photos.element);
    expect(layoutEl.type).toBe(ParallelLayout);

    const slot = layoutEl.props.slots.modal;
    expect(slot).toBeDefined();
    const injected = slot.routes.find((r) => r.path === ":id");
    expect(injected).toBeDefined();

    const wrapper = asElement<{ Interceptor: unknown; Target: unknown }>(
      injected!.element,
    );
    expect(wrapper.type).toBe(InterceptedRoute);
    expect(wrapper.props.Target).toBeNull();

    const dialog = asElement<{ Component: ComponentType; route: string }>(
      wrapper.props.Interceptor,
    );
    expect(dialog.type).toBe(ComponentWithParams);
    expect(dialog.props.Component).toBe(ModalPage);
    expect(dialog.props.route).toBe("photos/[id]");
  });

  it("preserves the @modal slot's default element as the slot's defaultElement", () => {
    const [root] = buildRoutesFromModules(modules, APP_DIR);
    const photos = findChild(root, (r) => r.path === "photos");
    const layoutEl = asElement<{ slots: Record<string, SlotConfig> }>(
      photos.element,
    );
    const def = asElement<Record<string, unknown>>(
      layoutEl.props.slots.modal.defaultElement,
    );
    expect(def.type).toBe(ModalDefault);
  });
});

describe("buildRoutesFromModules — slot-owned intercept with template on the target", () => {
  it("wraps the route element above the template so the outlet sees a stable wrapper type", () => {
    const PhotosLayout = comp("PhotosLayout");
    const Feed = comp("Feed");
    const FullPage = comp("FullPage");
    const Template = comp("Template");
    const ModalDefault = comp("ModalDefault");
    const ModalPage = comp("ModalPage");

    const modules: RouteModuleMap = {
      [`${APP_DIR}/photos/layout.tsx`]: { default: PhotosLayout },
      [`${APP_DIR}/photos/page.tsx`]: { default: Feed },
      [`${APP_DIR}/photos/[id]/page.tsx`]: { default: FullPage },
      [`${APP_DIR}/photos/[id]/template.tsx`]: { default: Template },
      [`${APP_DIR}/photos/@modal/default.tsx`]: { default: ModalDefault },
      [`${APP_DIR}/photos/@modal/(.)[id]/page.tsx`]: { default: ModalPage },
    };

    const [root] = buildRoutesFromModules(modules, APP_DIR);
    const photos = findChild(root, (r) => r.path === "photos");
    const idRoute = findChild(photos, (r) => r.path === ":id");

    // The :id route's own element (NOT its inner index child) should be the
    // InterceptedRoute wrapper. The Target is the original TemplateRemount,
    // so on POP/hard-load the template still wraps the matched page.
    const wrapper = asElement<{ Interceptor: unknown; Target: unknown }>(
      idRoute.element,
    );
    expect(wrapper.type).toBe(InterceptedRoute);

    // Sibling index leaf is also wrapped — same wrapper type at the photos
    // outlet position prevents the feed from unmount/remount on soft nav.
    const indexLeaf = photos.children!.find((r) => r.index)!;
    const indexWrapper = asElement<{ Interceptor: unknown; Target: unknown }>(
      indexLeaf.element,
    );
    expect(indexWrapper.type).toBe(InterceptedRoute);

    // The :id route still keeps its template + inner page leaf children, so
    // POP renders TemplateRemount → Outlet → FullPage.
    expect(idRoute.children).toBeDefined();
    expect(idRoute.children!.some((c) => c.index)).toBe(true);
  });
});

describe("buildRoutesFromModules — legacy non-slot intercepting routes", () => {
  it("wraps the target with the interceptor's own page element (unchanged)", () => {
    const PhotosLayout = comp("PhotosLayout");
    const Feed = comp("Feed");
    const FullPage = comp("FullPage");
    const InterceptPage = comp("InterceptPage");

    const modules: RouteModuleMap = {
      [`${APP_DIR}/photos/layout.tsx`]: { default: PhotosLayout },
      [`${APP_DIR}/photos/page.tsx`]: { default: Feed },
      [`${APP_DIR}/photos/[id]/page.tsx`]: { default: FullPage },
      [`${APP_DIR}/photos/(.)[id]/page.tsx`]: { default: InterceptPage },
    };

    const [root] = buildRoutesFromModules(modules, APP_DIR);
    const photos = findChild(root, (r) => r.path === "photos");
    const idRoute = findChild(photos, (r) => r.path === ":id");
    const wrapper = asElement<{ Interceptor: unknown; Target: unknown }>(
      idRoute.element,
    );
    expect(wrapper.type).toBe(InterceptedRoute);

    const interceptor = asElement<{ Component: ComponentType; route: string }>(
      wrapper.props.Interceptor,
    );
    expect(interceptor.type).toBe(ComponentWithParams);
    expect(interceptor.props.Component).toBe(InterceptPage);
  });
});

describe("buildRoutesFromModules — per-segment not-found.tsx", () => {
  it("appends a splat fallback to a segment that owns a not-found.tsx", () => {
    const RootLayout = comp("RootLayout");
    const PostsLayout = comp("PostsLayout");
    const PostsPage = comp("PostsPage");
    const PostsNotFound = comp("PostsNotFound");

    const modules: RouteModuleMap = {
      [`${APP_DIR}/layout.tsx`]: { default: RootLayout },
      [`${APP_DIR}/posts/layout.tsx`]: { default: PostsLayout },
      [`${APP_DIR}/posts/page.tsx`]: { default: PostsPage },
      [`${APP_DIR}/posts/not-found.tsx`]: { default: PostsNotFound },
    };

    const [root] = buildRoutesFromModules(modules, APP_DIR);
    const posts = findChild(root, (r) => r.path === "posts");
    // Splat lives inside posts so any unmatched /posts/... renders PostsNotFound.
    function findSplatElement(r: RouteObject): ReactElement | null {
      if (r.path === "*" && isValidElement(r.element)) return r.element;
      for (const c of r.children ?? []) {
        const found = findSplatElement(c);
        if (found) return found;
      }
      return null;
    }
    const splatEl = findSplatElement(posts);
    expect(splatEl).not.toBeNull();
    expect(asElement(splatEl!).type).toBe(PostsNotFound);
  });

  it("nests the splat fallbacks so a deeper not-found shadows a shallower one", () => {
    const RootLayout = comp("RootLayout");
    const PostsLayout = comp("PostsLayout");
    const PostsNotFound = comp("PostsNotFound");
    const RootNotFound = comp("RootNotFound");

    const modules: RouteModuleMap = {
      [`${APP_DIR}/layout.tsx`]: { default: RootLayout },
      [`${APP_DIR}/not-found.tsx`]: { default: RootNotFound },
      [`${APP_DIR}/posts/layout.tsx`]: { default: PostsLayout },
      [`${APP_DIR}/posts/not-found.tsx`]: { default: PostsNotFound },
    };

    const [root] = buildRoutesFromModules(modules, APP_DIR);

    function collectSplats(
      r: RouteObject,
      out: ComponentType[] = [],
    ): ComponentType[] {
      if (r.path === "*" && isValidElement(r.element)) {
        out.push(asElement(r.element).type as ComponentType);
      }
      for (const c of r.children ?? []) collectSplats(c, out);
      return out;
    }
    const splats = collectSplats(root);
    // Both segments have their own splat — RR picks the deeper one for nested URLs.
    expect(splats).toContain(RootNotFound);
    expect(splats).toContain(PostsNotFound);
  });

  it("wires a NotFoundBoundary errorElement so notFound() inside a child renders the nearest ancestor not-found.tsx", () => {
    const RootLayout = comp("RootLayout");
    const PostsLayout = comp("PostsLayout");
    const PostPage = comp("PostPage");
    const PostError = comp("PostError");
    const PostsNotFound = comp("PostsNotFound");

    const modules: RouteModuleMap = {
      [`${APP_DIR}/layout.tsx`]: { default: RootLayout },
      [`${APP_DIR}/posts/layout.tsx`]: { default: PostsLayout },
      [`${APP_DIR}/posts/not-found.tsx`]: { default: PostsNotFound },
      [`${APP_DIR}/posts/[postId]/page.tsx`]: { default: PostPage },
      [`${APP_DIR}/posts/[postId]/error.tsx`]: { default: PostError },
    };

    const [root] = buildRoutesFromModules(modules, APP_DIR);
    const posts = findChild(root, (r) => r.path === "posts");
    const postId = findChild(posts, (r) => r.path === ":postId");
    const errorBoundary = asElement<{
      NotFound?: ComponentType;
      ErrorComponent?: ComponentType;
    }>(postId.errorElement);
    expect(errorBoundary.type).toBe(NotFoundBoundary);
    // Inherited from posts/not-found.tsx, even though [postId] has only error.tsx of its own.
    expect(errorBoundary.props.NotFound).toBe(PostsNotFound);
    expect(errorBoundary.props.ErrorComponent).toBe(PostError);
  });

  it("does not set an errorElement on segments with neither error.tsx nor own not-found.tsx", () => {
    const RootLayout = comp("RootLayout");
    const PostsLayout = comp("PostsLayout");
    const PostPage = comp("PostPage");

    const modules: RouteModuleMap = {
      [`${APP_DIR}/layout.tsx`]: { default: RootLayout },
      [`${APP_DIR}/posts/layout.tsx`]: { default: PostsLayout },
      [`${APP_DIR}/posts/[postId]/page.tsx`]: { default: PostPage },
    };

    const [root] = buildRoutesFromModules(modules, APP_DIR);
    const posts = findChild(root, (r) => r.path === "posts");
    const postId = findChild(posts, (r) => r.path === ":postId");
    expect(postId.errorElement).toBeUndefined();
    expect(posts.errorElement).toBeUndefined();
  });
});

describe("buildRoutesFromModules — optional catch-all [[...slug]]", () => {
  it("emits an index + splat pair under the parent", () => {
    const RootLayout = comp("RootLayout");
    const FilesPage = comp("FilesPage");

    const modules: RouteModuleMap = {
      [`${APP_DIR}/layout.tsx`]: { default: RootLayout },
      [`${APP_DIR}/files/[[...slug]]/page.tsx`]: { default: FilesPage },
    };

    const [root] = buildRoutesFromModules(modules, APP_DIR);
    const files = findChild(root, (r) => r.path === "files");
    const hasIndex = files.children?.some((c) => c.index) ?? false;
    const hasSplat = files.children?.some((c) => c.path === "*") ?? false;
    expect(hasIndex).toBe(true);
    expect(hasSplat).toBe(true);
  });
});

describe("buildRoutesFromModules — slot-owned intercept without parent page.tsx", () => {
  it("emits a warning and uses null as the Interceptor", () => {
    const PhotosLayout = comp("PhotosLayout");
    const FullPage = comp("FullPage");
    const ModalDefault = comp("ModalDefault");
    const ModalPage = comp("ModalPage");

    const modules: RouteModuleMap = {
      [`${APP_DIR}/photos/layout.tsx`]: { default: PhotosLayout },
      // no photos/page.tsx — nothing to freeze the outlet to.
      [`${APP_DIR}/photos/[id]/page.tsx`]: { default: FullPage },
      [`${APP_DIR}/photos/@modal/default.tsx`]: { default: ModalDefault },
      [`${APP_DIR}/photos/@modal/(.)[id]/page.tsx`]: { default: ModalPage },
    };

    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const [root] = buildRoutesFromModules(modules, APP_DIR);
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("cannot freeze: parent layout"),
    );
    warn.mockRestore();

    const photos = findChild(root, (r) => r.path === "photos");
    const idRoute = findChild(photos, (r) => r.path === ":id");
    const wrapper = asElement<{ Interceptor: unknown; Target: unknown }>(
      idRoute.element,
    );
    expect(wrapper.props.Interceptor).toBeNull();
  });
});

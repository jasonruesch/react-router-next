import type { ComponentType, ReactElement, ReactNode } from "react";
import {
  useLocation,
  useNavigationType,
  useParams,
  useRoutes,
  type RouteObject,
} from "react-router";

import { SegmentBoundary } from "./route-components";
import { parseRouteParams } from "./use-route-params";

export type SlotConfig = {
  routes: RouteObject[];
  defaultElement: ReactNode | null;
  ErrorComponent?: ComponentType;
  NotFoundComponent?: ComponentType;
};

type LayoutWithSlots = ComponentType<{
  params?: Record<string, string | string[] | undefined>;
  [slot: string]: unknown;
}>;

function SlotElement({ slot }: { slot: SlotConfig }): ReactElement {
  const matched = useRoutes(slot.routes);
  const content: ReactNode = matched ?? slot.defaultElement;
  // `useRoutes(...)` doesn't honor `errorElement` (only the top-level data
  // router does), so wrap the slot output in our framework boundary so the
  // slot's own `error.tsx` / `not-found.tsx` actually catch render errors
  // inside the slot subtree instead of letting them bubble out to the data
  // router's root boundary.
  return (
    <SegmentBoundary
      ErrorComponent={slot.ErrorComponent}
      NotFoundComponent={slot.NotFoundComponent}
    >
      {content}
    </SegmentBoundary>
  );
}

/**
 * Wraps a layout that owns one or more `@slot` parallel routes. Each slot is
 * rendered into a `SlotElement` whose content is driven by `useRoutes(slot.routes)`
 * — i.e. the slot's own subtree is matched against the current URL independently
 * of the main outlet. The matched element (or the slot's `default.tsx`) is
 * passed to the user's layout as a named prop. The main flow is reached via
 * `<Outlet />` inside the layout, matching the convention for non-parallel
 * layouts in this package.
 */
export function ParallelLayout({
  Component,
  slots,
  route,
}: {
  Component: LayoutWithSlots;
  slots: Record<string, SlotConfig>;
  route: string;
}): ReactElement {
  const rrParams = useParams();
  const slotProps: Record<string, ReactNode> = {};
  for (const [name, slot] of Object.entries(slots)) {
    slotProps[name] = <SlotElement key={name} slot={slot} />;
  }
  const params = route.includes("[")
    ? parseRouteParams(route, rrParams)
    : undefined;
  return <Component {...slotProps} params={params} />;
}

/**
 * Re-mounts its template on every URL change by keying it on `location.pathname`.
 * Mirrors Next.js `template.tsx` semantics: like a layout, but state is not
 * preserved across navigations. The template itself renders `<Outlet />` for
 * the matched child, matching the convention for layouts in this package.
 */
export function TemplateRemount({
  Template,
}: {
  Template: ComponentType;
}): ReactElement {
  const { pathname } = useLocation();
  return <Template key={pathname} />;
}

/**
 * Renders the interceptor element on PUSH/REPLACE (soft) navigation, and the
 * original target element on POP (back/forward) and initial loads. Mirrors
 * Next.js intercepting-route semantics: a deep link or refresh shows the full
 * page; an in-app click shows the interceptor (e.g. modal).
 */
export function InterceptedRoute({
  Interceptor,
  Target,
}: {
  Interceptor: ReactNode;
  Target: ReactNode;
}): ReactElement {
  const navType = useNavigationType();
  return <>{navType === "POP" ? Target : Interceptor}</>;
}

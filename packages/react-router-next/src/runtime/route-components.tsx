import {
  Component,
  Suspense,
  createContext,
  useContext,
  type ComponentType,
  type ReactElement,
  type ReactNode,
} from "react";
import {
  Outlet,
  useLocation,
  useNavigation,
  useParams,
  useRouteError as rrUseRouteError,
} from "react-router";
import { isNotFoundError } from "./not-found";
import { SuspensePendingMarker } from "./route-pending";
import { parseRouteParams } from "./use-route-params";

type RouteParamsRecord = Record<string, string | string[] | undefined>;

/**
 * Sentinel distinguishing "no error caught by a framework-managed boundary"
 * from "an error whose value happens to be undefined". Lets `useRouteError`
 * decide whether to read from a framework boundary or fall back to
 * react-router's data-router state.
 */
const NO_BOUNDARY_ERROR = Symbol("rrn:no-boundary-error");

const BoundaryRouteErrorContext = createContext<unknown>(NO_BOUNDARY_ERROR);

/**
 * Drop-in replacement for react-router's `useRouteError` that ALSO works
 * inside `error.tsx` files rendered by framework-managed boundaries in slot
 * and intercept subtrees. Those subtrees don't sit on data-router routes
 * with `id`s, so calling react-router's `useRouteError` directly throws an
 * invariant (`useRouteError can only be used on routes that contain a unique
 * "id"`). When the framework boundary captured an error we return it
 * directly and never delegate; otherwise we fall through to react-router's
 * hook so this works for normal data-router `error.tsx` files too.
 */
export function useRouteError(): unknown {
  const fromBoundary = useContext(BoundaryRouteErrorContext);
  if (fromBoundary !== NO_BOUNDARY_ERROR) return fromBoundary;
  return rrUseRouteError();
}

export function LoadingBoundary({
  Loading,
}: {
  Loading: ComponentType;
}): ReactElement {
  const nav = useNavigation();
  const location = useLocation();
  if (nav.state === "loading") return <Loading />;
  // Key the boundary by location so navigating between siblings under the same
  // layout unmounts the previous subtree. Without this, React's transition
  // semantics keep the already-revealed content on screen while the new child
  // suspends, and the fallback never fires.
  return (
    <Suspense
      key={location.key}
      fallback={
        <>
          <SuspensePendingMarker />
          <Loading />
        </>
      }
    >
      <Outlet />
    </Suspense>
  );
}

export function ComponentWithParams({
  Component: C,
  route,
}: {
  Component: ComponentType<{ params?: RouteParamsRecord }>;
  route: string;
}): ReactElement {
  const rrParams = useParams();
  const params = parseRouteParams(route, rrParams);
  return <C params={params} />;
}

/**
 * Route `errorElement` wrapper that delegates `notFound()` throws to the
 * nearest ancestor (or own) `not-found.tsx`, and all other errors to the
 * segment's `error.tsx` if one is defined.
 */
export function NotFoundBoundary({
  NotFound,
  ErrorComponent,
}: {
  NotFound?: ComponentType;
  ErrorComponent?: ComponentType;
}): ReactElement | null {
  const error = rrUseRouteError();
  if (isNotFoundError(error)) {
    if (NotFound) return <NotFound />;
    if (ErrorComponent) return <ErrorComponent />;
    return null;
  }
  if (ErrorComponent) return <ErrorComponent />;
  if (NotFound) return <NotFound />;
  return null;
}

type SegmentBoundaryProps = {
  ErrorComponent?: ComponentType;
  NotFoundComponent?: ComponentType;
  children: ReactNode;
};

type SegmentBoundaryState = {
  caught: boolean;
  error: unknown;
};

/**
 * React class error boundary used inside subtrees that the data router can't
 * wire `errorElement` for — specifically the routes returned by a slot's
 * `useRoutes(...)` call and the element rendered by an intercepting route.
 * Catches render errors thrown by descendants, renders the segment's
 * `error.tsx` (or `not-found.tsx` for `notFound()` throws), and exposes the
 * caught error to those components via `useRouteError`. If no matching
 * boundary file exists at this segment, re-throws so a higher-up boundary
 * (data router or another `SegmentErrorBoundary`) can handle it.
 */
class SegmentErrorBoundary extends Component<
  SegmentBoundaryProps,
  SegmentBoundaryState
> {
  state: SegmentBoundaryState = { caught: false, error: undefined };

  static getDerivedStateFromError(error: unknown): SegmentBoundaryState {
    return { caught: true, error };
  }

  render(): ReactNode {
    if (!this.state.caught) return this.props.children;
    const { error } = this.state;
    const { ErrorComponent, NotFoundComponent } = this.props;
    if (isNotFoundError(error)) {
      if (NotFoundComponent) {
        return (
          <BoundaryRouteErrorContext.Provider value={error}>
            <NotFoundComponent />
          </BoundaryRouteErrorContext.Provider>
        );
      }
      // Re-throw during render: the next ancestor boundary handles it.
      throw error;
    }
    if (ErrorComponent) {
      return (
        <BoundaryRouteErrorContext.Provider value={error}>
          <ErrorComponent />
        </BoundaryRouteErrorContext.Provider>
      );
    }
    throw error;
  }
}

/**
 * Wraps `SegmentErrorBoundary` (and an optional Suspense for `loading.tsx`)
 * and re-keys both by the current `location.key`, so a navigation away from
 * a route that triggered the boundary remounts a fresh, error-free instance
 * instead of latching the previous error forever.
 */
export function SegmentBoundary({
  ErrorComponent,
  NotFoundComponent,
  Loading,
  children,
}: {
  ErrorComponent?: ComponentType;
  NotFoundComponent?: ComponentType;
  Loading?: ComponentType;
  children: ReactNode;
}): ReactElement {
  const location = useLocation();
  const inner = Loading ? (
    <Suspense
      key={location.key}
      fallback={
        <>
          <SuspensePendingMarker />
          <Loading />
        </>
      }
    >
      {children}
    </Suspense>
  ) : (
    <>{children}</>
  );
  if (!ErrorComponent && !NotFoundComponent) return inner;
  return (
    <SegmentErrorBoundary
      key={location.key}
      ErrorComponent={ErrorComponent}
      NotFoundComponent={NotFoundComponent}
    >
      {inner}
    </SegmentErrorBoundary>
  );
}

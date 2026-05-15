import { Suspense, type ComponentType, type ReactElement } from "react";
import {
  Outlet,
  useLocation,
  useNavigation,
  useParams,
  useRouteError,
} from "react-router";
import { isNotFoundError } from "./not-found";
import { SuspensePendingMarker } from "./route-pending";
import { parseRouteParams } from "./use-route-params";

type RouteParamsRecord = Record<string, string | string[] | undefined>;

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
  Component,
  route,
}: {
  Component: ComponentType<{ params?: RouteParamsRecord }>;
  route: string;
}): ReactElement {
  const rrParams = useParams();
  const params = parseRouteParams(route, rrParams);
  return <Component params={params} />;
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
  const error = useRouteError();
  if (isNotFoundError(error)) {
    if (NotFound) return <NotFound />;
    if (ErrorComponent) return <ErrorComponent />;
    return null;
  }
  if (ErrorComponent) return <ErrorComponent />;
  if (NotFound) return <NotFound />;
  return null;
}

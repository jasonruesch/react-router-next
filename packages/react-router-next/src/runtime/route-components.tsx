import type { ComponentType, ReactElement } from "react";
import { Outlet, useNavigation, useParams } from "react-router";
import { parseRouteParams } from "./use-route-params";

type RouteParamsRecord = Record<string, string | string[] | undefined>;

export function LoadingBoundary({
  Loading,
}: {
  Loading: ComponentType;
}): ReactElement {
  const nav = useNavigation();
  return nav.state === "loading" ? <Loading /> : <Outlet />;
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

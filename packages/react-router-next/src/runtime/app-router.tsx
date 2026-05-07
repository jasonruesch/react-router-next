import type { JSX } from "react";
import { createBrowserRouter, RouterProvider } from "react-router";
// @ts-expect-error virtual module is provided by the routeTypegen Vite plugin at build/dev time.
import { modules, appDir } from "virtual:react-router-next/app-tree";
import { buildRoutesFromModules, type RouteModuleMap } from "./app-routes";

const router = createBrowserRouter(
  buildRoutesFromModules(modules as RouteModuleMap, appDir as string),
);

export default function AppRouter(): JSX.Element {
  return <RouterProvider router={router} />;
}

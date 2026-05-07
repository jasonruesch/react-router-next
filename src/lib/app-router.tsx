import type { JSX } from "react";
import { createBrowserRouter, RouterProvider } from "react-router";
import { buildRoutes } from "./app-routes";

const router = createBrowserRouter(buildRoutes());

export default function AppRouter(): JSX.Element {
  return <RouterProvider router={router} />;
}

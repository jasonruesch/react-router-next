import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// import { AppRouter } from "@evolonix/react-router-next";
import { buildRoutesFromModules } from "@evolonix/react-router-next";
import { createBrowserRouter, RouterProvider } from "react-router";
import { appDir, modules } from "virtual:react-router-next/app-tree";
import { ThemeProvider } from "./components/theme-provider";

import "./index.css";

// Example of building routes from modules. You can also define routes manually if you prefer.
const routes = buildRoutesFromModules(modules, appDir);
// Update routes if needed before creating the router...
const router = createBrowserRouter(routes, {
  basename: import.meta.env.BASE_URL,
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      {/* <AppRouter /> */}
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>,
);

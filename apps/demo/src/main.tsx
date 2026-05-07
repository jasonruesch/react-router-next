import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AppRouter } from "@evolonix/react-router-next";
import { ThemeProvider } from "./components/theme-provider";

import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <AppRouter />
    </ThemeProvider>
  </StrictMode>,
);

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import { generateRouteTypes } from "./src/lib/typegen.mjs";

const PAGE_OR_LAYOUT = /[\\/](page|layout)\.(t|j)sx?$/;

function routeTypegen(): Plugin {
  const run = () => generateRouteTypes();
  return {
    name: "route-typegen",
    buildStart() {
      run();
    },
    configureServer(server) {
      server.watcher.on("add", (p) => {
        if (PAGE_OR_LAYOUT.test(p)) run();
      });
      server.watcher.on("unlink", (p) => {
        if (PAGE_OR_LAYOUT.test(p)) run();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [routeTypegen(), react(), tailwindcss()],
});

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { routeTypegen } from "@evolonix/react-router-next/vite";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [routeTypegen(), react(), tailwindcss()],
});

import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    vite: "src/vite.ts",
    cli: "src/cli.ts",
  },
  format: ["esm"],
  target: "node20",
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: false,
  shims: false,
  external: ["react", "react-dom", "react-router", "vite"],
  // The runtime imports a Vite virtual module — leave it unresolved in the
  // bundle so the consumer's Vite plugin can serve it.
  noExternal: [],
  esbuildOptions(options) {
    options.external = [
      ...(options.external ?? []),
      "virtual:react-router-next/app-tree",
    ];
  },
});

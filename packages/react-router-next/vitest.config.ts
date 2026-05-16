import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
    environmentMatchGlobs: [["src/**/*.dom.test.{ts,tsx}", "jsdom"]],
    setupFiles: ["./src/runtime/dom-test-setup.ts"],
    // jsdom rewrites web-API globals (e.g. AbortSignal) which breaks
    // react-router's navigation Request() when run in the default thread
    // pool alongside node-env tests. Forks give each file its own process.
    pool: "forks",
  },
});

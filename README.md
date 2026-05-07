# react-router-next

Workspace monorepo containing **`react-router-next`** — a publishable npm package that brings Next.js-style filesystem routing to React Router 7 — and **`demo`**, the example app that exercises every feature of the package.

## Layout

```
.
├── packages/
│   └── react-router-next/   # published library + Vite plugin + CLI
└── apps/
    └── demo/                # example app, depends on react-router-next via workspace
```

### `packages/react-router-next/`

The library that ships to npm. See [`packages/react-router-next/README.md`](packages/react-router-next/README.md) for installation and usage. Three entry points:

- **`react-router-next`** — runtime: `AppRouter`, `useRouteParams`, `parseRouteParams`, `generateUrl`, and the `RouteParams` / `RouteProps` types.
- **`react-router-next/vite`** — the `routeTypegen` Vite plugin and a programmatic `generateRouteTypes` API.
- **`react-router-next` bin** — `react-router-next typegen` for prebuild and CI use without Vite.

How types reach consumers is hybrid: at runtime, the Vite plugin serves per-route virtual modules (`virtual:react-router-next/<route-key>`); for type-checking, the plugin and CLI emit a single ambient `routes.d.ts` shim into `node_modules/.react-router-next/`, so `tsc` and editors infer per-route param shapes without Vite running.

### `apps/demo/`

A Vite + React 19 app that consumes the workspace package and demonstrates every routing feature: nested layouts, route groups (`(marketing)`), dynamic segments (`[postId]`), catch-all (`[...slug]`), optional and optional catch-all (`[[query]]`, `[[...slug]]`), per-route loaders, loading boundaries, error boundaries, and a 404. Long-form documentation of the conventions lives in [`apps/demo/docs/app-router.md`](apps/demo/docs/app-router.md).

## Working in the repo

From the repo root:

```sh
npm install                       # install all workspaces
npm run build                     # build the package, then build the demo
npm run dev                       # start the demo's Vite dev server
```

Per-workspace commands use npm workspaces:

```sh
npm run build -w react-router-next   # build the library (tsup → dist/)
npm run dev   -w react-router-next   # tsup --watch
npm run build -w demo                # tsc -b && vite build
npm run dev   -w demo                # vite dev server
npm run typegen -w demo              # regenerate the routes.d.ts shim
```

## Requirements

- Node ≥ 20
- npm ≥ 9 (uses npm workspaces)

# react-router-next

Next.js-style filesystem routing for React Router 7, delivered as a Vite plugin plus a tiny runtime. Drop a `page.tsx` into a folder, get a typed route — including typed params, typed `generate(...)` URL builders, nested layouts/loaders/loading/error boundaries, parallel routes (`@slot`), intercepting routes (`(.)`/`(..)`/`(...)`), `template.tsx` remount-on-navigation, and `_private` colocation folders.

> Peer dependencies: `react ≥ 19`, `react-dom ≥ 19`, `react-router ≥ 7`, `vite ≥ 5`.

## Install

```sh
npm i @evolonix/react-router-next react-router
```

## Quick start

### 1. Add the Vite plugin

```ts
// vite.config.ts
import react from "@vitejs/plugin-react";
import { routeTypegen } from "@evolonix/react-router-next/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [routeTypegen(), react()],
});
```

### 2. Mount the router

```tsx
// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AppRouter } from "@evolonix/react-router-next";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>,
);
```

### 3. Drop pages into `src/app/`

```
src/app/
├── layout.tsx                 # wraps everything below
├── page.tsx                   # /
├── not-found.tsx              # not-found boundary (root only)
├── (marketing)/               # route group — folder name in (parens) is stripped
│   ├── about/page.tsx         # /about
│   └── pricing/page.tsx       # /pricing
├── posts/
│   ├── layout.tsx             # /posts/*
│   ├── loader.ts              # parent loader
│   ├── loading.tsx            # skeleton during nav
│   ├── page.tsx               # /posts (index)
│   └── [postId]/
│       ├── loader.ts          # leaf loader
│       ├── error.tsx          # error boundary
│       └── page.tsx           # /posts/:postId
├── dashboard/                 # parallel-route slots
│   ├── layout.tsx             # function ({ analytics }) — main flow via <Outlet/>
│   ├── page.tsx               # /dashboard main panel
│   ├── settings/page.tsx      # /dashboard/settings main panel
│   └── @analytics/            # parallel slot — invisible in URL
│       ├── page.tsx           # rendered for /dashboard
│       ├── settings/page.tsx  # rendered for /dashboard/settings
│       └── default.tsx        # fallback when slot has no match
└── photos/
    ├── page.tsx               # /photos
    ├── [id]/
    │   ├── page.tsx           # full-page detail
    │   └── template.tsx       # remounts on every navigation
    ├── (.)[id]/page.tsx       # modal interceptor — rendered on PUSH/REPLACE
    └── _components/           # private folder — never routed, importable
        └── dialog.tsx
```

Folder-name conventions:

| Pattern       | URL effect                                                           | TypeScript shape        |
| ------------- | -------------------------------------------------------------------- | ----------------------- |
| `foo`         | `/foo`                                                               | —                       |
| `(group)`     | (segment removed)                                                    | —                       |
| `[id]`        | `:id`                                                                | `{ id: string }`        |
| `[[id]]`      | `:id?` (optional)                                                    | `{ id?: string }`       |
| `[...slug]`   | catch-all                                                            | `{ slug: string[] }`    |
| `[[...slug]]` | optional catch-all                                                   | `{ slug?: string[] }`   |
| `@slot`       | (segment removed) — contents become a slot prop on the parent layout | —                       |
| `_private`    | folder is skipped by routing (still importable from siblings)        | —                       |
| `(.)x`        | intercepts URL `<parent>/x` — same level as containing folder        | inherits `x`'s shape    |
| `(..)x`       | intercepts one filesystem level up                                   | inherits target's shape |
| `(..)(..)x`   | intercepts two filesystem levels up                                  | inherits target's shape |
| `(...)x`      | intercepts `/x` from the app root                                    | inherits target's shape |

File-name conventions inside a route folder:

| File            | Role                                                                                                                                    |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `page.tsx`      | Leaf component for the route                                                                                                            |
| `layout.tsx`    | Wraps children via `<Outlet/>`. With sibling `@slot/` folders, the layout also receives each slot as a named prop alongside the outlet. |
| `template.tsx`  | Like `layout.tsx` but remounts on every navigation (keyed on `pathname`).                                                               |
| `default.tsx`   | Fallback inside a `@slot/` directory when the URL doesn't match any of the slot's pages.                                                |
| `loader.ts`     | React Router data loader                                                                                                                |
| `loading.tsx`   | Rendered while a parent loader is pending                                                                                               |
| `error.tsx`     | `errorElement` for the route                                                                                                            |
| `not-found.tsx` | App-wide not-found boundary (root only)                                                                                                 |

### 4. Use the typed helpers

For each route folder the plugin exposes a virtual module — `virtual:react-router-next/<route-key>` — that mirrors the folder layout, with the root represented as `_root`:

The runtime renders each `page.tsx` with its `RouteProps` already wired up — `params` is parsed from the URL (typed from the folder name) and passed in as a prop, so the component can destructure it directly without calling `useParams`/`useRouteParams`. The virtual module only exports `RouteProps` (and `useRouteParams`) for routes that actually have params; paramless routes can omit the prop entirely.

```tsx
// src/app/posts/[postId]/page.tsx
import type { RouteProps } from "virtual:react-router-next/posts/[postId]";
import { useLoaderData } from "react-router";
import type { Post } from "../loader";

export default function PostPage({ params }: RouteProps) {
  const post = useLoaderData<Post>();
  return (
    <article>
      {post.title} (id: {params.postId})
    </article>
  );
}
```

```tsx
// any other component
import { generate as generatePost } from "virtual:react-router-next/posts/[postId]";

<NavLink to={generatePost({ postId: "1" })}>First post</NavLink>;
```

```tsx
// src/app/posts/[postId]/page.tsx
import { useRouteParams } from "virtual:react-router-next/posts/[postId]";

export default function PostPage() {
  const { postId } = useRouteParams();
  return <article>Post id: {postId}</article>;
}
```

The runtime hook `useRouteParams` is also re-exported from the package itself if you'd rather not pin the route literal:

```tsx
import { useRouteParams } from "@evolonix/react-router-next";
const { postId } = useRouteParams("posts/[postId]");
```

## Build your own router

`<AppRouter />` is a thin wrapper around `createBrowserRouter` plus the package's filesystem-to-`RouteObject[]` builder. If you need a different router (memory router for tests, hash router, SSR via `createStaticRouter`, custom `RouterProvider` props, route post-processing, etc.) import the builder directly and feed it the same virtual module the default router uses:

```tsx
// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import {
  buildRoutesFromModules,
  type RouteModuleMap,
} from "@evolonix/react-router-next";
// @ts-expect-error virtual module is provided by the routeTypegen Vite plugin
import { modules, appDir } from "virtual:react-router-next/app-tree";

const routes = buildRoutesFromModules(modules as RouteModuleMap, appDir);
const router = createBrowserRouter(routes);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
```

The returned `RouteObject[]` is plain React Router 7 — pass it to any router factory, splice in extra routes, or wrap the elements before mounting.

## Parallel routes (`@slot`)

A folder prefixed with `@` doesn't contribute a URL segment — instead, its contents are matched independently against the current URL and rendered in the parent layout as a named prop. The main flow still comes through `<Outlet />`; the layout's signature gains one extra prop per slot:

```tsx
// src/app/dashboard/layout.tsx
import { Outlet } from "react-router";

export default function DashboardLayout({
  analytics,
}: {
  analytics: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[2fr_1fr]">
      <main>
        <Outlet />
      </main>
      <aside>{analytics}</aside>
    </div>
  );
}
```

Each slot subtree can have its own `page.tsx` files (matching the parent's URL space) and a `default.tsx` fallback rendered when the URL doesn't match any of the slot's explicit pages.

> **V1 caveat:** slot subtrees are matched via `useRoutes()` outside React Router's data router, so a `loader.ts` under a `@slot/` directory is dropped with a build-time warning. Use ordinary children for data-driven UI.

## Intercepting routes (`(.)`/`(..)`/`(...)`)

A folder whose name starts with `(.)`, `(..)`, `(..)(..)`, or `(...)` is an **interceptor**: its `page.tsx` is rendered when the user soft-navigates (PUSH/REPLACE) to a target URL elsewhere in the tree. On reload, back/forward, or direct visit, the original target page renders instead. The interceptor and the target share the same routeKey and `useRouteParams`/`generate` virtual module.

```
photos/
├── page.tsx              # /photos
├── [id]/page.tsx         # /photos/:id — full-page detail (POP / refresh)
└── (.)[id]/page.tsx      # /photos/:id — modal (PUSH / REPLACE from in-app Link)
```

Prefix semantics (counted in **filesystem** levels — slots count, group folders count, but the prefix itself does not):

- `(.)x` — same level as the interceptor's containing folder; appends `x`.
- `(..)x` — pops one filesystem level above, then appends `x`.
- `(..)(..)x` — pops two levels.
- `(...)x` — anchors at the app root.

> **V1 caveats:** the interceptor folder may only contain `page.tsx`. A `loader.ts` or `layout.tsx` inside an interceptor is dropped with a build-time warning. The intercept target route must exist — otherwise the build fails (a refresh on the URL has to render _something_).

## `template.tsx` and `_private` folders

- `template.tsx` works like `layout.tsx`, but the wrapper is keyed on `useLocation().pathname` so it remounts on every navigation. Useful for entry transitions or `useEffect`-based instrumentation that should fire per-navigation.
- A folder whose name starts with `_` is skipped by the router entirely. Use it to colocate components, helpers, or fixtures alongside your routes without producing a URL.

## How types work without running Vite

The plugin (and the bundled `react-router-next` CLI) emit a single ambient `routes.d.ts` shim into `node_modules/.react-router-next/`. The shim contains one `declare module 'virtual:react-router-next/<route-key>' { … }` block per discovered route, so `tsc` and editors resolve the imports and infer per-route param shapes — even when Vite isn't running.

Add the shim to your tsconfig:

```jsonc
// tsconfig.app.json
{
  "include": ["src", "node_modules/.react-router-next/routes.d.ts"],
}
```

In CI, run typegen before `tsc`:

```jsonc
// package.json
{
  "scripts": {
    "typegen": "react-router-next typegen",
    "prebuild": "npm run typegen",
    "build": "tsc -b && vite build",
  },
}
```

## Plugin options

```ts
routeTypegen({
  appDir: "src/app", // default
  outDir: "node_modules/.react-router-next", // default
});
```

The CLI mirrors these:

```sh
react-router-next typegen \
  --app-dir=src/app \
  --out-dir=node_modules/.react-router-next
```

## License

MIT

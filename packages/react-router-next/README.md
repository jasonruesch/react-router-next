# react-router-next

Next.js-style filesystem routing for React Router 7, delivered as a Vite plugin plus a tiny runtime. Drop a `page.tsx` into a folder, get a typed route — including typed params, typed `generate(...)` URL builders, and nested layouts/loaders/loading/error boundaries.

> Peer dependencies: `react ≥ 19`, `react-dom ≥ 19`, `react-router ≥ 7`, `vite ≥ 5`.

## Install

```sh
npm i react-router-next react-router
```

## Quick start

### 1. Add the Vite plugin

```ts
// vite.config.ts
import react from "@vitejs/plugin-react";
import { routeTypegen } from "react-router-next/vite";
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
import { AppRouter } from "react-router-next";

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
├── 404.tsx                    # not-found
├── (marketing)/               # route group — folder name in (parens) is stripped
│   ├── about/page.tsx         # /about
│   └── pricing/page.tsx       # /pricing
└── posts/
    ├── layout.tsx             # /posts/*
    ├── loader.ts              # parent loader
    ├── loading.tsx            # skeleton during nav
    ├── page.tsx               # /posts (index)
    └── [postId]/
        ├── loader.ts          # leaf loader
        ├── error.tsx          # error boundary
        └── page.tsx           # /posts/:postId
```

Folder-name conventions:

| Pattern        | URL effect             | TypeScript shape          |
|----------------|------------------------|---------------------------|
| `foo`          | `/foo`                 | —                         |
| `(group)`      | (segment removed)      | —                         |
| `[id]`         | `:id`                  | `{ id: string }`          |
| `[[id]]`       | `:id?` (optional)      | `{ id?: string }`         |
| `[...slug]`    | catch-all              | `{ slug: string[] }`      |
| `[[...slug]]`  | optional catch-all     | `{ slug?: string[] }`     |

File-name conventions inside a route folder:

| File         | Role                                       |
|--------------|--------------------------------------------|
| `page.tsx`   | Leaf component for the route               |
| `layout.tsx` | Wraps children via `<Outlet/>`             |
| `loader.ts`  | React Router data loader                   |
| `loading.tsx`| Rendered while a parent loader is pending  |
| `error.tsx`  | `errorElement` for the route               |
| `404.tsx`    | App-wide not-found boundary (root only)    |

### 4. Use the typed helpers

For each route folder the plugin exposes a virtual module — `virtual:react-router-next/<route-key>` — that mirrors the folder layout, with the root represented as `_root`:

```tsx
// src/app/posts/[postId]/page.tsx
import type { RouteProps } from "virtual:react-router-next/posts/[postId]";
import { useLoaderData } from "react-router";
import type { Post } from "../loader";

export default function PostPage({ params }: RouteProps) {
  const post = useLoaderData<Post>();
  return <article>{post.title} (id: {params.postId})</article>;
}
```

```tsx
// any other component
import { generate as generatePost } from "virtual:react-router-next/posts/[postId]";

<NavLink to={generatePost({ postId: "1" })}>First post</NavLink>;
```

The runtime hook `useRouteParams` is also re-exported from the package itself if you'd rather not pin the route literal:

```tsx
import { useRouteParams } from "react-router-next";
const { postId } = useRouteParams("posts/[postId]");
```

## How types work without running Vite

The plugin (and the bundled `react-router-next` CLI) emit a single ambient `routes.d.ts` shim into `node_modules/.react-router-next/`. The shim contains one `declare module 'virtual:react-router-next/<route-key>' { … }` block per discovered route, so `tsc` and editors resolve the imports and infer per-route param shapes — even when Vite isn't running.

Add the shim to your tsconfig:

```jsonc
// tsconfig.app.json
{
  "include": ["src", "node_modules/.react-router-next/routes.d.ts"]
}
```

In CI, run typegen before `tsc`:

```jsonc
// package.json
{
  "scripts": {
    "typegen": "react-router-next typegen",
    "prebuild": "npm run typegen",
    "build": "tsc -b && vite build"
  }
}
```

## Plugin options

```ts
routeTypegen({
  appDir: "src/app",                          // default
  outDir: "node_modules/.react-router-next",  // default
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

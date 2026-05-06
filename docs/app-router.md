# App Router demo

The local file-based router lives in [`src/lib/AppRouter.tsx`](../src/lib/AppRouter.tsx). It uses `import.meta.glob` to discover files under `src/app/`, builds a segment tree, and converts it to a React Router 7 `RouteObject[]` mounted via `createBrowserRouter` + `RouterProvider`.

## File structure

```
src/app/
├── layout.tsx                            # Root layout + top nav + global loading bar
├── page.tsx                              # /  — feature index hub
├── 404.tsx                               # Not-found page
├── (marketing)/                          # Route GROUP — invisible to URL
│   ├── about/page.tsx                    # /about
│   └── pricing/page.tsx                  # /pricing
├── posts/                                # LAYOUT + LOADER + LOADING
│   ├── layout.tsx                        # Section header, wraps children in <Outlet />
│   ├── loader.ts                         # List loader (600 ms delay); exports Post + POSTS
│   ├── loading.tsx                       # Skeleton shown during sibling navigation
│   ├── page.tsx                          # /posts list
│   └── [postId]/                         # DYNAMIC + ERROR
│       ├── loader.ts                     # Per-post loader; throws on /posts/999
│       ├── error.tsx                     # Errors caught here keep parent layouts mounted
│       └── page.tsx                      # /posts/:postId
├── docs/[...slug]/page.tsx               # CATCH-ALL — matched value at params["*"]
├── search/[[query]]/page.tsx             # OPTIONAL — :query?
└── files/[[...slug]]/page.tsx            # OPTIONAL CATCH-ALL — index + "*" siblings
```

## File conventions

| File                       | Purpose                                                 | Maps to                                                                                                |
| -------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `page.tsx`                 | Leaf route element                                      | route's `element` (or `index: true` child if siblings/layout exist)                                    |
| `layout.tsx`               | Wraps children via `<Outlet />`                         | parent route's `element`                                                                               |
| `loader.ts` / `loader.tsx` | React Router loader (named export `loader`, or default) | route's `loader`                                                                                       |
| `loading.tsx`              | Skeleton/fallback during navigation                     | injected boundary that swaps `<Outlet />` for the loader UI when `useNavigation().state === "loading"` |
| `error.tsx`                | Error boundary                                          | route's `errorElement` (read with `useRouteError()`)                                                   |
| `404.tsx`                  | Not-found page                                          | top-level `{ path: "*" }` route                                                                        |

## Segment conventions

| Folder name    | URL segment                                                                                                                                                         |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `users/`       | `/users`                                                                                                                                                            |
| `[id]/`        | `/:id` (dynamic)                                                                                                                                                    |
| `[[id]]/`      | `/:id?` (optional)                                                                                                                                                  |
| `[...slug]/`   | `/*` (catch-all — matched value at `params["*"]`; the bare parent path 404s, matching Next.js — the router injects an `index` sibling that renders the 404 element) |
| `[[...slug]]/` | bare path **and** `/*` (optional catch-all — emitted as a sibling index route + splat route, both pointing at the same `page.tsx`)                                  |
| `(group)/`     | nothing (route group; folder exists but contributes no URL segment)                                                                                                 |

## Typed params

`useParams()` from React Router types every value as `string | undefined` and exposes catch-alls as a slash-joined string at `params["*"]`. The [`useRouteParams`](../src/lib/useRouteParams.ts) hook takes a route literal and returns a precisely-typed object that matches Next.js's [dynamic-route shape](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes#typescript) — including `string[]` for catch-alls and optional keys (`?:`) for optional segments.

| Route literal       | Returned shape                   |
| ------------------- | -------------------------------- |
| `posts/[postId]`    | `{ postId: string }`             |
| `search/[[query]]`  | `{ query?: string }`             |
| `docs/[...slug]`    | `{ slug: string[] }`             |
| `files/[[...slug]]` | `{ slug?: string[] }`            |
| `(marketing)/about` | `{}` (groups contribute nothing) |

Pages and layouts also receive their parsed params as a `params` prop — the router wraps each page/layout component and injects them. Use `PageProps<S>` for the typed signature:

```tsx
import type { PageProps } from "../../../lib/useRouteParams";

export default function PostPage({ params }: PageProps<"posts/[postId]">) {
  // params: { postId: string }
}
```

The prop is always passed, but components that don't need it can keep a no-arg signature (`function HomePage() { ... }`) — the extra prop is simply ignored. The `useRouteParams` hook remains available for components that prefer the hook style.

Loaders use the same runtime extractor:

```ts
import { parseRouteParams } from "../../../lib/useRouteParams";

export const loader: LoaderFunction = ({ params }) => {
  const { postId } = parseRouteParams("posts/[postId]", params);
  // postId: string
};
```

The route literal isn't validated against the actual mounted route — passing `"posts/[wrongName]"` will compile but yield `undefined` at runtime.

## Caveats

- **Catch-all parameters lose their name at the RR layer.** React Router's splat token is always `*`, so a folder named `[...slug]` produces `params["*"]` — not `params.slug`. [`useRouteParams`](../src/lib/useRouteParams.ts) re-keys this and splits it into a `string[]` to match Next.js; reach for `useParams()` directly only if you need the raw RR shape.

- **`loading.tsx` is visible only during sibling navigation under the same layout.** RR7's data router keeps the old UI mounted while new loaders run, so a deeper loading boundary doesn't render until _after_ the transition completes. Going `/posts/1 → /posts/2` shows it; going `/ → /posts/1` does not. The root layout compensates with a thin pulsing bar driven by `useNavigation()` so the initial transition is still visible.

- **`error.tsx` replaces the route's element in place.** A per-route `error.tsx` (e.g. at `posts/[postId]/error.tsx`) only swaps the leaf — root and section layouts stay mounted. A root-level `error.tsx` would replace the _root layout_ (header included) on any unhandled error, so this demo doesn't add one and lets RR's default fallback show for non-leaf failures. Try `/posts/999` to see scoped error handling.

- **Loaders attach to the page leaf, not the layout.** A `loader.ts` file at directory `X` provides data for `X/page.tsx` (read with `useLoaderData()`). If you want a layout to fetch its own data, put a loader on a route that owns the layout — currently the impl doesn't do that automatically. (Adding it would mean attaching the loader to the layout's route and using `useRouteLoaderData(id)` in the page, with explicit route IDs.)

- **Optional catch-all `[[...slug]]` expands to two RR routes.** A folder named `[[...slug]]` contributes both an index route (matches the parent's bare path) and a splat route (matches anything below). Both are wired to the same `page.tsx`, and the matched value still lives at `params["*"]` (`undefined` at the bare path). The folder is treated as a leaf — adding a `layout.tsx` or nested children inside it isn't supported.

- **The router is built once at module load.** `import.meta.glob` runs at build time and `createBrowserRouter` is called at the top level of [`AppRouter.tsx`](../src/lib/AppRouter.tsx). Adding/removing files under `src/app/` triggers a Vite reload, but you won't see the new routes without that reload.

## Verifying the demo

```sh
npm run dev    # then visit http://localhost:5173
npm run build  # tsc -b && vite build — strict-mode TS check
```

Routes worth clicking through:

- `/` — feature index
- `/about`, `/pricing` — route group (note URL has no `/(marketing)`)
- `/posts` — loader + loading skeleton (click between posts to see `loading.tsx`)
- `/posts/1`, `/posts/999` — dynamic + error
- `/docs/intro`, `/docs/api/v2/reference` — catch-all
- `/search`, `/search/react-router` — optional segment
- `/files`, `/files/readme`, `/files/src/app/page.tsx` — optional catch-all
- `/no-such-route` — 404

# Demo

The reference app for the [`react-router-next`](../../packages/react-router-next/) package — a Vite + React 19 + Tailwind 4 frontend that exercises every file-based routing convention the package supports.

The router is mounted by `<AppRouter />` from `react-router-next`, which discovers files under `src/app/` via `import.meta.glob`, builds a segment tree, and converts it to a React Router 7 `RouteObject[]` rendered through `createBrowserRouter` + `RouterProvider`.

## Running it

From the repo root:

```sh
npm install
npm run dev      # demo dev server at http://localhost:5173
npm run build    # builds the package first, then runs `tsc -b && vite build`
```

Demo-only commands (npm workspaces):

```sh
npm run typegen -w demo   # regenerate node_modules/.react-router-next/routes.d.ts
npm run dev     -w demo
npm run build   -w demo
```

## File structure

```
src/app/
├── layout.tsx                            # Root layout + top nav + global loading bar
├── page.tsx                              # /  — feature index hub
├── not-found.tsx                         # Root not-found page
├── (marketing)/                          # Route GROUP — invisible to URL
│   ├── about/page.tsx                    # /about
│   └── pricing/page.tsx                  # /pricing
├── posts/                                # LAYOUT + LOADER + LOADING + PER-SEGMENT NOT-FOUND
│   ├── layout.tsx                        # Section header, wraps children in <Outlet />
│   ├── loader.ts                         # List loader (600 ms delay); exports Post + POSTS
│   ├── loading.tsx                       # Skeleton shown during sibling navigation
│   ├── not-found.tsx                     # Segment-scoped 404 — wins over root for /posts/...
│   ├── page.tsx                          # /posts list
│   └── [postId]/                         # DYNAMIC + ERROR
│       ├── loader.ts                     # Per-post loader; throws on /posts/999, calls notFound() on unknown ids
│       ├── error.tsx                     # Errors caught here keep parent layouts mounted
│       └── page.tsx                      # /posts/:postId
├── notes/                                # LOADING via SUSPENSE (no loader)
│   ├── _lib/use-notes.ts                 # useNotes()/useNote() — promise cache + use()
│   ├── layout.tsx                        # Section header
│   ├── loading.tsx                       # Skeleton shown while a hook suspends
│   ├── page.tsx                          # /notes — useNotes() suspends on mount
│   └── [noteId]/page.tsx                 # /notes/:noteId — useNote(id) suspends per id
├── docs/[...slug]/page.tsx               # CATCH-ALL — matched value at params["*"]
├── files/[[...slug]]/page.tsx            # OPTIONAL CATCH-ALL — index + "*" siblings
├── dashboard/                            # PARALLEL ROUTES — @slot named props
│   ├── layout.tsx                        # Receives { analytics } as a slot prop; main flow via <Outlet />
│   ├── page.tsx                          # /dashboard main panel
│   ├── settings/page.tsx                 # /dashboard/settings main panel
│   └── @analytics/                       # parallel slot — invisible to URL
│       ├── page.tsx                      # rendered for /dashboard
│       ├── settings/page.tsx             # rendered for /dashboard/settings
│       └── default.tsx                   # fallback when slot has no match
└── photos/                               # INTERCEPTING ROUTES INSIDE A PARALLEL SLOT + TEMPLATE + PRIVATE FOLDER
    ├── layout.tsx                        # function ({ modal }) — renders <Outlet /> then {modal}
    ├── page.tsx                          # /photos grid (stays mounted behind the modal)
    ├── [id]/                             # full-page detail
    │   ├── page.tsx                      # /photos/:id
    │   └── template.tsx                  # remounts on every navigation
    ├── @modal/                           # parallel slot — invisible to URL
    │   ├── default.tsx                   # null fallback when the slot has no match
    │   └── (.)[id]/page.tsx              # modal interceptor — rendered on PUSH/REPLACE
    └── _components/                      # PRIVATE folder — never routes
        └── dialog.tsx                    # importable helper module
```

## File conventions

| File                       | Purpose                                                      | Maps to                                                                                                                                                                                                                 |
| -------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `page.tsx`                 | Leaf route element                                           | route's `element` (or `index: true` child if siblings/layout exist)                                                                                                                                                     |
| `layout.tsx`               | Wraps children via `<Outlet />`                              | parent route's `element`. With sibling `@slot/` folders, the layout also receives each slot as a named prop alongside the outlet.                                                                                       |
| `template.tsx`             | Like `layout.tsx` but remounts on every navigation           | wrapper inside the layout (or as the route element if no layout) keyed on `useLocation().pathname`                                                                                                                      |
| `default.tsx`              | Slot fallback (only inside a `@slot/` directory)             | rendered in that slot when the URL doesn't match any of the slot's explicit pages                                                                                                                                       |
| `loader.ts` / `loader.tsx` | React Router loader (named export `loader`, or default)      | route's `loader`                                                                                                                                                                                                        |
| `loading.tsx`              | Skeleton/fallback during navigation or while a hook suspends | injected boundary that renders the fallback when `useNavigation().state === "loading"`, and also wraps `<Outlet />` in a `<Suspense>` so suspending hooks (`use()`, React Query suspense, etc.) reuse the same fallback |
| `error.tsx`                | Error boundary                                               | route's `errorElement` (read with `useRouteError()`)                                                                                                                                                                    |
| `not-found.tsx`            | 404 boundary, scoped to the segment it lives in              | the segment gains a `{ path: "*" }` child; `notFound()` throws bypass any `error.tsx` and render the nearest ancestor `not-found.tsx`                                                                                   |

## Segment conventions

| Folder name    | URL segment                                                                                                                                                         |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `users/`       | `/users`                                                                                                                                                            |
| `[id]/`        | `/:id` (dynamic)                                                                                                                                                    |
| `[...slug]/`   | `/*` (catch-all — matched value at `params["*"]`; the bare parent path 404s, matching Next.js — the router injects an `index` sibling that renders the 404 element) |
| `[[...slug]]/` | bare path **and** `/*` (optional catch-all — emitted as a sibling index route + splat route, both pointing at the same `page.tsx`)                                  |
| `(group)/`     | nothing (route group; folder exists but contributes no URL segment)                                                                                                 |
| `@slot/`       | nothing in the URL — contents become a parallel-route slot, passed to the parent layout as a named prop matching the folder name                                    |
| `_private/`    | nothing — folder is skipped by the router entirely; pages and layouts can still import its files                                                                    |
| `(.)x/`        | intercepts the URL `<parent>/x` — same level as the interceptor's containing folder                                                                                 |
| `(..)x/`       | intercepts one filesystem level up — pops one segment from the parent path, then appends `x`                                                                        |
| `(..)(..)x/`   | intercepts two filesystem levels up                                                                                                                                 |
| `(...)x/`      | intercepts `/x` — anchored at the app root regardless of nesting                                                                                                    |

## Typed params

`useParams()` from React Router types every value as `string | undefined` and exposes catch-alls as a slash-joined string at `params["*"]`. The `useRouteParams` hook (and the matching `RouteParams<S>` type) from `react-router-next` takes a route literal and returns a precisely-typed object that matches Next.js's [dynamic-route shape](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes#typescript) — including `string[]` for catch-alls and optional keys (`?:`) for optional segments.

| Route literal       | Returned shape                   |
| ------------------- | -------------------------------- |
| `posts/[postId]`    | `{ postId: string }`             |
| `docs/[...slug]`    | `{ slug: string[] }`             |
| `files/[[...slug]]` | `{ slug?: string[] }`            |
| `(marketing)/about` | `{}` (groups contribute nothing) |

Pages and layouts also receive their parsed params as a `params` prop — the router wraps each page/layout component and injects them. Each route folder gets its own virtual module that re-exports a pre-bound `RouteProps` type, so you don't have to repeat the route literal:

```tsx
import type { RouteProps } from "virtual:react-router-next/posts/[postId]";

export default function PostPage({ params }: RouteProps) {
  // params: { postId: string }
}
```

The prop is always passed, but components that don't need it can keep a no-arg signature (`function HomePage() { ... }`) — the extra prop is simply ignored. The `useRouteParams` hook remains available for components that prefer the hook style.

Loaders use the same runtime extractor:

```ts
import { parseRouteParams } from "react-router-next";

export const loader: LoaderFunction = ({ params }) => {
  const { postId } = parseRouteParams("posts/[postId]", params);
  // postId: string
};
```

The route literal isn't validated against the actual mounted route — passing `"posts/[wrongName]"` will compile but yield `undefined` at runtime.

## Caveats

- **Catch-all parameters lose their name at the RR layer.** React Router's splat token is always `*`, so a folder named `[...slug]` produces `params["*"]` — not `params.slug`. `useRouteParams` re-keys this and splits it into a `string[]` to match Next.js; reach for `useParams()` directly only if you need the raw RR shape.

- **`loading.tsx` is visible only during sibling navigation under the same layout.** RR7's data router keeps the old UI mounted while new loaders run, so a deeper loading boundary doesn't render until _after_ the transition completes. Going `/posts/1 → /posts/2` shows it; going `/ → /posts/1` does not. The root layout compensates with a thin pulsing bar driven by `useNavigation()` so the initial transition is still visible.

- **`loading.tsx` also doubles as a Suspense boundary.** The injected wrapper renders the fallback when `useNavigation().state === "loading"` _and_ wraps `<Outlet />` in a `<Suspense fallback={<Loading />}>`. A route with no `loader.ts` can still show the same skeleton by suspending inside the page — `use(promise)`, React Query's suspense mode, etc. The `/notes` section is wired this way; `useNotes()` throws a cached promise on first render and `loading.tsx` catches it.

- **`error.tsx` replaces the route's element in place.** A per-route `error.tsx` (e.g. at `posts/[postId]/error.tsx`) only swaps the leaf — root and section layouts stay mounted. A root-level `error.tsx` would replace the _root layout_ (header included) on any unhandled error, so this demo doesn't add one and lets RR's default fallback show for non-leaf failures. Try `/posts/999` to see scoped error handling.

- **Loaders attach to the page leaf, not the layout.** A `loader.ts` file at directory `X` provides data for `X/page.tsx` (read with `useLoaderData()`). If you want a layout to fetch its own data, put a loader on a route that owns the layout — currently the impl doesn't do that automatically. (Adding it would mean attaching the loader to the layout's route and using `useRouteLoaderData(id)` in the page, with explicit route IDs.)

- **Optional catch-all `[[...slug]]` expands to two RR routes.** A folder named `[[...slug]]` contributes both an index route (matches the parent's bare path) and a splat route (matches anything below). Both are wired to the same `page.tsx`, and the matched value still lives at `params["*"]` (`undefined` at the bare path). The folder is treated as a leaf — adding a `layout.tsx` or nested children inside it isn't supported.

- **The router is built once at module load.** `import.meta.glob` runs at build time and `createBrowserRouter` is called at the top level of `<AppRouter />`. Adding/removing files under `src/app/` triggers a Vite reload, but you won't see the new routes without that reload.

- **Parallel-route slots can't have RR loaders.** Each `@slot/` subtree is matched imperatively via `useRoutes()` from inside the parent layout — it isn't part of React Router's data-router tree, so a `loader.ts` under a `@slot/` directory is dropped with a build-time warning. If a slot has `loading.tsx` it likewise won't be triggered by RR's navigation state. Use ordinary children (or a route-id loader) for data-driven UI.

- **Intercepting routes only intercept on PUSH/REPLACE.** The wrapper checks `useNavigationType()`: `POP` (back/forward) and initial loads always render the original target. Refresh on a `/photos/1` URL shows the full-page detail, not the modal. Loaders, layouts, and loading boundaries inside an interceptor folder are unsupported and produce a build-time warning.

- **Slot-owned intercepts pair with a parent `@slot`.** The `/photos` modal lives at `photos/@modal/(.)[id]/page.tsx` — the `(.)[id]` interceptor sits _inside_ a parallel slot, and `photos/layout.tsx` renders the slot prop (`{modal}`) alongside `<Outlet />`. On soft-nav to `/photos/:id` the slot matches the interceptor while the main outlet "freezes" to `photos/page.tsx`, so the grid stays mounted under the modal — the Next.js-canonical layering. The slot needs a `default.tsx` (returning `null` is fine) so it renders nothing when no photo is selected. A naked `photos/(.)[id]/page.tsx` interceptor still works, but swaps the page outright rather than overlaying it.

- **Slot and interceptor `routeKey`s are URL-aligned.** A page at `dashboard/@analytics/settings/page.tsx` has the same routeKey as `dashboard/settings` — the slot prefix is stripped. Likewise, `photos/@modal/(.)[id]/page.tsx` shares the routeKey `photos/[id]` with its target (both the `@modal` prefix and the `(.)` prefix are stripped). Both files import `RouteProps` / `generate` from the same `virtual:react-router-next/...` module.

- **Intercepting-route targets are required.** If `(.)x` resolves to a URL pattern that has no real route, the build fails — a refresh on that URL must always render something.

## What to click through

- `/` — feature index
- `/about`, `/pricing` — route group (note the URL has no `/(marketing)`)
- `/posts` — loader + loading skeleton (click between posts to see `loading.tsx`)
- `/posts/1`, `/posts/999` — dynamic + error
- `/notes`, `/notes/a` — same `loading.tsx`, but driven by a suspending hook instead of a loader
- `/docs/intro`, `/docs/api/v2/reference` — catch-all
- `/files`, `/files/readme`, `/files/src/app/page.tsx` — optional catch-all
- `/dashboard`, `/dashboard/settings` — parallel routes (main outlet + analytics slot, both swap independently)
- `/photos` then click a thumbnail — modal interceptor; refresh on a photo URL shows the full page instead
- `/no-such-route` — root `not-found.tsx`
- `/posts/missing`, `/posts/some/deep/unmatched/path` — per-segment `posts/not-found.tsx` (via `notFound()` and via the segment splat)

---
"@evolonix/react-router-next": minor
---

Slot- and intercept-scoped `loading.tsx` / `error.tsx` / `not-found.tsx`.

**New**

- Parallel-route slots (`@slot/`) now honor their own `error.tsx` and `not-found.tsx`. A render error inside a slot subtree is caught at the slot boundary, so the parent layout, the main `<Outlet />`, and sibling slots stay mounted instead of bubbling to the data router's root boundary.
- Intercepting routes (`(.)x/`, `(..)x/`, `(...)x/`) now honor `loading.tsx`, `error.tsx`, and `not-found.tsx` inside the interceptor folder. The interceptor's `page.tsx` is wrapped in a framework Suspense + error boundary keyed by `location.key`, so the boundary remounts cleanly across navigations.
- `notFound()` thrown from a route now renders the nearest ancestor `not-found.tsx` _without_ unmounting the surrounding layout chrome. The `errorElement` is attached to a pathless wrapper inside the layout's children instead of the layout route itself, matching Next.js's behavior.
- Exported `useRouteError` from the package entry point. It's a drop-in replacement for react-router's hook that also works inside `error.tsx` files rendered by framework-managed boundaries (slots and intercepts), which don't sit on data-router routes with `id`s.

# @evolonix/react-router-next

## 1.1.0

### Minor Changes

- [#27](https://github.com/evolonix/react-router-next/pull/27) [`ae2d37c`](https://github.com/evolonix/react-router-next/commit/ae2d37c5a66a8c5bcbd38be5395f3bf77633c54c) Thanks [@jasonruesch](https://github.com/jasonruesch)! - Slot- and intercept-scoped `loading.tsx` / `error.tsx` / `not-found.tsx`.

  **New**
  - Parallel-route slots (`@slot/`) now honor their own `error.tsx` and `not-found.tsx`. A render error inside a slot subtree is caught at the slot boundary, so the parent layout, the main `<Outlet />`, and sibling slots stay mounted instead of bubbling to the data router's root boundary.
  - Intercepting routes (`(.)x/`, `(..)x/`, `(...)x/`) now honor `loading.tsx`, `error.tsx`, and `not-found.tsx` inside the interceptor folder. The interceptor's `page.tsx` is wrapped in a framework Suspense + error boundary keyed by `location.key`, so the boundary remounts cleanly across navigations.
  - `notFound()` thrown from a route now renders the nearest ancestor `not-found.tsx` _without_ unmounting the surrounding layout chrome. The `errorElement` is attached to a pathless wrapper inside the layout's children instead of the layout route itself, matching Next.js's behavior.
  - Exported `useRouteError` from the package entry point. It's a drop-in replacement for react-router's hook that also works inside `error.tsx` files rendered by framework-managed boundaries (slots and intercepts), which don't sit on data-router routes with `id`s.

## 1.0.0

### Major Changes

- [#25](https://github.com/evolonix/react-router-next/pull/25) [`cf7076c`](https://github.com/evolonix/react-router-next/commit/cf7076cdcefe4ea2dfdf638d7706e2796e0c5442) Thanks [@jasonruesch](https://github.com/jasonruesch)! - v1 release.

  **Breaking**
  - Removed support for the optional single-dynamic segment pattern `[[name]]`. Use `[name]` for a required dynamic segment or `[[...name]]` for an optional catch-all. Folders named `[[name]]` are no longer recognized as a routing convention.

  **New**
  - `not-found.tsx` is now supported at any segment, not just the app root. The nearest ancestor's `not-found.tsx` renders for unmatched URLs under that segment.
  - Added a `notFound()` helper (plus `NotFoundError` / `isNotFoundError`) that can be thrown from loaders or components to short-circuit to the nearest ancestor `not-found.tsx`, bypassing any intermediate `error.tsx`.

## 0.6.0

### Minor Changes

- [#22](https://github.com/evolonix/react-router-next/pull/22) [`1b5848b`](https://github.com/evolonix/react-router-next/commit/1b5848b52a4902236bc97e2b0c381f703923488e) Thanks [@jasonruesch](https://github.com/jasonruesch)! - Fix intercepted routes to work with slots accurately

## 0.5.0

### Minor Changes

- [#20](https://github.com/evolonix/react-router-next/pull/20) [`855558f`](https://github.com/evolonix/react-router-next/commit/855558fc07b6ec464e50ff5661ba1c1724cad385) Thanks [@jasonruesch](https://github.com/jasonruesch)! - Add route pending features for navigation or loading boundary suspense

## 0.4.0

### Minor Changes

- [#18](https://github.com/evolonix/react-router-next/pull/18) [`bf72f76`](https://github.com/evolonix/react-router-next/commit/bf72f76c03f888b8eee0aa78b67e09b83bf05de2) Thanks [@jasonruesch](https://github.com/jasonruesch)! - `loading.tsx` rendered while a parent loader is pending or a descendant suspends — the injected boundary is both `useNavigation()`-aware and a `<Suspense>` fallback, so the same file covers `loader.ts` waits and suspending hooks (`use()`, React Query suspense, etc.)

## 0.3.1

### Patch Changes

- [#16](https://github.com/evolonix/react-router-next/pull/16) [`f335acb`](https://github.com/evolonix/react-router-next/commit/f335acb02068f2947a133ead55a6022673cd76a7) Thanks [@jasonruesch](https://github.com/jasonruesch)! - Host demo app on GitHub Pages

## 0.3.0

### Minor Changes

- [#7](https://github.com/evolonix/react-router-next/pull/7) [`e68af2a`](https://github.com/evolonix/react-router-next/commit/e68af2aeab19ff9d10f010843308c7bcc285bebe) Thanks [@jasonruesch](https://github.com/jasonruesch)! - Parallel route layouts now require an Outlet instead of children to be consistent with other layouts

## 0.2.1

### Patch Changes

- [`9e88da2`](https://github.com/evolonix/react-router-next/commit/9e88da29910318f17393886e6dfaab0958510e09) Thanks [@jasonruesch](https://github.com/jasonruesch)! - Update README documentation

## 0.2.0

### Minor Changes

- [#1](https://github.com/evolonix/react-router-next/pull/1) [`82477b3`](https://github.com/evolonix/react-router-next/commit/82477b3162db53978e60ca62b0306afbfe8a7f33) Thanks [@jasonruesch](https://github.com/jasonruesch)! - Initial public release as `@evolonix/react-router-next`.

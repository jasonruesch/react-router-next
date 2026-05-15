---
"@evolonix/react-router-next": major
---

v1 release.

**Breaking**

- Removed support for the optional single-dynamic segment pattern `[[name]]`. Use `[name]` for a required dynamic segment or `[[...name]]` for an optional catch-all. Folders named `[[name]]` are no longer recognized as a routing convention.

**New**

- `not-found.tsx` is now supported at any segment, not just the app root. The nearest ancestor's `not-found.tsx` renders for unmatched URLs under that segment.
- Added a `notFound()` helper (plus `NotFoundError` / `isNotFoundError`) that can be thrown from loaders or components to short-circuit to the nearest ancestor `not-found.tsx`, bypassing any intermediate `error.tsx`.

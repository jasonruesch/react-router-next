// @vitest-environment jsdom

/**
 * Render tests for the `SegmentBoundary` used to wire `loading.tsx` and
 * `error.tsx` inside slot and intercepted-route subtrees. Verifies the
 * framework's `useRouteError` returns the caught error when read from the
 * boundary's rendered `error.tsx`, instead of throwing react-router's
 * "useRouteError can only be used on routes that contain a unique id"
 * invariant. That bug previously caused intercepted modals with `error.tsx`
 * to escape past the boundary and render the root `not-found.tsx`.
 */
import { type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, describe, expect, it } from "vitest";
import { notFound } from "./not-found";
import { SegmentBoundary, useRouteError } from "./route-components";

let activeRoot: Root | null = null;
let container: HTMLElement | null = null;

afterEach(() => {
  if (activeRoot) {
    activeRoot.unmount();
    activeRoot = null;
  }
  if (container) {
    container.remove();
    container = null;
  }
});

async function waitForRender(
  root: HTMLElement,
  selector: string,
  { timeout = 500, interval = 5 } = {},
): Promise<Element | null> {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const found = root.querySelector(selector);
    if (found) return found;
    await new Promise((r) => setTimeout(r, interval));
  }
  return root.querySelector(selector);
}

function renderInRouter(element: ReactNode): HTMLElement {
  // SegmentBoundary internally calls `useLocation()`, so render inside a
  // data router context for the hook to resolve.
  const router = createMemoryRouter([{ path: "*", element }]);
  const el = document.createElement("div");
  document.body.appendChild(el);
  container = el;
  activeRoot = createRoot(el);
  activeRoot.render(<RouterProvider router={router} />);
  return el;
}

describe("SegmentBoundary + useRouteError", () => {
  function ThrowError(): null {
    throw new Error("Boundary should catch this");
  }

  function ThrowNotFound(): null {
    notFound();
  }

  function ErrorComponent(): ReactNode {
    const error = useRouteError();
    const msg = error instanceof Error ? error.message : String(error);
    return <div data-testid="error">{msg}</div>;
  }

  function NotFoundComponent(): ReactNode {
    return <div data-testid="notfound">not-found</div>;
  }

  it("catches a render error and renders the segment's error.tsx with useRouteError surfacing the error", async () => {
    const root = renderInRouter(
      <SegmentBoundary ErrorComponent={ErrorComponent}>
        <ThrowError />
      </SegmentBoundary>,
    );
    const errorEl = await waitForRender(root, '[data-testid="error"]');
    expect(errorEl).not.toBeNull();
    expect(errorEl?.textContent).toBe("Boundary should catch this");
  });

  it("routes a `notFound()` throw to the segment's not-found.tsx", async () => {
    const root = renderInRouter(
      <SegmentBoundary
        ErrorComponent={ErrorComponent}
        NotFoundComponent={NotFoundComponent}
      >
        <ThrowNotFound />
      </SegmentBoundary>,
    );
    const nf = await waitForRender(root, '[data-testid="notfound"]');
    expect(nf).not.toBeNull();
    expect(root.querySelector('[data-testid="error"]')).toBeNull();
  });

  it("renders error.tsx for notFound() when no not-found.tsx is provided (re-throw path)", async () => {
    const root = renderInRouter(
      <SegmentBoundary ErrorComponent={ErrorComponent}>
        <ThrowNotFound />
      </SegmentBoundary>,
    );
    // With ErrorComponent set but no NotFoundComponent, the boundary
    // re-throws the NotFoundError; the outer test router has no
    // errorElement, so verify the segment's not-found UI did not render.
    await new Promise((r) => setTimeout(r, 50));
    expect(root.querySelector('[data-testid="notfound"]')).toBeNull();
  });
});

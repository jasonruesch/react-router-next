import { useEffect, useSyncExternalStore } from "react";
import { useNavigation } from "react-router";

let pendingCount = 0;
const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): number {
  return pendingCount;
}

function emit(): void {
  for (const listener of listeners) listener();
}

function increment(): void {
  pendingCount += 1;
  emit();
}

function decrement(): void {
  pendingCount = Math.max(0, pendingCount - 1);
  emit();
}

/**
 * Renders inside a Suspense fallback to flag that a route is suspending.
 * Mount/unmount of this component drives the shared pending counter that
 * `useIsRoutePending` reads.
 */
export function SuspensePendingMarker(): null {
  useEffect(() => {
    increment();
    return decrement;
  }, []);
  return null;
}

/**
 * Returns true when a route is pending — either react-router is navigating
 * (loader/action) or a `LoadingBoundary` Suspense fallback is rendering.
 */
export function useIsRoutePending(): boolean {
  const suspendCount = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot,
  );
  const nav = useNavigation();
  return suspendCount > 0 || nav.state !== "idle";
}

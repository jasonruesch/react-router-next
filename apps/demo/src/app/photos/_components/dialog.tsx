import { useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router";

/**
 * Demonstrates a `_private` folder: this file lives under
 * `src/app/photos/_components/`, so it isn't a route — but pages and layouts
 * can still import it like any other module. The router skips folders whose
 * name starts with `_`.
 */
export function Dialog({
  children,
  closeTo,
}: {
  children: ReactNode;
  closeTo: string;
}) {
  const navigate = useNavigate();

  useEffect(() => {
    function onKey(e: KeyboardEvent): void {
      if (e.key === "Escape") navigate(closeTo);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate, closeTo]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-30 flex items-center justify-center p-4"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={() => navigate(closeTo)}
        className="absolute inset-0 bg-background/80 backdrop-blur"
      />
      <div className="relative z-10 w-full max-w-lg rounded border border-border bg-card text-card-foreground shadow-xl">
        {children}
      </div>
    </div>
  );
}

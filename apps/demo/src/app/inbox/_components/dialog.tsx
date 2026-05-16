import { useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router";

/**
 * Mirrors photos/_components/dialog.tsx so the inbox demo stays
 * self-contained. Lives in a _private folder so it isn't routed.
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

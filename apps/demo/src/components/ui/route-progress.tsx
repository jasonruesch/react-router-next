import { useIsRoutePending } from "@evolonix/react-router-next";
import { cn } from "../../lib/cn";

export function RouteProgress({ className }: { className?: string }) {
  const pending = useIsRoutePending();
  if (!pending) return null;
  return (
    <div
      role="progressbar"
      aria-busy="true"
      aria-label="Loading route"
      className={cn(
        "fixed inset-x-0 top-0 z-50 h-0.5 bg-primary animate-pulse",
        className,
      )}
    />
  );
}

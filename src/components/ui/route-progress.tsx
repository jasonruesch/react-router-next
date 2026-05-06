import { useNavigation } from "react-router";
import { cn } from "../../lib/cn";

export function RouteProgress({ className }: { className?: string }) {
  const nav = useNavigation();
  if (nav.state === "idle") return null;
  return (
    <div
      role="progressbar"
      aria-busy="true"
      aria-label="Loading route"
      className={cn("h-0.5 bg-primary animate-pulse", className)}
    />
  );
}

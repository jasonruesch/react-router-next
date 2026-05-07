import { useEffect, useState, type ReactNode } from "react";
import { Stack } from "../../../components/ui/stack";

export default function PhotoTemplate({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <div
      className="transition-opacity duration-300"
      style={{ opacity: mounted ? 1 : 0 }}
    >
      <Stack gap="md">{children}</Stack>
    </div>
  );
}

import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { Heading } from "./heading";
import { Text } from "./text";

type PageHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
  /** Slot rendered inline on the right side of the title row. */
  action?: ReactNode;
  /** Heading level for the title (defaults to 1). */
  level?: 1 | 2 | 3;
  className?: string;
};

export function PageHeader({
  title,
  description,
  action,
  level = 1,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("mb-6 flex flex-col gap-2", className)}>
      <div className="flex items-center justify-between gap-4">
        <Heading level={level}>{title}</Heading>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {description ? <Text tone="muted">{description}</Text> : null}
    </header>
  );
}

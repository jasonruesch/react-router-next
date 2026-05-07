import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { Card } from "./card";
import { Heading } from "./heading";
import { Text } from "./text";

type ErrorPanelProps = {
  title: ReactNode;
  message?: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function ErrorPanel({
  title,
  message,
  children,
  action,
  className,
}: ErrorPanelProps) {
  return (
    <Card
      tone="destructive"
      padding="md"
      className={cn("flex flex-col gap-3", className)}
    >
      <Heading level={4} className="text-destructive">
        {title}
      </Heading>
      {message ? (
        <Text size="sm" tone="destructive">
          {message}
        </Text>
      ) : null}
      {children}
      {action ? <div>{action}</div> : null}
    </Card>
  );
}

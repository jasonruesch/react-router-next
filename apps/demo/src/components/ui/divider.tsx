import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "../../lib/cn";

const dividerVariants = cva("border-0 border-t border-border", {
  variants: {
    tone: {
      default: "border-border",
      muted: "border-border/50",
      strong: "border-foreground/20",
    },
    spacing: {
      none: "my-0",
      sm: "my-2",
      md: "my-4",
      lg: "my-6",
    },
  },
  defaultVariants: {
    tone: "default",
    spacing: "md",
  },
});

type DividerProps = VariantProps<typeof dividerVariants> &
  ComponentPropsWithoutRef<"hr">;

export function Divider({ tone, spacing, className, ...props }: DividerProps) {
  return (
    <hr
      className={cn(dividerVariants({ tone, spacing }), className)}
      {...props}
    />
  );
}

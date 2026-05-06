import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef, ElementType } from "react";
import { cn } from "../../lib/cn";

const cardVariants = cva("rounded border bg-card text-card-foreground", {
  variants: {
    tone: {
      default: "border-border",
      destructive: "border-destructive/40 bg-destructive/5 text-destructive",
    },
    padding: {
      none: "p-0",
      sm: "p-3",
      md: "p-4",
      lg: "p-6",
    },
    align: {
      start: "text-left",
      center: "text-center",
    },
  },
  defaultVariants: {
    tone: "default",
    padding: "md",
    align: "start",
  },
});

type CardProps<T extends ElementType = "div"> = {
  as?: T;
} & VariantProps<typeof cardVariants> &
  Omit<ComponentPropsWithoutRef<T>, "as">;

export function Card<T extends ElementType = "div">({
  as,
  tone,
  padding,
  align,
  className,
  ...props
}: CardProps<T>) {
  const Tag = (as ?? "div") as ElementType;
  return (
    <Tag
      className={cn(cardVariants({ tone, padding, align }), className)}
      {...props}
    />
  );
}

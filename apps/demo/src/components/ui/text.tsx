import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef, ElementType } from "react";
import { cn } from "../../lib/cn";

const textVariants = cva("m-0", {
  variants: {
    size: {
      xs: "text-xs",
      sm: "text-sm",
      base: "text-base",
      lg: "text-lg",
    },
    tone: {
      default: "text-foreground",
      muted: "text-muted-foreground",
      subtle: "text-muted-foreground/70",
      destructive: "text-destructive",
    },
    weight: {
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
    },
    transform: {
      none: "",
      uppercase: "uppercase tracking-wide",
    },
  },
  defaultVariants: {
    size: "base",
    tone: "muted",
    weight: "normal",
    transform: "none",
  },
});

type TextProps<T extends ElementType = "p"> = {
  as?: T;
} & VariantProps<typeof textVariants> &
  Omit<ComponentPropsWithoutRef<T>, "as">;

export function Text<T extends ElementType = "p">({
  as,
  size,
  tone,
  weight,
  transform,
  className,
  ...props
}: TextProps<T>) {
  const Tag = (as ?? "p") as ElementType;
  return (
    <Tag
      className={cn(textVariants({ size, tone, weight, transform }), className)}
      {...props}
    />
  );
}

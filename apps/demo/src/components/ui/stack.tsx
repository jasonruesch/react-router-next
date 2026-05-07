import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef, ElementType } from "react";
import { cn } from "../../lib/cn";

const stackVariants = cva("flex", {
  variants: {
    direction: {
      row: "flex-row",
      col: "flex-col",
    },
    gap: {
      none: "gap-0",
      xs: "gap-1",
      sm: "gap-2",
      md: "gap-4",
      lg: "gap-6",
      xl: "gap-8",
    },
    align: {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      stretch: "items-stretch",
      baseline: "items-baseline",
    },
    justify: {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
      between: "justify-between",
    },
    wrap: {
      true: "flex-wrap",
      false: "flex-nowrap",
    },
  },
  defaultVariants: {
    direction: "col",
    gap: "md",
  },
});

type StackProps<T extends ElementType = "div"> = {
  as?: T;
} & VariantProps<typeof stackVariants> &
  Omit<ComponentPropsWithoutRef<T>, "as">;

export function Stack<T extends ElementType = "div">({
  as,
  direction,
  gap,
  align,
  justify,
  wrap,
  className,
  ...props
}: StackProps<T>) {
  const Tag = (as ?? "div") as ElementType;
  return (
    <Tag
      className={cn(
        stackVariants({ direction, gap, align, justify, wrap }),
        className,
      )}
      {...props}
    />
  );
}

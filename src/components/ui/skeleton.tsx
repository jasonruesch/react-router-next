import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "../../lib/cn";

const skeletonVariants = cva("rounded bg-muted animate-pulse", {
  variants: {
    width: {
      "1/4": "w-1/4",
      "1/3": "w-1/3",
      "1/2": "w-1/2",
      "2/3": "w-2/3",
      "3/4": "w-3/4",
      full: "w-full",
    },
    height: {
      sm: "h-3",
      md: "h-4",
      lg: "h-6",
    },
  },
  defaultVariants: { width: "full", height: "md" },
});

type SkeletonLineProps = ComponentPropsWithoutRef<"div"> &
  VariantProps<typeof skeletonVariants>;

export function SkeletonLine({
  width,
  height,
  className,
  ...props
}: SkeletonLineProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(skeletonVariants({ width, height }), className)}
      {...props}
    />
  );
}

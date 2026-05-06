import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "../../lib/cn";

const headingVariants = cva(
  "font-semibold tracking-tight text-foreground m-0",
  {
    variants: {
      level: {
        1: "text-2xl sm:text-3xl",
        2: "text-xl sm:text-2xl",
        3: "text-lg sm:text-xl",
        4: "text-base sm:text-lg",
      },
    },
    defaultVariants: { level: 2 },
  },
);

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

type HeadingProps = ComponentPropsWithoutRef<"h1"> &
  VariantProps<typeof headingVariants> & {
    as?: HeadingTag;
  };

const LEVEL_TO_TAG: Record<
  NonNullable<VariantProps<typeof headingVariants>["level"]>,
  HeadingTag
> = {
  1: "h1",
  2: "h2",
  3: "h3",
  4: "h4",
};

export function Heading({ level, as, className, ...props }: HeadingProps) {
  const resolvedLevel = level ?? 2;
  const Tag = (as ?? LEVEL_TO_TAG[resolvedLevel]) as HeadingTag;
  return (
    <Tag
      className={cn(headingVariants({ level: resolvedLevel }), className)}
      {...props}
    />
  );
}

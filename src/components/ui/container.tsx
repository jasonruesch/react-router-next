import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef, ElementType } from "react";
import { cn } from "../../lib/cn";

const containerVariants = cva("mx-auto w-full px-4 sm:px-6", {
  variants: {
    size: {
      sm: "max-w-xl",
      md: "max-w-3xl",
      lg: "max-w-5xl",
    },
  },
  defaultVariants: { size: "md" },
});

type ContainerProps<T extends ElementType = "div"> = {
  as?: T;
} & VariantProps<typeof containerVariants> &
  Omit<ComponentPropsWithoutRef<T>, "as">;

export function Container<T extends ElementType = "div">({
  as,
  size,
  className,
  ...props
}: ContainerProps<T>) {
  const Tag = (as ?? "div") as ElementType;
  return (
    <Tag className={cn(containerVariants({ size }), className)} {...props} />
  );
}

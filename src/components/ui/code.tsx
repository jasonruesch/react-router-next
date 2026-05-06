import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "../../lib/cn";

const codeVariants = cva(
  "font-mono text-foreground rounded inline-flex items-center",
  {
    variants: {
      variant: {
        plain: "bg-transparent px-0 py-0 text-[0.95em]",
        chip: "bg-muted px-1 py-0.5 text-sm",
      },
    },
    defaultVariants: { variant: "chip" },
  },
);

type CodeProps = ComponentPropsWithoutRef<"code"> &
  VariantProps<typeof codeVariants>;

export function Code({ variant, className, ...props }: CodeProps) {
  return (
    <code className={cn(codeVariants({ variant }), className)} {...props} />
  );
}

/**
 * FilePath renders an inline file/path reference using the chip code variant.
 * Pages should use this instead of styling <code> directly.
 */
export function FilePath({
  className,
  ...props
}: Omit<ComponentPropsWithoutRef<"code">, "children"> & { children: string }) {
  return <Code variant="chip" className={className} {...props} />;
}

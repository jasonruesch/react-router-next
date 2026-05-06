import { cva, type VariantProps } from "class-variance-authority";
import { type ComponentPropsWithoutRef, type ReactNode } from "react";
import { Link, type LinkProps } from "react-router";
import { cn } from "../../lib/cn";

const navLinkVariants = cva(
  "inline-flex items-center transition-colors hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm",
  {
    variants: {
      tone: {
        default: "text-foreground hover:text-primary",
        muted: "text-muted-foreground hover:text-foreground",
        primary: "text-primary",
        destructive: "text-destructive hover:text-destructive",
      },
      size: {
        sm: "text-sm",
        base: "text-base",
        lg: "text-lg",
      },
      weight: {
        normal: "font-normal",
        medium: "font-medium",
        semibold: "font-semibold",
      },
    },
    defaultVariants: {
      tone: "default",
      size: "base",
      weight: "normal",
    },
  },
);

type NavLinkProps = LinkProps &
  VariantProps<typeof navLinkVariants> & {
    className?: string;
  };

export function NavLink({
  tone,
  size,
  weight,
  className,
  ...props
}: NavLinkProps) {
  return (
    <Link
      className={cn(navLinkVariants({ tone, size, weight }), className)}
      {...props}
    />
  );
}

export function BackLink({
  className,
  children,
  ...props
}: Omit<NavLinkProps, "tone">) {
  return (
    <NavLink
      tone="muted"
      size="sm"
      className={cn("gap-1", className)}
      {...props}
    >
      <span aria-hidden>←</span>
      {children}
    </NavLink>
  );
}

type TopNavProps = {
  brand: ReactNode;
  links: ReactNode;
  actions?: ReactNode;
  /** Optional progress indicator rendered as a thin bar below the nav. */
  progress?: ReactNode;
} & ComponentPropsWithoutRef<"header">;

export function TopNav({
  brand,
  links,
  actions,
  progress,
  className,
  ...props
}: TopNavProps) {
  return (
    <header
      className={cn("border-b border-border bg-background", className)}
      {...props}
    >
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-6 py-4">
        <div className="font-semibold text-foreground">{brand}</div>
        <nav className="flex items-center gap-4">{links}</nav>
        {actions ? (
          <div className="flex items-center gap-2">{actions}</div>
        ) : null}
      </div>
      {progress}
    </header>
  );
}

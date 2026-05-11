import { cva, type VariantProps } from "class-variance-authority";
import { useState, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { Link, useLocation, type LinkProps } from "react-router";
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
  viewTransition = true,
  ...props
}: NavLinkProps) {
  return (
    <Link
      className={cn(navLinkVariants({ tone, size, weight }), className)}
      viewTransition={viewTransition}
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
} & ComponentPropsWithoutRef<"header">;

export function TopNav({
  brand,
  links,
  actions,
  className,
  ...props
}: TopNavProps) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const [prevPathname, setPrevPathname] = useState(pathname);

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur",
        className,
      )}
      {...props}
    >
      <div className="mx-auto flex w-full max-w-5xl items-center gap-3 px-4 py-3 sm:px-6 sm:py-4">
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="top-nav-menu"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:hidden"
        >
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            {open ? (
              <>
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
              </>
            ) : (
              <>
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </>
            )}
          </svg>
        </button>
        <div className="font-semibold text-foreground">{brand}</div>
        <nav className="hidden flex-1 items-center justify-end gap-4 sm:flex">
          {links}
        </nav>
        {actions ? (
          <div className="ml-auto flex items-center gap-2 sm:ml-0">
            {actions}
          </div>
        ) : null}
      </div>
      {open ? (
        <nav
          id="top-nav-menu"
          className="border-t border-border sm:hidden"
          onClick={() => setOpen(false)}
        >
          <div className="mx-auto flex w-full max-w-3xl flex-col px-4 py-2 [&>a]:py-2 [&>a]:text-base">
            {links}
          </div>
        </nav>
      ) : null}
    </header>
  );
}

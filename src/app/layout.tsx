import { Outlet } from "react-router";
import { ThemeToggle } from "../components/theme-provider";
import { Container } from "../components/ui/container";
import { NavLink, TopNav } from "../components/ui/nav";
import { RouteProgress } from "../components/ui/route-progress";

const NAV_LINKS: { to: string; label: string }[] = [
  { to: "/about", label: "About" },
  { to: "/pricing", label: "Pricing" },
  { to: "/contact", label: "Contact" },
  { to: "/posts", label: "Posts" },
  { to: "/docs/intro", label: "Docs" },
  { to: "/search", label: "Search" },
  { to: "/files", label: "Files" },
];

export default function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <TopNav
        brand={
          <NavLink to="/" tone="default" weight="semibold">
            App Router Demo
          </NavLink>
        }
        links={NAV_LINKS.map((l) => (
          <NavLink key={l.to} to={l.to} tone="muted" size="sm">
            {l.label}
          </NavLink>
        ))}
        actions={<ThemeToggle />}
        progress={<RouteProgress />}
      />
      <Container as="main" className="py-8">
        <Outlet />
      </Container>
    </div>
  );
}

import { Outlet } from "react-router";
import { ThemeToggle } from "../components/theme-provider";
import { Container } from "../components/ui/container";
import { NavLink, TopNav } from "../components/ui/nav";
import { RouteProgress } from "../components/ui/route-progress";
import { generate as generateMarketingAbout } from "./(marketing)/about/route.types";
import { generate as generateMarketingPricing } from "./(marketing)/pricing/route.types";
import { generate as generateDoc } from "./docs/[...slug]/route.types";
import { generate as generateFile } from "./files/[[...slug]]/route.types";
import { generate as generatePosts } from "./posts/route.types";
import { generate as generateHome } from "./route.types";
import { generate as generateSearch } from "./search/[[query]]/route.types";

const NAV_LINKS: { to: string; label: string }[] = [
  { to: generateMarketingAbout(), label: "About" },
  { to: generateMarketingPricing(), label: "Pricing" },
  { to: generatePosts(), label: "Posts" },
  { to: generateDoc({ slug: ["intro"] }), label: "Docs" },
  { to: generateSearch({ query: undefined }), label: "Search" },
  { to: generateFile({ slug: undefined }), label: "Files" },
];

export default function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <RouteProgress />
      <TopNav
        brand={
          <NavLink to={generateHome()} tone="default" weight="semibold">
            App Router Demo
          </NavLink>
        }
        links={NAV_LINKS.map((l) => (
          <NavLink key={l.to} to={l.to} tone="muted" size="sm">
            {l.label}
          </NavLink>
        ))}
        actions={<ThemeToggle />}
      />
      <Container as="main" className="py-6 sm:py-8">
        <Outlet />
      </Container>
    </div>
  );
}

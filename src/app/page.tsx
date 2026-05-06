import { Card } from "../components/ui/card";
import { Code, FilePath } from "../components/ui/code";
import { Heading } from "../components/ui/heading";
import { NavLink } from "../components/ui/nav";
import { PageHeader } from "../components/ui/page-header";
import { Stack } from "../components/ui/stack";
import { Text } from "../components/ui/text";

type Section = {
  title: string;
  feature: string;
  files: string[];
  links: { to: string; label: string }[];
};

const SECTIONS: Section[] = [
  {
    title: "Static pages inside a route group",
    feature: "(group)",
    files: ["(marketing)/about/page.tsx", "(marketing)/pricing/page.tsx"],
    links: [
      { to: "/about", label: "/about" },
      { to: "/pricing", label: "/pricing" },
    ],
  },
  {
    title: "Nested layout + loader + loading",
    feature: "layout.tsx, loader.ts, loading.tsx",
    files: [
      "posts/layout.tsx",
      "posts/loader.ts",
      "posts/loading.tsx",
      "posts/page.tsx",
    ],
    links: [{ to: "/posts", label: "/posts" }],
  },
  {
    title: "Dynamic segment + per-route loader + error boundary",
    feature: "[postId], loader.ts, error.tsx",
    files: [
      "posts/[postId]/loader.ts",
      "posts/[postId]/error.tsx",
      "posts/[postId]/page.tsx",
    ],
    links: [
      { to: "/posts/1", label: "/posts/1" },
      { to: "/posts/2", label: "/posts/2" },
      { to: "/posts/999", label: "/posts/999 (loader throws → error.tsx)" },
    ],
  },
  {
    title: "Catch-all segment",
    feature: "[...slug]",
    files: ["docs/[...slug]/page.tsx"],
    links: [
      { to: "/docs/intro", label: "/docs/intro" },
      { to: "/docs/api/v2/reference", label: "/docs/api/v2/reference" },
      { to: "/docs", label: "/docs (bare — 404, like Next.js)" },
    ],
  },
  {
    title: "Optional dynamic segment",
    feature: "[[query]]",
    files: ["search/[[query]]/page.tsx"],
    links: [
      { to: "/search", label: "/search (no param)" },
      { to: "/search/react-router", label: "/search/react-router" },
    ],
  },
  {
    title: "Optional catch-all segment",
    feature: "[[...slug]]",
    files: ["files/[[...slug]]/page.tsx"],
    links: [
      { to: "/files", label: "/files (no slug)" },
      { to: "/files/readme", label: "/files/readme" },
      { to: "/files/src/app/page.tsx", label: "/files/src/app/page.tsx" },
    ],
  },
  {
    title: "Not-found",
    feature: "404.tsx",
    files: ["404.tsx"],
    links: [{ to: "/no-such-route", label: "/no-such-route" }],
  },
];

export default function Home() {
  return (
    <Stack gap="lg">
      <PageHeader
        title="App Router Demo"
        description={
          <>
            File-based router on top of React Router 7. Every link below
            exercises a feature implemented in{" "}
            <FilePath>src/lib/AppRouter.tsx</FilePath>.
          </>
        }
      />
      <Stack gap="lg">
        {SECTIONS.map((s) => (
          <Card key={s.title} as="section">
            <Stack gap="sm">
              <Heading level={4}>{s.title}</Heading>
              <Text size="xs" tone="muted" transform="uppercase">
                {s.feature}
              </Text>
              <Stack as="ul" gap="xs" className="list-none p-0 m-0">
                {s.files.map((f) => (
                  <li key={f}>
                    <Text as="span" size="xs" tone="muted">
                      <Code variant="plain" className="break-all">
                        src/app/{f}
                      </Code>
                    </Text>
                  </li>
                ))}
              </Stack>
              <Stack as="ul" gap="xs" className="list-none p-0 m-0">
                {s.links.map((l) => (
                  <li key={l.to}>
                    <NavLink to={l.to} size="sm">
                      {l.label}
                    </NavLink>
                  </li>
                ))}
              </Stack>
            </Stack>
          </Card>
        ))}
      </Stack>
    </Stack>
  );
}

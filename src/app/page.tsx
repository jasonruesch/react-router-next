import { Card } from "../components/ui/card";
import { Code, FilePath } from "../components/ui/code";
import { Heading } from "../components/ui/heading";
import { NavLink } from "../components/ui/nav";
import { PageHeader } from "../components/ui/page-header";
import { Stack } from "../components/ui/stack";
import { Text } from "../components/ui/text";
import { generate as generateMarketingAbout } from "./(marketing)/about/route.types";
import { generate as generateMarketingPricing } from "./(marketing)/pricing/route.types";
import { generate as generateDoc } from "./docs/[...slug]/route.types";
import { generate as generateFile } from "./files/[[...slug]]/route.types";
import { generate as generatePost } from "./posts/[postId]/route.types";
import { generate as generatePosts } from "./posts/route.types";
import { generate as generateSearch } from "./search/[[query]]/route.types";

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
      { to: generateMarketingAbout(), label: generateMarketingAbout() },
      { to: generateMarketingPricing(), label: generateMarketingPricing() },
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
    links: [{ to: generatePosts(), label: generatePosts() }],
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
      {
        to: generatePost({ postId: "1" }),
        label: generatePost({ postId: "1" }),
      },
      {
        to: generatePost({ postId: "2" }),
        label: generatePost({ postId: "2" }),
      },
      {
        to: generatePost({ postId: "999" }),
        label: generatePost({ postId: "999" }),
      },
    ],
  },
  {
    title: "Catch-all segment",
    feature: "[...slug]",
    files: ["docs/[...slug]/page.tsx"],
    links: [
      {
        to: generateDoc({ slug: ["intro"] }),
        label: generateDoc({ slug: ["intro"] }),
      },
      {
        to: generateDoc({ slug: ["api", "v2", "reference"] }),
        label: generateDoc({ slug: ["api", "v2", "reference"] }),
      },
      { to: generateDoc({ slug: [] }), label: generateDoc({ slug: [] }) },
    ],
  },
  {
    title: "Optional dynamic segment",
    feature: "[[query]]",
    files: ["search/[[query]]/page.tsx"],
    links: [
      { to: generateSearch({ query: undefined }), label: "/search (no param)" },
      {
        to: generateSearch({ query: "react-router" }),
        label: "/search/react-router",
      },
    ],
  },
  {
    title: "Optional catch-all segment",
    feature: "[[...slug]]",
    files: ["files/[[...slug]]/page.tsx"],
    links: [
      { to: generateFile({ slug: undefined }), label: "/files (no slug)" },
      { to: generateFile({ slug: ["readme"] }), label: "/files/readme" },
      {
        to: generateFile({ slug: ["src", "app", "page.tsx"] }),
        label: "/files/src/app/page.tsx",
      },
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

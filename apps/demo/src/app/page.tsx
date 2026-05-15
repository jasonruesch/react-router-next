import { generate as generateMarketingAbout } from "virtual:react-router-next/(marketing)/about";
import { generate as generateMarketingPricing } from "virtual:react-router-next/(marketing)/pricing";
import { generate as generateDashboard } from "virtual:react-router-next/dashboard";
import { generate as generateDashboardOther } from "virtual:react-router-next/dashboard/other";
import { generate as generateDashboardSettings } from "virtual:react-router-next/dashboard/settings";
import { generate as generateDoc } from "virtual:react-router-next/docs/[...slug]";
import { generate as generateFile } from "virtual:react-router-next/files/[[...slug]]";
import { generate as generatePhotos } from "virtual:react-router-next/photos";
import { generate as generatePhoto } from "virtual:react-router-next/photos/[id]";
import { generate as generateNotes } from "virtual:react-router-next/notes";
import { generate as generateNote } from "virtual:react-router-next/notes/[noteId]";
import { generate as generatePosts } from "virtual:react-router-next/posts";
import { generate as generatePost } from "virtual:react-router-next/posts/[postId]";
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
    title: "Suspense via a hook (no loader)",
    feature: "loading.tsx + use(), no loader.ts",
    files: [
      "notes/layout.tsx",
      "notes/loading.tsx",
      "notes/page.tsx",
      "notes/[noteId]/page.tsx",
      "notes/_lib/use-notes.ts",
    ],
    links: [
      { to: generateNotes(), label: generateNotes() },
      {
        to: generateNote({ noteId: "a" }),
        label: generateNote({ noteId: "a" }),
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
      {
        to: generateDoc({ slug: [] }),
        label: `${generateDoc({ slug: [] })} (bare /docs — required catch-all 404s)`,
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
    title: "Parallel routes (named slot props)",
    feature: "@slot/, default.tsx",
    files: [
      "dashboard/layout.tsx",
      "dashboard/page.tsx",
      "dashboard/settings/page.tsx",
      "dashboard/@analytics/page.tsx",
      "dashboard/@analytics/settings/page.tsx",
      "dashboard/@analytics/default.tsx",
    ],
    links: [
      { to: generateDashboard(), label: generateDashboard() },
      { to: generateDashboardSettings(), label: generateDashboardSettings() },
      { to: generateDashboardOther(), label: generateDashboardOther() },
    ],
  },
  {
    title:
      "Intercepting routes in a parallel slot + template + _private folder",
    feature: "@slot/, (.)x, template.tsx, _components/",
    files: [
      "photos/layout.tsx",
      "photos/page.tsx",
      "photos/[id]/page.tsx",
      "photos/[id]/template.tsx",
      "photos/@modal/(.)[id]/page.tsx",
      "photos/@modal/default.tsx",
      "photos/_components/dialog.tsx",
    ],
    links: [
      { to: generatePhotos(), label: generatePhotos() },
      {
        to: generatePhoto({ id: "1" }),
        label: `${generatePhoto({ id: "1" })} (refresh = full page)`,
      },
    ],
  },
  {
    title: "Root not-found",
    feature: "not-found.tsx (root)",
    files: ["not-found.tsx"],
    links: [{ to: "/no-such-route", label: "/no-such-route" }],
  },
  {
    title: "Per-segment not-found + notFound() helper",
    feature: "posts/not-found.tsx, notFound()",
    files: ["posts/not-found.tsx", "posts/[postId]/loader.ts"],
    links: [
      {
        to: generatePost({ postId: "missing" }),
        label: "/posts/missing (calls notFound())",
      },
      {
        to: "/posts/some/deep/unmatched/path",
        label: "/posts/some/deep/unmatched/path (segment splat)",
      },
    ],
  },
];

export default function Home() {
  return (
    <Stack gap="lg">
      <PageHeader
        title="React Router Next Demo"
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

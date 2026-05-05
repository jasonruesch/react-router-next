import { Link } from "react-router";

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
    <div>
      <h1 className="text-3xl font-semibold mb-2">App Router Demo</h1>
      <p className="text-gray-600 mb-8">
        File-based router on top of React Router 7. Every link below exercises a
        feature implemented in{" "}
        <code className="rounded bg-gray-100 px-1 py-0.5 text-sm">
          src/lib/AppRouter.tsx
        </code>
        .
      </p>
      <div className="space-y-6">
        {SECTIONS.map((s) => (
          <section key={s.title} className="rounded border border-gray-200 p-4">
            <h2 className="text-lg font-semibold">{s.title}</h2>
            <p className="text-xs uppercase tracking-wide text-gray-500 mt-0.5">
              {s.feature}
            </p>
            <ul className="mt-3 text-xs text-gray-500 space-y-0.5">
              {s.files.map((f) => (
                <li key={f}>
                  <code>src/app/{f}</code>
                </li>
              ))}
            </ul>
            <ul className="mt-3 space-y-1">
              {s.links.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-blue-600 hover:underline">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

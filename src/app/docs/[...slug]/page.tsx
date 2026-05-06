import { Link } from "react-router";
import type { PageProps } from "./page.types";

export default function DocsCatchAll({ params }: PageProps) {
  const { slug } = params;
  return (
    <article>
      <h1 className="text-2xl font-semibold mb-2">Docs catch-all</h1>
      <p className="text-gray-700 mb-3">
        Folder:{" "}
        <code className="rounded bg-gray-100 px-1 py-0.5 text-sm">
          src/app/docs/[...slug]/page.tsx
        </code>
        . The <code>useRouteParams</code> hook re-keys RR's{" "}
        <code>params["*"]</code> to the named <code>slug</code> and splits it
        into a <code>string[]</code>, matching Next.js's shape. Required
        catch-all — the bare <code>/docs</code> 404s (try it).
      </p>
      <p className="text-gray-700 mb-3">
        Matched:{" "}
        <code className="rounded bg-gray-100 px-1 py-0.5 text-sm">
          {slug.join("/")}
        </code>
      </p>
      <ol className="list-decimal pl-6 text-gray-700 mb-3">
        {slug.map((seg, i) => (
          <li key={i}>{seg}</li>
        ))}
      </ol>
      <div className="flex gap-3 mt-4 text-sm">
        <Link to="/docs/intro" className="hover:underline">
          /docs/intro
        </Link>
        <Link to="/docs/api/v2/reference" className="hover:underline">
          /docs/api/v2/reference
        </Link>
        <Link
          to="/docs/guides/getting-started/index"
          className="hover:underline"
        >
          /docs/guides/getting-started/index
        </Link>
      </div>
    </article>
  );
}

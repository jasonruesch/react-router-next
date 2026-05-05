import { Link, useParams } from "react-router";

export default function DocsCatchAll() {
  const params = useParams();
  const matched = params["*"] ?? "";
  const segments = matched.split("/").filter(Boolean);
  return (
    <article>
      <h1 className="text-2xl font-semibold mb-2">Docs catch-all</h1>
      <p className="text-gray-700 mb-3">
        Folder:{" "}
        <code className="rounded bg-gray-100 px-1 py-0.5 text-sm">
          src/app/docs/[...slug]/page.tsx
        </code>
        . React Router maps catch-all to the splat token <code>*</code>, so the
        matched value lives at <code>params["*"]</code>. Required catch-all —
        the bare <code>/docs</code> 404s (try it).
      </p>
      <p className="text-gray-700 mb-3">
        Matched:{" "}
        <code className="rounded bg-gray-100 px-1 py-0.5 text-sm">
          {matched}
        </code>
      </p>
      <ol className="list-decimal pl-6 text-gray-700 mb-3">
        {segments.map((seg, i) => (
          <li key={i}>{seg}</li>
        ))}
      </ol>
      <div className="flex gap-3 mt-4 text-sm">
        <Link to="/docs/intro" className="text-blue-600 hover:underline">
          /docs/intro
        </Link>
        <Link
          to="/docs/api/v2/reference"
          className="text-blue-600 hover:underline"
        >
          /docs/api/v2/reference
        </Link>
        <Link
          to="/docs/guides/getting-started/index"
          className="text-blue-600 hover:underline"
        >
          /docs/guides/getting-started/index
        </Link>
      </div>
    </article>
  );
}

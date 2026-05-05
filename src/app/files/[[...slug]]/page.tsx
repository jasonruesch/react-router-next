import { Link, useParams } from "react-router";

export default function FilesOptionalCatchAll() {
  const params = useParams();
  const matched = params["*"];
  const segments = matched ? matched.split("/").filter(Boolean) : [];
  return (
    <article>
      <h1 className="text-2xl font-semibold mb-2">
        Files (optional catch-all)
      </h1>
      <p className="text-gray-700 mb-3">
        Folder:{" "}
        <code className="rounded bg-gray-100 px-1 py-0.5 text-sm">
          src/app/files/[[...slug]]/page.tsx
        </code>
        . Optional catch-all matches both the bare path and any depth below.
        The router emits two RR routes for this segment: an index match for{" "}
        <code>/files</code> and a splat match for everything under it.
      </p>
      <p className="text-gray-700 mb-3">
        Matched:{" "}
        <code className="rounded bg-gray-100 px-1 py-0.5 text-sm">
          {matched ?? "(undefined — bare /files)"}
        </code>
      </p>
      {segments.length > 0 && (
        <ol className="list-decimal pl-6 text-gray-700 mb-3">
          {segments.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
      )}
      <div className="flex flex-wrap gap-3 mt-4 text-sm">
        <Link to="/files" className="text-blue-600 hover:underline">
          /files
        </Link>
        <Link to="/files/readme" className="text-blue-600 hover:underline">
          /files/readme
        </Link>
        <Link
          to="/files/src/app/page.tsx"
          className="text-blue-600 hover:underline"
        >
          /files/src/app/page.tsx
        </Link>
      </div>
    </article>
  );
}

import { Link } from "react-router";
import type { PageProps } from "../../../lib/useRouteParams";

const SUGGESTIONS = ["react", "react-router", "vite", "tailwind"];

export default function Search({ params }: PageProps<"search/[[query]]">) {
  const { query: q } = params;
  return (
    <article>
      <h1 className="text-2xl font-semibold mb-2">Search</h1>
      <p className="text-gray-700 mb-3">
        Folder:{" "}
        <code className="rounded bg-gray-100 px-1 py-0.5 text-sm">
          src/app/search/[[query]]/page.tsx
        </code>
        . Double brackets make the segment optional — <code>:query?</code> in
        React Router terms.
      </p>
      {q ? (
        <p className="text-gray-700 mb-4">
          Searching for{" "}
          <code className="rounded bg-gray-100 px-1 py-0.5 text-sm">{q}</code>.
        </p>
      ) : (
        <p className="text-gray-700 mb-4">
          No query in the URL — <code>params.query</code> is{" "}
          <code>undefined</code>.
        </p>
      )}
      <div className="text-sm">
        <p className="text-gray-500 mb-1">Try:</p>
        <ul className="space-y-1">
          {SUGGESTIONS.map((s) => (
            <li key={s}>
              <Link to={`/search/${s}`} className="hover:underline">
                /search/{s}
              </Link>
            </li>
          ))}
          <li>
            <Link to="/search" className="hover:underline">
              /search (clear)
            </Link>
          </li>
        </ul>
      </div>
    </article>
  );
}

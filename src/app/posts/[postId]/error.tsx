import { Link, useRouteError } from "react-router";

export default function PostError() {
  const error = useRouteError();
  const message =
    error instanceof Error
      ? error.message
      : error instanceof Response
        ? `${error.status} ${error.statusText || ""}`.trim()
        : String(error);
  return (
    <div className="rounded border border-red-300 p-4">
      <h2 className="text-lg font-semibold text-red-900 mb-1">
        Couldn't load this post
      </h2>
      <p className="text-sm text-red-800 mb-3">{message}</p>
      <p className="text-xs text-red-700 mb-3">
        Boundary from{" "}
        <code className="rounded bg-red-100 px-1 py-0.5">
          src/app/posts/[postId]/error.tsx
        </code>
        . The root layout and posts layout are still rendered — only the leaf
        was replaced.
      </p>
      <Link to="/posts" className="hover:underline text-sm">
        ← back to posts
      </Link>
    </div>
  );
}

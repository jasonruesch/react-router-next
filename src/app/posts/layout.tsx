import { Link, Outlet } from "react-router";

export default function PostsLayout() {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Posts</h1>
        <Link to="/posts" className="text-sm hover:underline">
          ← all posts
        </Link>
      </div>
      <p className="text-xs text-gray-500 mb-4">
        Layout from{" "}
        <code className="rounded bg-gray-100 px-1 py-0.5">
          src/app/posts/layout.tsx
        </code>
        .
      </p>
      <div className="rounded border border-(--border) p-4">
        <Outlet />
      </div>
    </div>
  );
}

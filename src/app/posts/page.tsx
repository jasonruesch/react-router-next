import { Link, useLoaderData } from "react-router";
import type { Post } from "./loader";

export default function PostsIndex() {
  const posts = useLoaderData() as Post[];
  return (
    <div>
      <p className="text-gray-700 mb-4">
        Loaded {posts.length} posts via{" "}
        <code className="rounded bg-gray-100 px-1 py-0.5 text-sm">
          src/app/posts/loader.ts
        </code>
        . Click one — sibling navigation triggers the loading skeleton from{" "}
        <code className="rounded bg-gray-100 px-1 py-0.5 text-sm">
          loading.tsx
        </code>
        .
      </p>
      <ul className="divide-y divide-(--border)">
        {posts.map((p) => (
          <li key={p.id} className="py-2">
            <Link to={`/posts/${p.id}`} className="hover:underline">
              {p.id}. {p.title}
            </Link>
            <p className="text-sm text-gray-600">{p.body}</p>
          </li>
        ))}
        <li className="py-2">
          <Link to="/posts/999" className="text-red-600 hover:underline">
            999. (loader throws — exercises error.tsx)
          </Link>
        </li>
      </ul>
    </div>
  );
}

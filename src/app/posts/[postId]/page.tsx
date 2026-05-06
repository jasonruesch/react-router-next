import { useLoaderData } from "react-router";
import type { Post } from "../loader";
import type { PageProps } from "./page.types";

export default function PostPage({ params }: PageProps) {
  const post = useLoaderData() as Post;
  const { postId } = params;
  return (
    <article>
      <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
      <p className="text-gray-700 mb-4">{post.body}</p>
      <dl className="text-xs text-gray-500 grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1">
        <dt>File</dt>
        <dd>
          <code>src/app/posts/[postId]/page.tsx</code>
        </dd>
        <dt>params.postId</dt>
        <dd>
          <code>{postId}</code>
        </dd>
      </dl>
    </article>
  );
}

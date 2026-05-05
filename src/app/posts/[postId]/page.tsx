import { useLoaderData, useParams } from "react-router";
import type { Post } from "../loader";

export default function PostPage() {
  const post = useLoaderData() as Post;
  const params = useParams();
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
          <code>{params.postId}</code>
        </dd>
      </dl>
    </article>
  );
}

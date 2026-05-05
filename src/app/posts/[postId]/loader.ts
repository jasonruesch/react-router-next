import type { LoaderFunction } from "react-router";
import { POSTS } from "../loader";
import type { Post } from "../loader";

export const loader: LoaderFunction = async ({ params }) => {
  await new Promise((r) => setTimeout(r, 400));
  if (params.postId === "999") {
    throw new Error("Post 999 was deliberately broken to demo error.tsx.");
  }
  const post: Post | undefined = POSTS.find(
    (p) => String(p.id) === params.postId,
  );
  if (!post) {
    throw new Response("Not found", { status: 404 });
  }
  return post;
};

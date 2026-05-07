import type { LoaderFunction } from "react-router";
import { parseRouteParams } from "react-router-next";
import type { Post } from "../loader";
import { POSTS } from "../loader";

export const loader: LoaderFunction = async ({ params }) => {
  await new Promise((r) => setTimeout(r, 400));
  const { postId } = parseRouteParams("posts/[postId]", params);
  if (postId === "999") {
    throw new Error("Post 999 was deliberately broken to demo error.tsx.");
  }
  const post: Post | undefined = POSTS.find((p) => String(p.id) === postId);
  if (!post) {
    throw new Response("Not found", { status: 404 });
  }
  return post;
};

import type { LoaderFunction } from "react-router";

export type Post = { id: number; title: string; body: string };

export const POSTS: Post[] = [
  { id: 1, title: "Hello, world", body: "First post in the demo dataset." },
  {
    id: 2,
    title: "Loaders explained",
    body: "loader.ts files run before render and the page reads the data with useLoaderData().",
  },
  {
    id: 3,
    title: "Layouts compose",
    body: "Nested layouts wrap children via <Outlet />.",
  },
];

export const loader: LoaderFunction = async () => {
  await new Promise((r) => setTimeout(r, 600));
  return POSTS;
};

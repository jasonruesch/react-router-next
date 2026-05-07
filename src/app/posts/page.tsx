import { useLoaderData } from "react-router";
import { FilePath } from "../../components/ui/code";
import { NavLink } from "../../components/ui/nav";
import { Stack } from "../../components/ui/stack";
import { Text } from "../../components/ui/text";
import { generate as generatePost } from "./[postId]/route.types";
import type { Post } from "./loader";

export default function PostsIndex() {
  const posts = useLoaderData<Post[]>();
  return (
    <Stack gap="md">
      <Text>
        Loaded {posts.length} posts via{" "}
        <FilePath>src/app/posts/loader.ts</FilePath>. Click one — sibling
        navigation triggers the loading skeleton from{" "}
        <FilePath>loading.tsx</FilePath>.
      </Text>
      <ul className="m-0 p-0 list-none divide-y divide-border">
        {posts.map((p) => (
          <li key={p.id} className="py-2">
            <NavLink to={generatePost({ postId: String(p.id) })}>
              {p.id}. {p.title}
            </NavLink>
            <Text size="sm" tone="muted">
              {p.body}
            </Text>
          </li>
        ))}
        <li className="py-2">
          <NavLink to={generatePost({ postId: "999" })} tone="destructive">
            999. (loader throws — exercises error.tsx)
          </NavLink>
        </li>
      </ul>
    </Stack>
  );
}

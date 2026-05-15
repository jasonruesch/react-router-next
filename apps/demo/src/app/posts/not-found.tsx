import { useLocation } from "react-router";
import { Card } from "../../components/ui/card";
import { FilePath } from "../../components/ui/code";
import { Heading } from "../../components/ui/heading";
import { NavLink } from "../../components/ui/nav";
import { Stack } from "../../components/ui/stack";
import { Text } from "../../components/ui/text";
import { generate as generatePosts } from "virtual:react-router-next/posts";

export default function PostsNotFound() {
  const location = useLocation();
  return (
    <Card padding="lg" align="center">
      <Stack gap="sm" align="center">
        <Heading level={2}>Post not found</Heading>
        <Text tone="muted">
          No post matches <FilePath>{location.pathname}</FilePath>. This page
          comes from <FilePath>src/app/posts/not-found.tsx</FilePath> — the
          nearest <FilePath>not-found.tsx</FilePath> wins, so the section nav
          stays mounted.
        </Text>
        <NavLink to={generatePosts()}>Back to posts</NavLink>
      </Stack>
    </Card>
  );
}

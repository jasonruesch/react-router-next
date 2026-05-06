import { Outlet } from "react-router";
import { Card } from "../../components/ui/card";
import { FilePath } from "../../components/ui/code";
import { Heading } from "../../components/ui/heading";
import { BackLink } from "../../components/ui/nav";
import { Stack } from "../../components/ui/stack";
import { Text } from "../../components/ui/text";

export default function PostsLayout() {
  return (
    <Stack gap="md">
      <Stack direction="row" align="center" justify="between" gap="md">
        <Heading level={2}>Posts</Heading>
        <BackLink to="/posts">all posts</BackLink>
      </Stack>
      <Text size="xs" tone="muted">
        Layout from <FilePath>src/app/posts/layout.tsx</FilePath>.
      </Text>
      <Card>
        <Outlet />
      </Card>
    </Stack>
  );
}

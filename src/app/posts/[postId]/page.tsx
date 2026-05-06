import { useLoaderData } from "react-router";
import { Code } from "../../../components/ui/code";
import { Heading } from "../../../components/ui/heading";
import { Stack } from "../../../components/ui/stack";
import { Text } from "../../../components/ui/text";
import type { Post } from "../loader";
import type { RouteProps } from "./route.types";

export default function PostPage({ params }: RouteProps) {
  const post = useLoaderData<Post>();
  const { postId } = params;
  return (
    <Stack as="article" gap="sm">
      <Heading level={3}>{post.title}</Heading>
      <Text>{post.body}</Text>
      <dl className="m-0 grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <dt>File</dt>
        <dd>
          <Code variant="plain">src/app/posts/[postId]/page.tsx</Code>
        </dd>
        <dt>params.postId</dt>
        <dd>
          <Code variant="plain">{postId}</Code>
        </dd>
      </dl>
    </Stack>
  );
}

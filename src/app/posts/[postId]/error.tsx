import { useRouteError } from "react-router";
import { FilePath } from "../../../components/ui/code";
import { ErrorPanel } from "../../../components/ui/error-panel";
import { BackLink } from "../../../components/ui/nav";
import { Text } from "../../../components/ui/text";

export default function PostError() {
  const error = useRouteError();
  const message =
    error instanceof Error
      ? error.message
      : error instanceof Response
        ? `${error.status} ${error.statusText || ""}`.trim()
        : String(error);
  return (
    <ErrorPanel
      title="Couldn't load this post"
      message={message}
      action={<BackLink to="/posts">back to posts</BackLink>}
    >
      <Text size="xs" tone="destructive">
        Boundary from <FilePath>src/app/posts/[postId]/error.tsx</FilePath>. The
        root layout and posts layout are still rendered — only the leaf was
        replaced.
      </Text>
    </ErrorPanel>
  );
}

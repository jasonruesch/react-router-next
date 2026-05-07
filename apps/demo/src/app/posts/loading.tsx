import { FilePath } from "../../components/ui/code";
import { SkeletonLine } from "../../components/ui/skeleton";
import { Stack } from "../../components/ui/stack";
import { Text } from "../../components/ui/text";

export default function PostsLoading() {
  return (
    <Stack gap="sm">
      <SkeletonLine width="1/3" />
      <SkeletonLine width="2/3" />
      <SkeletonLine width="1/2" />
      <Text size="sm" tone="muted">
        Skeleton from <FilePath>src/app/posts/loading.tsx</FilePath>.
      </Text>
    </Stack>
  );
}

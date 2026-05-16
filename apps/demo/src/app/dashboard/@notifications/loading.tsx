import { FilePath } from "../../../components/ui/code";
import { SkeletonLine } from "../../../components/ui/skeleton";
import { Stack } from "../../../components/ui/stack";
import { Text } from "../../../components/ui/text";

export default function NotificationsLoading() {
  return (
    <Stack gap="sm">
      <SkeletonLine width="2/3" />
      <SkeletonLine width="full" />
      <SkeletonLine width="1/2" />
      <Text size="xs" tone="muted">
        Slot skeleton from{" "}
        <FilePath>src/app/dashboard/@notifications/loading.tsx</FilePath>. Only
        this column suspends — the main panel and{" "}
        <FilePath>@analytics</FilePath> slot render normally.
      </Text>
    </Stack>
  );
}

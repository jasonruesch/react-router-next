import { FilePath } from "../../../components/ui/code";
import { Stack } from "../../../components/ui/stack";
import { Text } from "../../../components/ui/text";

export default function AnalyticsDefault() {
  return (
    <Stack gap="xs">
      <Text size="sm" tone="muted">
        No analytics for this view.
      </Text>
      <Text size="xs" tone="muted">
        Fallback from{" "}
        <FilePath>src/app/dashboard/@analytics/default.tsx</FilePath>.
      </Text>
    </Stack>
  );
}

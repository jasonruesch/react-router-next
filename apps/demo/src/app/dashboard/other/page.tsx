import { FilePath } from "../../../components/ui/code";
import { Heading } from "../../../components/ui/heading";
import { Stack } from "../../../components/ui/stack";
import { Text } from "../../../components/ui/text";

export default function DashboardOtherPage() {
  return (
    <Stack gap="sm">
      <Heading level={3}>Other</Heading>
      <Text>
        Other panel from <FilePath>src/app/dashboard/other/page.tsx</FilePath>.
      </Text>
      <Text tone="muted" size="sm">
        The aside swapped to the analytics filter — it's matched from{" "}
        <FilePath>src/app/dashboard/@analytics/other/page.tsx</FilePath>{" "}
        independently of the URL handling for this main panel.
      </Text>
    </Stack>
  );
}

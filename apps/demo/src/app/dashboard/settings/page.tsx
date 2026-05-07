import { FilePath } from "../../../components/ui/code";
import { Heading } from "../../../components/ui/heading";
import { Stack } from "../../../components/ui/stack";
import { Text } from "../../../components/ui/text";

export default function DashboardSettingsPage() {
  return (
    <Stack gap="sm">
      <Heading level={3}>Settings</Heading>
      <Text>
        Settings panel from{" "}
        <FilePath>src/app/dashboard/settings/page.tsx</FilePath>.
      </Text>
      <Text tone="muted" size="sm">
        The aside swapped to the analytics filter — it's matched from{" "}
        <FilePath>src/app/dashboard/@analytics/settings/page.tsx</FilePath>{" "}
        independently of the URL handling for this main panel.
      </Text>
    </Stack>
  );
}

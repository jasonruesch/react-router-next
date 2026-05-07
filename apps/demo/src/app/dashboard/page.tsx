import { FilePath } from "../../components/ui/code";
import { Heading } from "../../components/ui/heading";
import { Stack } from "../../components/ui/stack";
import { Text } from "../../components/ui/text";

export default function DashboardPage() {
  return (
    <Stack gap="sm">
      <Heading level={3}>Overview</Heading>
      <Text>
        Main panel content from <FilePath>src/app/dashboard/page.tsx</FilePath>.
      </Text>
      <Text tone="muted" size="sm">
        The aside on the right is rendered from a different file —{" "}
        <FilePath>src/app/dashboard/@analytics/page.tsx</FilePath> — but appears
        in the same layout because <FilePath>@analytics</FilePath> is a parallel
        route slot.
      </Text>
    </Stack>
  );
}

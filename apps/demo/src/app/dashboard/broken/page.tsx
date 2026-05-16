import { FilePath } from "../../../components/ui/code";
import { Heading } from "../../../components/ui/heading";
import { Stack } from "../../../components/ui/stack";
import { Text } from "../../../components/ui/text";

export default function DashboardBrokenPage() {
  return (
    <Stack gap="sm">
      <Heading level={3}>Broken slot demo</Heading>
      <Text>
        Look at the <FilePath>@notifications</FilePath> column on the right — it
        is rendering{" "}
        <FilePath>src/app/dashboard/@notifications/error.tsx</FilePath> because{" "}
        <FilePath>src/app/dashboard/@notifications/broken/page.tsx</FilePath>{" "}
        suspended on a promise that rejects.
      </Text>
      <Text tone="muted" size="sm">
        Only that slot failed. This main panel and the{" "}
        <FilePath>@analytics</FilePath> slot are still rendering — that's the
        whole point of slot-scoped error boundaries.
      </Text>
    </Stack>
  );
}

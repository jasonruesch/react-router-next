import { Outlet } from "react-router";
import { Code, FilePath } from "../../components/ui/code";
import { Stack } from "../../components/ui/stack";
import { Text } from "../../components/ui/text";

export default function MarketingLayout() {
  return (
    <Stack gap="md">
      <Text size="xs" tone="muted">
        Layout from <FilePath>src/app/(marketing)/layout.tsx</FilePath> —{" "}
        <Code variant="plain">(marketing)</Code> is a route group, invisible to
        the URL.
      </Text>
      <Outlet />
    </Stack>
  );
}

import { FilePath } from "../../../components/ui/code";
import { Heading } from "../../../components/ui/heading";
import { Stack } from "../../../components/ui/stack";
import { Text } from "../../../components/ui/text";
import { useNotifications } from "../_lib/use-notifications";

export default function DashboardNotificationsPage() {
  const notifications = useNotifications("ok");
  return (
    <Stack gap="sm">
      <Heading level={4}>Notifications</Heading>
      <Stack as="ul" gap="xs" className="m-0 list-none p-0">
        {notifications.map((n) => (
          <li key={n.id}>
            <Text size="sm">{n.title}</Text>
            <Text size="xs" tone="muted">
              {n.time}
            </Text>
          </li>
        ))}
      </Stack>
      <Text size="xs" tone="muted">
        Slot from <FilePath>src/app/dashboard/@notifications/page.tsx</FilePath>
        .
      </Text>
    </Stack>
  );
}

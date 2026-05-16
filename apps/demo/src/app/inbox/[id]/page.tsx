import { generate as generateInbox } from "virtual:react-router-next/inbox";
import type { RouteProps } from "virtual:react-router-next/inbox/[id]";
import { Card } from "../../../components/ui/card";
import { FilePath } from "../../../components/ui/code";
import { Heading } from "../../../components/ui/heading";
import { BackLink } from "../../../components/ui/nav";
import { Stack } from "../../../components/ui/stack";
import { Text } from "../../../components/ui/text";
import { useMessage } from "../_lib/use-message";

export default function MessagePage({ params }: RouteProps) {
  const message = useMessage(params.id);
  return (
    <Stack gap="md">
      <BackLink to={generateInbox()}>back to inbox</BackLink>
      <Card>
        <Stack gap="xs">
          <Heading level={3}>{message.subject}</Heading>
          <Text size="sm" tone="muted">
            From {message.from}
          </Text>
          <Text>{message.body}</Text>
        </Stack>
      </Card>
      <Text size="xs" tone="muted">
        Full page from <FilePath>src/app/inbox/[id]/page.tsx</FilePath>.
      </Text>
    </Stack>
  );
}

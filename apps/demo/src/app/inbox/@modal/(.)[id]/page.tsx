import { generate as generateInbox } from "virtual:react-router-next/inbox";
import type { RouteProps } from "virtual:react-router-next/inbox/[id]";
import { FilePath } from "../../../../components/ui/code";
import { Heading } from "../../../../components/ui/heading";
import { Stack } from "../../../../components/ui/stack";
import { Text } from "../../../../components/ui/text";
import { Dialog } from "../../_components/dialog";
import { useMessage } from "../../_lib/use-message";

export default function MessageModal({ params }: RouteProps) {
  const message = useMessage(params.id);
  return (
    <Dialog closeTo={generateInbox()}>
      <Stack gap="xs" className="p-4">
        <Heading level={3}>{message.subject}</Heading>
        <Text size="sm" tone="muted">
          From {message.from}
        </Text>
        <Text>{message.body}</Text>
        <Text size="xs" tone="muted">
          Modal interceptor —{" "}
          <FilePath>src/app/inbox/@modal/(.)[id]/page.tsx</FilePath>. Press
          Escape or click outside to close.
        </Text>
      </Stack>
    </Dialog>
  );
}

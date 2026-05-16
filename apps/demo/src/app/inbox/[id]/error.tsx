import { useRouteError } from "@evolonix/react-router-next";
import { generate as generateInbox } from "virtual:react-router-next/inbox";
import { FilePath } from "../../../components/ui/code";
import { ErrorPanel } from "../../../components/ui/error-panel";
import { BackLink } from "../../../components/ui/nav";
import { Text } from "../../../components/ui/text";

export default function MessageModalError() {
  const error = useRouteError();
  const message =
    error instanceof Error
      ? error.message
      : error instanceof Response
        ? `${error.status} ${error.statusText || ""}`.trim()
        : String(error);
  return (
    <ErrorPanel
      title="Couldn't load this message"
      message={message}
      action={<BackLink to={generateInbox()}>back to inbox</BackLink>}
    >
      <Text size="xs" tone="destructive">
        Boundary from <FilePath>src/app/inbox/[id]/error.tsx</FilePath>. The
        root layout and inbox layout are still rendered — only the leaf was
        replaced.
      </Text>
    </ErrorPanel>
  );
}

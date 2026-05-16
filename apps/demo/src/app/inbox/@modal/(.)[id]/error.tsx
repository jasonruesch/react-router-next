import { useRouteError } from "@evolonix/react-router-next";
import { generate as generateInbox } from "virtual:react-router-next/inbox";
import { FilePath } from "../../../../components/ui/code";
import { ErrorPanel } from "../../../../components/ui/error-panel";
import { BackLink } from "../../../../components/ui/nav";
import { Text } from "../../../../components/ui/text";
import { Dialog } from "../../_components/dialog";

export default function MessageModalError() {
  const error = useRouteError();
  const message =
    error instanceof Error
      ? error.message
      : error instanceof Response
        ? `${error.status} ${error.statusText || ""}`.trim()
        : String(error);
  return (
    <Dialog closeTo={generateInbox()}>
      <div className="p-4">
        <ErrorPanel
          title="Couldn't load this message"
          message={message}
          action={<BackLink to={generateInbox()}>back to inbox</BackLink>}
        >
          <Text size="xs" tone="destructive">
            Modal boundary from{" "}
            <FilePath>src/app/inbox/@modal/(.)[id]/error.tsx</FilePath>. The
            inbox list behind the dialog is still mounted.
          </Text>
        </ErrorPanel>
      </div>
    </Dialog>
  );
}

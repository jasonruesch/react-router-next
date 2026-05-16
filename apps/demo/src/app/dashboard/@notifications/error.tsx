import { useRouteError } from "@evolonix/react-router-next";
import { generate as generateDashboard } from "virtual:react-router-next/dashboard";
import { FilePath } from "../../../components/ui/code";
import { ErrorPanel } from "../../../components/ui/error-panel";
import { BackLink } from "../../../components/ui/nav";
import { Text } from "../../../components/ui/text";

export default function NotificationsError() {
  const error = useRouteError();
  const message =
    error instanceof Error
      ? error.message
      : error instanceof Response
        ? `${error.status} ${error.statusText || ""}`.trim()
        : String(error);
  return (
    <ErrorPanel
      title="Couldn't load notifications"
      message={message}
      action={<BackLink to={generateDashboard()}>back to dashboard</BackLink>}
    >
      <Text size="xs" tone="destructive">
        Slot boundary from{" "}
        <FilePath>src/app/dashboard/@notifications/error.tsx</FilePath>. The
        main outlet and the <FilePath>@analytics</FilePath> slot are unaffected.
      </Text>
    </ErrorPanel>
  );
}

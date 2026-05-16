import { generate as generateMessage } from "virtual:react-router-next/inbox/[id]";
import { FilePath } from "../../components/ui/code";
import { Heading } from "../../components/ui/heading";
import { NavLink } from "../../components/ui/nav";
import { Stack } from "../../components/ui/stack";
import { Text } from "../../components/ui/text";
import { MESSAGES } from "./data";

export default function InboxPage() {
  return (
    <Stack gap="md">
      <Heading level={2}>Inbox</Heading>
      <Text>
        Click a message. The <FilePath>@modal</FilePath> parallel slot pairs
        with the interceptor at{" "}
        <FilePath>src/app/inbox/@modal/(.)[id]/page.tsx</FilePath>, so the list
        stays mounted while the message overlays. The interceptor's hook
        suspends, so{" "}
        <FilePath>src/app/inbox/@modal/(.)[id]/loading.tsx</FilePath> renders
        inside the dialog until the message resolves.
      </Text>
      <ul className="m-0 list-none p-0 divide-y divide-border">
        {MESSAGES.map((m) => (
          <li key={m.id} className="py-2">
            <NavLink to={generateMessage({ id: m.id })} viewTransition={false}>
              {m.subject}
            </NavLink>
            <Text size="sm" tone="muted">
              {m.from}
            </Text>
          </li>
        ))}
        <li className="py-2">
          <NavLink
            to={generateMessage({ id: "999" })}
            viewTransition={false}
            tone="destructive"
          >
            broken (id 999)
          </NavLink>
          <Text size="sm" tone="muted">
            Opens the modal, then{" "}
            <FilePath>src/app/inbox/@modal/(.)[id]/error.tsx</FilePath> renders
            inside the dialog when the hook throws.
          </Text>
        </li>
      </ul>
      <Text size="xs" tone="muted">
        Refresh on a message URL to see the full-page fallback from{" "}
        <FilePath>src/app/inbox/[id]/page.tsx</FilePath>.
      </Text>
    </Stack>
  );
}

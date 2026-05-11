import { Outlet } from "react-router";
import { Card } from "../../components/ui/card";
import { FilePath } from "../../components/ui/code";
import { Heading } from "../../components/ui/heading";
import { BackLink } from "../../components/ui/nav";
import { Stack } from "../../components/ui/stack";
import { Text } from "../../components/ui/text";
import { generate as generateNotes } from "virtual:react-router-next/notes";

export default function NotesLayout() {
  return (
    <Stack gap="md">
      <Stack direction="row" align="center" justify="between" gap="md">
        <Heading level={2}>Notes</Heading>
        <BackLink to={generateNotes()}>all notes</BackLink>
      </Stack>
      <Text size="xs" tone="muted">
        Layout from <FilePath>src/app/notes/layout.tsx</FilePath>. No{" "}
        <FilePath>loader.ts</FilePath> — the page suspends on a hook and the
        loading boundary catches it.
      </Text>
      <Card>
        <Outlet />
      </Card>
    </Stack>
  );
}

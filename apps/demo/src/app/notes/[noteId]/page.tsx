import { Code } from "../../../components/ui/code";
import { Heading } from "../../../components/ui/heading";
import { Stack } from "../../../components/ui/stack";
import { Text } from "../../../components/ui/text";
import { useNote } from "../_lib/use-notes";
import type { RouteProps } from "virtual:react-router-next/notes/[noteId]";

export default function NotePage({ params }: RouteProps) {
  const note = useNote(params.noteId);
  return (
    <Stack as="article" gap="sm">
      <Heading level={3}>{note.title}</Heading>
      <Text>{note.body}</Text>
      <dl className="m-0 grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <dt>File</dt>
        <dd>
          <Code variant="plain">src/app/notes/[noteId]/page.tsx</Code>
        </dd>
        <dt>params.noteId</dt>
        <dd>
          <Code variant="plain">{note.id}</Code>
        </dd>
      </dl>
    </Stack>
  );
}

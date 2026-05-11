import { generate as generateNote } from "virtual:react-router-next/notes/[noteId]";
import { FilePath } from "../../components/ui/code";
import { NavLink } from "../../components/ui/nav";
import { Stack } from "../../components/ui/stack";
import { Text } from "../../components/ui/text";
import { useNotes } from "./_lib/use-notes";

export default function NotesIndex() {
  const notes = useNotes();
  return (
    <Stack gap="md">
      <Text>
        Loaded {notes.length} notes via the <FilePath>useNotes()</FilePath> hook
        in <FilePath>src/app/notes/_lib/use-notes.ts</FilePath>. The hook
        suspends on a cached promise; the same <FilePath>loading.tsx</FilePath>{" "}
        that covers router loaders catches it.
      </Text>
      <ul className="m-0 p-0 list-none divide-y divide-border">
        {notes.map((n) => (
          <li key={n.id} className="py-2">
            <NavLink to={generateNote({ noteId: n.id })}>
              {n.id}. {n.title}
            </NavLink>
            <Text size="sm" tone="muted">
              {n.body}
            </Text>
          </li>
        ))}
      </ul>
    </Stack>
  );
}

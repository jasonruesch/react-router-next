import { Code, FilePath } from "../../../components/ui/code";
import { PageHeader } from "../../../components/ui/page-header";
import { Stack } from "../../../components/ui/stack";
import { Text } from "../../../components/ui/text";

export default function Contact() {
  return (
    <Stack as="article" gap="sm">
      <PageHeader
        title="Contact"
        level={2}
        description={
          <>
            This page lives at{" "}
            <FilePath>src/app/(marketing)/contact/page.tsx</FilePath>.
          </>
        }
      />
      <Text>
        The <Code variant="plain">(marketing)</Code> folder is a{" "}
        <strong className="text-foreground font-semibold">route group</strong> —
        the parens make it invisible to the URL. The page is reachable at{" "}
        <Code variant="plain">/contact</Code>, not{" "}
        <Code variant="plain">/(marketing)/contact</Code>. Useful for organizing
        files (and sharing a layout) without affecting the URL shape.
      </Text>
    </Stack>
  );
}

import { Code, FilePath } from "../../../components/ui/code";
import { NavLink } from "../../../components/ui/nav";
import { PageHeader } from "../../../components/ui/page-header";
import { Stack } from "../../../components/ui/stack";
import { Text } from "../../../components/ui/text";
import type { PageProps } from "./page.types";

export default function DocsCatchAll({ params }: PageProps) {
  const { slug } = params;
  return (
    <Stack as="article" gap="sm">
      <PageHeader
        title="Docs catch-all"
        level={2}
        description={
          <>
            Folder: <FilePath>src/app/docs/[...slug]/page.tsx</FilePath>. The{" "}
            <Code variant="plain">useRouteParams</Code> hook re-keys RR's{" "}
            <Code variant="plain">params["*"]</Code> to the named{" "}
            <Code variant="plain">slug</Code> and splits it into a{" "}
            <Code variant="plain">string[]</Code>, matching Next.js's shape.
            Required catch-all — the bare <Code variant="plain">/docs</Code>{" "}
            404s (try it).
          </>
        }
      />
      <Text>
        Matched: <FilePath>{slug.join("/")}</FilePath>
      </Text>
      <ol className="list-decimal pl-6 m-0 text-muted-foreground">
        {slug.map((seg, i) => (
          <li key={i}>{seg}</li>
        ))}
      </ol>
      <Stack direction="row" gap="md" wrap>
        <NavLink to="/docs/intro" size="sm">
          /docs/intro
        </NavLink>
        <NavLink to="/docs/api/v2/reference" size="sm">
          /docs/api/v2/reference
        </NavLink>
        <NavLink to="/docs/guides/getting-started/index" size="sm">
          /docs/guides/getting-started/index
        </NavLink>
      </Stack>
    </Stack>
  );
}

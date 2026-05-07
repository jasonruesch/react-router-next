import { Code, FilePath } from "../../../components/ui/code";
import { NavLink } from "../../../components/ui/nav";
import { PageHeader } from "../../../components/ui/page-header";
import { Stack } from "../../../components/ui/stack";
import { Text } from "../../../components/ui/text";
import type { RouteProps } from "virtual:react-router-next/docs/[...slug]";
import { generate as generateDoc } from "virtual:react-router-next/docs/[...slug]";

export default function DocsCatchAll({ params }: RouteProps) {
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
            Required catch-all — the bare{" "}
            <Code variant="plain">
              <NavLink to={generateDoc({ slug: [] })}>/docs</NavLink>{" "}
            </Code>
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
        <NavLink to={generateDoc({ slug: ["intro"] })} size="sm">
          {generateDoc({ slug: ["intro"] })}
        </NavLink>
        <NavLink
          to={generateDoc({ slug: ["api", "v2", "reference"] })}
          size="sm"
        >
          {generateDoc({ slug: ["api", "v2", "reference"] })}
        </NavLink>
        <NavLink
          to={generateDoc({ slug: ["guides", "getting-started", "index"] })}
          size="sm"
        >
          {generateDoc({ slug: ["guides", "getting-started", "index"] })}
        </NavLink>
      </Stack>
    </Stack>
  );
}

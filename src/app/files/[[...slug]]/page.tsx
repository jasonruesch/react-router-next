import { FilePath } from "../../../components/ui/code";
import { NavLink } from "../../../components/ui/nav";
import { PageHeader } from "../../../components/ui/page-header";
import { Stack } from "../../../components/ui/stack";
import { Text } from "../../../components/ui/text";
import type { RouteProps } from "./route.types";
import { generate as generateFile } from "./route.types";

export default function FilesOptionalCatchAll({ params }: RouteProps) {
  const { slug } = params;
  return (
    <Stack as="article" gap="sm">
      <PageHeader
        title="Files (optional catch-all)"
        level={2}
        description={
          <>
            Folder: <FilePath>src/app/files/[[...slug]]/page.tsx</FilePath>.
            Optional catch-all matches both the bare path and any depth below.
            The router emits two RR routes for this segment: an index match for{" "}
            <FilePath>/files</FilePath> and a splat match for everything under
            it.
          </>
        }
      />
      <Text>
        Matched:{" "}
        <FilePath>
          {slug ? slug.join("/") : "(undefined — bare /files)"}
        </FilePath>
      </Text>
      {slug && slug.length > 0 && (
        <ol className="list-decimal pl-6 m-0 text-muted-foreground">
          {slug.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
      )}
      <Stack direction="row" gap="md" wrap>
        <NavLink to={generateFile({ slug: undefined })} size="sm">
          {generateFile({ slug: undefined })}
        </NavLink>
        <NavLink to={generateFile({ slug: ["readme"] })} size="sm">
          {generateFile({ slug: ["readme"] })}
        </NavLink>
        <NavLink to={generateFile({ slug: ["src", "app", "page"] })} size="sm">
          {generateFile({ slug: ["src", "app", "page"] })}
        </NavLink>
      </Stack>
    </Stack>
  );
}

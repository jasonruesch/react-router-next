import { Code, FilePath } from "../../../components/ui/code";
import { NavLink } from "../../../components/ui/nav";
import { PageHeader } from "../../../components/ui/page-header";
import { Stack } from "../../../components/ui/stack";
import { Text } from "../../../components/ui/text";
import type { RouteProps } from "./route.types";
import { generate as generateSearch } from "./route.types";

const SUGGESTIONS = ["react", "react-router", "vite", "tailwind"];

export default function Search({ params }: RouteProps) {
  const { query: q } = params;
  return (
    <Stack as="article" gap="sm">
      <PageHeader
        title="Search"
        level={2}
        description={
          <>
            Folder: <FilePath>src/app/search/[[query]]/page.tsx</FilePath>.
            Double brackets make the segment optional —{" "}
            <Code variant="plain">:query?</Code> in React Router terms.
          </>
        }
      />
      {q ? (
        <Text>
          Searching for <FilePath>{q}</FilePath>.
        </Text>
      ) : (
        <Text>
          No query in the URL — <Code variant="plain">params.query</Code> is{" "}
          <Code variant="plain">undefined</Code>.
        </Text>
      )}
      <Stack gap="xs">
        <Text size="sm" tone="subtle">
          Try:
        </Text>
        <Stack as="ul" gap="xs" className="list-none m-0 p-0">
          {SUGGESTIONS.map((s) => (
            <li key={s}>
              <NavLink to={generateSearch({ query: s })} size="sm">
                /search/{s}
              </NavLink>
            </li>
          ))}
          <li>
            <NavLink to={generateSearch({ query: undefined })} size="sm">
              /search (clear)
            </NavLink>
          </li>
        </Stack>
      </Stack>
    </Stack>
  );
}

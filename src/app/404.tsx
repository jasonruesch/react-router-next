import { useLocation } from "react-router";
import { Card } from "../components/ui/card";
import { FilePath } from "../components/ui/code";
import { Heading } from "../components/ui/heading";
import { NavLink } from "../components/ui/nav";
import { Stack } from "../components/ui/stack";
import { Text } from "../components/ui/text";
import { generate as generateHome } from "./route.types";

export default function NotFound() {
  const location = useLocation();
  return (
    <Card padding="lg" align="center">
      <Stack gap="sm" align="center">
        <Heading level={1}>404</Heading>
        <Text tone="muted">
          No route matches <FilePath>{location.pathname}</FilePath>. This page
          comes from <FilePath>src/app/404.tsx</FilePath>.
        </Text>
        <NavLink to={generateHome()}>Go home</NavLink>
      </Stack>
    </Card>
  );
}

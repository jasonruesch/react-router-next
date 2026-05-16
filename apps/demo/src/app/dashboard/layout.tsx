import type { ReactNode } from "react";
import { Outlet } from "react-router";
import { generate as generateDashboard } from "virtual:react-router-next/dashboard";
import { generate as generateDashboardBroken } from "virtual:react-router-next/dashboard/broken";
import { generate as generateDashboardOther } from "virtual:react-router-next/dashboard/other";
import { generate as generateDashboardSettings } from "virtual:react-router-next/dashboard/settings";
import { Card } from "../../components/ui/card";
import { Code, FilePath } from "../../components/ui/code";
import { Heading } from "../../components/ui/heading";
import { NavLink } from "../../components/ui/nav";
import { Stack } from "../../components/ui/stack";
import { Text } from "../../components/ui/text";

export default function DashboardLayout({
  analytics,
  notifications,
}: {
  analytics: ReactNode;
  notifications: ReactNode;
}) {
  return (
    <Stack gap="md">
      <Stack direction="row" align="center" justify="between" gap="md" wrap>
        <Heading level={2}>Dashboard</Heading>
        <Stack direction="row" gap="sm" wrap>
          <NavLink to={generateDashboard()}>overview</NavLink>
          <NavLink to={generateDashboardSettings()}>settings</NavLink>
          <NavLink to={generateDashboardOther()}>other</NavLink>
          <NavLink to={generateDashboardBroken()} tone="destructive">
            broken
          </NavLink>
        </Stack>
      </Stack>
      <Text size="xs" tone="muted">
        Layout from <FilePath>src/app/dashboard/layout.tsx</FilePath> — receives
        the <Code variant="plain">analytics</Code> and{" "}
        <Code variant="plain">notifications</Code> slots as named props.
      </Text>
      <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
        <Card as="section">
          <Outlet />
        </Card>
        <Card as="aside" tone="default">
          <Stack gap="sm">
            <Text size="xs" tone="muted" transform="uppercase">
              @analytics
            </Text>
            {analytics}
          </Stack>
        </Card>
      </div>
      <Card as="aside" tone="default">
        <Stack gap="sm">
          <Text size="xs" tone="muted" transform="uppercase">
            @notifications
          </Text>
          {notifications}
        </Stack>
      </Card>
    </Stack>
  );
}

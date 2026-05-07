import { Heading } from "../../../components/ui/heading";
import { Stack } from "../../../components/ui/stack";
import { Text } from "../../../components/ui/text";

const BARS = [42, 68, 31, 87, 55, 73, 49];

export default function DashboardAnalyticsPage() {
  return (
    <Stack gap="sm">
      <Heading level={4}>Visits this week</Heading>
      <div className="flex h-24 items-end gap-1">
        {BARS.map((v, i) => (
          <div
            key={i}
            className="flex-1 rounded-t bg-primary/70"
            style={{ height: `${v}%` }}
          />
        ))}
      </div>
      <Text size="xs" tone="muted">
        Mon · Tue · Wed · Thu · Fri · Sat · Sun
      </Text>
    </Stack>
  );
}

import { Heading } from "../../../../components/ui/heading";
import { Stack } from "../../../../components/ui/stack";
import { Text } from "../../../../components/ui/text";

const FILTERS = ["Last 7 days", "Last 30 days", "Custom range"];

export default function AnalyticsSettingsPage() {
  return (
    <Stack gap="sm">
      <Heading level={4}>Analytics range</Heading>
      <Stack as="ul" gap="xs" className="m-0 list-none p-0">
        {FILTERS.map((f, i) => (
          <li key={f} className="flex items-center gap-2">
            <input
              type="radio"
              name="range"
              defaultChecked={i === 0}
              readOnly
            />
            <Text as="span" size="sm">
              {f}
            </Text>
          </li>
        ))}
      </Stack>
    </Stack>
  );
}

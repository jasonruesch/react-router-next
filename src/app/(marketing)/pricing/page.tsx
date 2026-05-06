import { Card } from "../../../components/ui/card";
import { Code, FilePath } from "../../../components/ui/code";
import { Heading } from "../../../components/ui/heading";
import { PageHeader } from "../../../components/ui/page-header";
import { Stack } from "../../../components/ui/stack";
import { Text } from "../../../components/ui/text";

const TIERS = [
  { name: "Hobby", price: "$0", blurb: "For tinkering." },
  { name: "Pro", price: "$0", blurb: "Also for tinkering." },
];

export default function Pricing() {
  return (
    <Stack as="article" gap="md">
      <PageHeader
        title="Pricing"
        level={2}
        description={
          <>
            This page lives at{" "}
            <FilePath>src/app/(marketing)/pricing/page.tsx</FilePath> and is
            reachable at <Code variant="plain">/pricing</Code> — same{" "}
            <Code variant="plain">(marketing)</Code> route group as{" "}
            <Code variant="plain">/about</Code>.
          </>
        }
      />
      <ul className="grid grid-cols-2 gap-4 m-0 p-0 list-none">
        {TIERS.map((t) => (
          <Card key={t.name} as="li">
            <Stack gap="xs">
              <Heading level={4}>{t.name}</Heading>
              <Text size="lg" tone="default">
                {t.price}
              </Text>
              <Text size="sm" tone="muted">
                {t.blurb}
              </Text>
            </Stack>
          </Card>
        ))}
      </ul>
    </Stack>
  );
}

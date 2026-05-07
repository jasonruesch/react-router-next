import { Card } from "../../../components/ui/card";
import { FilePath } from "../../../components/ui/code";
import { Heading } from "../../../components/ui/heading";
import { BackLink } from "../../../components/ui/nav";
import { Stack } from "../../../components/ui/stack";
import { Text } from "../../../components/ui/text";
import { generate as generatePhotos } from "virtual:react-router-next/photos";
import type { RouteProps } from "virtual:react-router-next/photos/[id]";
import { PHOTOS } from "../page";

export default function PhotoPage({ params }: RouteProps) {
  const photo = PHOTOS.find((p) => p.id === params.id);
  return (
    <Stack gap="md">
      <BackLink to={generatePhotos()}>back to photos</BackLink>
      <Card padding="none">
        <div
          aria-hidden
          className="h-72 w-full"
          style={{ background: photo?.color ?? "#888" }}
        />
        <Stack gap="xs" className="p-4">
          <Heading level={3}>{photo?.title ?? "Unknown photo"}</Heading>
          <Text size="sm" tone="muted">
            Full page from <FilePath>src/app/photos/[id]/page.tsx</FilePath>.
          </Text>
        </Stack>
      </Card>
    </Stack>
  );
}

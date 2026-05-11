import { FilePath } from "../../../../components/ui/code";
import { Heading } from "../../../../components/ui/heading";
import { Stack } from "../../../../components/ui/stack";
import { Text } from "../../../../components/ui/text";
import { generate as generatePhotos } from "virtual:react-router-next/photos";
import type { RouteProps } from "virtual:react-router-next/photos/[id]";
import { PHOTOS } from "../../data";
import { Dialog } from "../../_components/dialog";

export default function PhotoModal({ params }: RouteProps) {
  const photo = PHOTOS.find((p) => p.id === params.id);
  return (
    <Dialog closeTo={generatePhotos()}>
      <div
        aria-hidden
        className="h-56 w-full rounded-t"
        style={{ background: photo?.color ?? "#888" }}
      />
      <Stack gap="xs" className="p-4">
        <Heading level={3}>{photo?.title ?? "Unknown photo"}</Heading>
        <Text size="sm" tone="muted">
          Modal interceptor —{" "}
          <FilePath>src/app/photos/@modal/(.)[id]/page.tsx</FilePath>. Press
          Escape or click outside to close.
        </Text>
      </Stack>
    </Dialog>
  );
}

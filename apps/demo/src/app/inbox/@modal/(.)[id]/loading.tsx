import { generate as generateInbox } from "virtual:react-router-next/inbox";
import { FilePath } from "../../../../components/ui/code";
import { SkeletonLine } from "../../../../components/ui/skeleton";
import { Stack } from "../../../../components/ui/stack";
import { Text } from "../../../../components/ui/text";
import { Dialog } from "../../_components/dialog";

export default function MessageModalLoading() {
  return (
    <Dialog closeTo={generateInbox()}>
      <Stack gap="sm" className="p-4">
        <SkeletonLine width="2/3" height="lg" />
        <SkeletonLine width="1/3" />
        <SkeletonLine width="full" />
        <SkeletonLine width="3/4" />
        <Text size="xs" tone="muted">
          Modal skeleton from{" "}
          <FilePath>src/app/inbox/@modal/(.)[id]/loading.tsx</FilePath>. Renders
          inside the dialog while <FilePath>useMessage()</FilePath> suspends.
        </Text>
      </Stack>
    </Dialog>
  );
}

import { FilePath } from "../../components/ui/code";
import { NavLink } from "../../components/ui/nav";
import { Stack } from "../../components/ui/stack";
import { Text } from "../../components/ui/text";
import { generate as generatePhoto } from "virtual:react-router-next/photos/[id]";
import { PHOTOS } from "./data";

export default function PhotosPage() {
  return (
    <Stack gap="md">
      <Text>
        Click a photo. Inside the app the modal interceptor matches —{" "}
        <FilePath>src/app/photos/(.)[id]/page.tsx</FilePath> — so you stay on
        the grid with the photo overlaid. Refresh on a photo URL to see the
        full-page version from <FilePath>photos/[id]/page.tsx</FilePath>.
      </Text>
      <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3">
        {PHOTOS.map((p) => (
          <li key={p.id}>
            <NavLink
              to={generatePhoto({ id: p.id })}
              viewTransition={false}
              className="block overflow-hidden rounded border border-border"
            >
              <div
                aria-hidden
                className="h-32 w-full"
                style={{ background: p.color }}
              />
              <div className="px-2 py-1">
                <Text size="sm">{p.title}</Text>
              </div>
            </NavLink>
          </li>
        ))}
      </ul>
    </Stack>
  );
}

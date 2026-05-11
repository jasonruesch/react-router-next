import type { ReactNode } from "react";
import { Outlet } from "react-router";

export default function PhotosLayout({ modal }: { modal: ReactNode }) {
  return (
    <>
      <Outlet />
      {modal}
    </>
  );
}

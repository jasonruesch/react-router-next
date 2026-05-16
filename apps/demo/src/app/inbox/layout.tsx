import type { ReactNode } from "react";
import { Outlet } from "react-router";

export default function InboxLayout({ modal }: { modal: ReactNode }) {
  return (
    <>
      <Outlet />
      {modal}
    </>
  );
}

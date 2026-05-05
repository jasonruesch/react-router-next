import { Outlet } from "react-router";

export default function MarketingLayout() {
  return (
    <div>
      <p className="text-xs text-gray-500 mb-4">
        Layout from{" "}
        <code className="rounded bg-gray-100 px-1 py-0.5">
          src/app/(marketing)/layout.tsx
        </code>{" "}
        — <code>(marketing)</code> is a route group, invisible to the URL.
      </p>
      <Outlet />
    </div>
  );
}

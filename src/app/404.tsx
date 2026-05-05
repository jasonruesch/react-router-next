import { Link, useLocation } from "react-router";

export default function NotFound() {
  const location = useLocation();
  return (
    <div className="rounded border border-gray-200 p-6 text-center">
      <h1 className="text-3xl font-semibold mb-2">404</h1>
      <p className="text-gray-600 mb-4">
        No route matches{" "}
        <code className="rounded bg-gray-100 px-1 py-0.5 text-sm">
          {location.pathname}
        </code>
        . This page comes from{" "}
        <code className="rounded bg-gray-100 px-1 py-0.5 text-sm">
          src/app/404.tsx
        </code>
        .
      </p>
      <Link to="/" className="text-blue-600 hover:underline">
        Go home
      </Link>
    </div>
  );
}

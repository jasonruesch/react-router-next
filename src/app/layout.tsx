import { Link, Outlet, useNavigation } from "react-router";

export default function RootLayout() {
  const nav = useNavigation();
  return (
    <div className="min-h-screen text-white">
      <header className="border-b border-(--border)">
        <div className="mx-auto max-w-3xl px-6 py-4 flex items-center justify-between">
          <Link to="/" className="font-semibold">
            App Router Demo
          </Link>
          <nav className="flex gap-4 text-sm text-gray-600">
            <Link to="/about" className="hover:underline">
              About
            </Link>
            <Link to="/pricing" className="hover:underline">
              Pricing
            </Link>
            <Link to="/posts" className="hover:underline">
              Posts
            </Link>
            <Link to="/docs/intro" className="hover:underline">
              Docs
            </Link>
            <Link to="/search" className="hover:underline">
              Search
            </Link>
            <Link to="/files" className="hover:underline">
              Files
            </Link>
          </nav>
        </div>
        {nav.state === "loading" && (
          <div className="h-0.5 bg-blue-500 animate-pulse" />
        )}
      </header>
      <main className="mx-auto max-w-3xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}

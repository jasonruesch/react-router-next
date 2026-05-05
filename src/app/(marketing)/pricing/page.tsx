export default function Pricing() {
  return (
    <article>
      <h1 className="text-2xl font-semibold mb-2">Pricing</h1>
      <p className="text-gray-700 mb-3">
        This page lives at{" "}
        <code className="rounded bg-gray-100 px-1 py-0.5 text-sm">
          src/app/(marketing)/pricing/page.tsx
        </code>{" "}
        and is reachable at <code>/pricing</code> — same{" "}
        <code>(marketing)</code> route group as <code>/about</code>.
      </p>
      <ul className="grid grid-cols-2 gap-4 mt-6">
        <li className="rounded border border-(--border) p-4">
          <h2 className="font-semibold">Hobby</h2>
          <p className="text-2xl mt-1">$0</p>
          <p className="text-sm text-gray-600 mt-2">For tinkering.</p>
        </li>
        <li className="rounded border border-(--border) p-4">
          <h2 className="font-semibold">Pro</h2>
          <p className="text-2xl mt-1">$0</p>
          <p className="text-sm text-gray-600 mt-2">Also for tinkering.</p>
        </li>
      </ul>
    </article>
  );
}

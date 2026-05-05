export default function About() {
  return (
    <article className="prose">
      <h1 className="text-2xl font-semibold mb-2">About</h1>
      <p className="text-gray-700 mb-3">
        This page lives at{" "}
        <code className="rounded bg-gray-100 px-1 py-0.5 text-sm">
          src/app/(marketing)/about/page.tsx
        </code>
        .
      </p>
      <p className="text-gray-700">
        The <code>(marketing)</code> folder is a <strong>route group</strong> —
        the parens make it invisible to the URL. The page is reachable at{" "}
        <code>/about</code>, not <code>/(marketing)/about</code>. Useful for
        organizing files (and sharing a layout) without affecting the URL shape.
      </p>
    </article>
  );
}

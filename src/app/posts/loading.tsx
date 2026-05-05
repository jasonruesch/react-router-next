export default function PostsLoading() {
  return (
    <div className="text-gray-500">
      <div className="h-4 w-1/3 bg-gray-700 rounded animate-pulse mb-2" />
      <div className="h-4 w-2/3 bg-gray-700 rounded animate-pulse mb-2" />
      <div className="h-4 w-1/2 bg-gray-700 rounded animate-pulse mb-4" />
      <p className="text-sm">
        Skeleton from{" "}
        <code className="rounded bg-gray-100 px-1 py-0.5">
          src/app/posts/loading.tsx
        </code>
        .
      </p>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="container-wrap py-12">
      <div className="h-10 w-64 skeleton rounded" />
      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i}>
            <div className="aspect-square w-full skeleton rounded-sm" />
            <div className="mt-3 h-3 w-1/2 skeleton rounded" />
            <div className="mt-2 h-3 w-3/4 skeleton rounded" />
            <div className="mt-2 h-3 w-1/3 skeleton rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

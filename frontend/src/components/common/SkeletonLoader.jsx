function SkeletonLoader({ type = "card", count = 1 }) {
  const items = Array.from({ length: count });

  if (type === "text") {
    return (
      <div className="space-y-2 animate-pulse">
        <div className="h-4 w-3/4 rounded bg-[#1C1C1C]" />
        <div className="h-4 w-1/2 rounded bg-[#1C1C1C]" />
      </div>
    );
  }

  if (type === "table") {
    return (
      <div className="space-y-3 animate-pulse">
        {items.map((_, i) => (
          <div key={i} className="h-12 w-full rounded-xl bg-[#111111] border border-[#262626]" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((_, i) => (
        <div
          key={i}
          className="flex h-32 flex-col justify-between rounded-2xl border border-[#262626] bg-[#0A0A0A] p-5 backdrop-blur-xl animate-pulse"
        >
          <div className="h-4 w-24 rounded bg-[#1F1F1F]" />
          <div className="h-8 w-16 rounded bg-[#262626]" />
          <div className="h-3 w-32 rounded bg-[#171717]" />
        </div>
      ))}
    </div>
  );
}

export default SkeletonLoader;

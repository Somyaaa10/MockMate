function SkeletonLoader({ type = "card", count = 1 }) {
  const items = Array.from({ length: count });

  if (type === "text") {
    return (
      <div className="space-y-2 animate-pulse">
        <div className="h-4 w-3/4 rounded bg-[var(--hover-bg-2)]" />
        <div className="h-4 w-1/2 rounded bg-[var(--hover-bg-2)]" />
      </div>
    );
  }

  if (type === "table") {
    return (
      <div className="space-y-3 animate-pulse">
        {items.map((_, i) => (
          <div key={i} className="h-12 w-full rounded-xl bg-[var(--card-bg-2)] border border-[var(--strong-line)]" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((_, i) => (
        <div
          key={i}
          className="flex h-32 flex-col justify-between rounded-2xl border border-[var(--strong-line)] bg-[var(--bg-surface)] p-5 backdrop-blur-xl animate-pulse"
        >
          <div className="h-4 w-24 rounded bg-[var(--hover-bg-4)]" />
          <div className="h-8 w-16 rounded bg-[var(--strong-line)]" />
          <div className="h-3 w-32 rounded bg-[var(--chip-bg)]" />
        </div>
      ))}
    </div>
  );
}

export default SkeletonLoader;

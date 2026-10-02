import { Infinity as InfinityIcon } from "lucide-react";
import { Skeleton } from "./DashboardPrimitives";
import { cx } from "./cx";
import { normalizeFeatures } from "./featureRegistry";

/* ------------------------------------------------------------------
   Quota display — "Unlimited", a number, or a dash
   ------------------------------------------------------------------ */
function QuotaValue({ quota }) {
  if (quota === null) {
    return (
      <span className="inline-flex items-center gap-1 text-[var(--text-primary)] font-mono">
        <InfinityIcon className="h-4 w-4" aria-hidden="true" />
        Unlimited
      </span>
    );
  }
  if (quota === undefined) return <span className="text-[var(--text-muted)] font-mono">—</span>;
  return <span className="text-[var(--text-primary)] font-mono">{quota}</span>;
}

/* ------------------------------------------------------------------
   Feature card — icon + title at top, level & quota rows below
   ------------------------------------------------------------------ */
export function FeatureCard({ feature, onClick }) {
  const Icon = feature.icon;
  const Wrapper = onClick ? "button" : "div";
  const levelText = String(feature.level || "BASIC").toUpperCase();

  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cx(
        "group rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 text-left shadow-[var(--panel-shadow)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--primary)] hover:shadow-md flex w-full flex-col",
        onClick && "cursor-pointer"
      )}
    >
      {/* Top: Icon box + Title */}
      <div className="flex items-center gap-3.5">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)] transition duration-200 group-hover:bg-[var(--primary)] group-hover:text-white"
          aria-hidden="true"
        >
          <Icon className="h-5 w-5" />
        </span>
        <h3 className="truncate font-display text-base font-bold text-[var(--text-primary)]">
          {feature.name}
        </h3>
      </div>

      {/* Rows: Level & Quota */}
      <div className="mt-5 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-medium text-[var(--text-secondary)]">
            Level
          </span>
          <span className="rounded-lg border border-[var(--border)] bg-[var(--background-soft)] px-2.5 py-1 font-mono text-[11px] font-semibold text-[var(--text-primary)] uppercase">
            {levelText}
          </span>
        </div>

        <div className="border-t border-[var(--border)] pt-3" />

        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-medium text-[var(--text-secondary)]">
            Quota
          </span>
          <span className="rounded-lg border border-[var(--border)] bg-[var(--background-soft)] px-3 py-1 text-xs font-semibold text-[var(--text-primary)]">
            <QuotaValue quota={feature.quota} />
          </span>
        </div>
      </div>
    </Wrapper>
  );
}

/* ------------------------------------------------------------------
   Responsive feature grid
   ------------------------------------------------------------------ */
export function FeatureGrid({ features, loading = false, onSelect }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-xs flex h-[200px] flex-col justify-between">
            <Skeleton className="h-11 w-11 rounded-xl" />
            <div className="space-y-2.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const list = normalizeFeatures(features);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((feature) => (
        <FeatureCard
          key={feature.feature}
          feature={feature}
          onClick={feature.link && onSelect ? () => onSelect(feature.link) : undefined}
        />
      ))}
    </div>
  );
}

export default FeatureGrid;

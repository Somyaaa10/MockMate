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
      <span className="inline-flex items-center gap-1 text-[var(--mm-text)]">
        <InfinityIcon className="h-4 w-4" aria-hidden="true" />
        Unlimited
      </span>
    );
  }
  if (quota === undefined) return <span className="text-[var(--mm-text-3)]">—</span>;
  return <span className="text-[var(--mm-text)]">{quota}</span>;
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
        "mm-card mm-card-hover flex w-full flex-col p-5 text-left",
        onClick && "cursor-pointer"
      )}
    >
      {/* Top: Icon box + Title */}
      <div className="flex items-center gap-3.5">
        <span
          className="mm-icon-tile grid h-11 w-11 shrink-0 place-items-center rounded-xl"
          style={{
            color: feature.accent,
            backgroundColor: feature.tint,
            borderColor: feature.ring,
          }}
          aria-hidden="true"
        >
          <Icon className="h-5 w-5" />
        </span>
        <h3 className="truncate font-display text-[15px] font-bold text-[var(--mm-text)]">
          {feature.name}
        </h3>
      </div>

      {/* Rows: Level & Quota */}
      <div className="mt-5 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[13px] font-medium text-[var(--mm-text-2)]">
            Level
          </span>
          <span className="rounded-lg border border-[var(--mm-border)] bg-[var(--mm-card-2)] px-3 py-1 font-mono text-[11px] font-bold tracking-wider text-[var(--mm-text)] uppercase">
            {levelText}
          </span>
        </div>

        <div className="border-t border-[var(--mm-border)] pt-3" />

        <div className="flex items-center justify-between gap-3">
          <span className="text-[13px] font-medium text-[var(--mm-text-2)]">
            Quota
          </span>
          <span className="rounded-lg border border-[var(--mm-border)] bg-[var(--mm-card-2)] px-3.5 py-1 font-mono text-[12px] font-bold text-[var(--mm-text)]">
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="mm-card flex h-[236px] flex-col justify-between p-5">
            <Skeleton className="h-12 w-12 rounded-xl" />
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

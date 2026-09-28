/* ------------------------------------------------------------------
   Reusable primitives for the MockMate dashboard.
   Presentational only — no data fetching, no API knowledge.
   ------------------------------------------------------------------ */

import { cx } from "./cx";

/* ------------------------------------------------------------------
   Section wrapper — consistent vertical rhythm
   ------------------------------------------------------------------ */
export function Section({ id, title, action, children, className = "" }) {
  return (
    <section id={id} className={cx("scroll-mt-28", className)}>
      {title && (
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="font-display text-[17px] font-bold tracking-tight text-[var(--mm-text)]">
            {title}
          </h2>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

/* ------------------------------------------------------------------
   Card
   ------------------------------------------------------------------ */
export function Card({ as: Tag = "div", hover = false, className = "", children, ...rest }) {
  return (
    <Tag className={cx("mm-card", hover && "mm-card-hover", className)} {...rest}>
      {children}
    </Tag>
  );
}

/* ------------------------------------------------------------------
   Card header — icon tile + title + optional trailing node
   ------------------------------------------------------------------ */
export function CardHeader({ icon: Icon, accent = "var(--mm-purple)", title, subtitle, action }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        {Icon && (
          <span
            className="mm-icon-tile h-10 w-10 shrink-0"
            style={{
              color: accent,
              borderColor: "var(--mm-border)",
              backgroundColor: "var(--mm-card-2)",
            }}
            aria-hidden="true"
          >
            <Icon className="h-[18px] w-[18px]" />
          </span>
        )}
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-bold tracking-tight text-[var(--mm-text)]">
            {title}
          </h3>
          {subtitle && (
            <p className="truncate text-[11.5px] text-[var(--mm-text-3)]">{subtitle}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}

/* ------------------------------------------------------------------
   Empty state — one clear explanation, one primary action
   ------------------------------------------------------------------ */
export function EmptyState({ icon: Icon, title, description, action, className = "" }) {
  return (
    <div className={cx("mm-card px-6 py-16 text-center", className)}>
      <div className="mm-empty-icon">
        <Icon className="h-8 w-8 text-white" aria-hidden="true" />
      </div>
      <h3 className="mt-6 font-display text-xl font-bold tracking-tight text-[var(--mm-text)]">
        {title}
      </h3>
      <p className="mx-auto mt-2.5 max-w-sm text-[13.5px] leading-relaxed text-[var(--mm-text-2)]">
        {description}
      </p>
      {action && <div className="mt-7 flex justify-center">{action}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------
   Loading skeletons
   ------------------------------------------------------------------ */
export function Skeleton({ className = "", style, ...rest }) {
  return <div className={cx("mm-skeleton", className)} style={style} aria-hidden="true" {...rest} />;
}

export function SkeletonStatGrid({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="mm-card flex h-[150px] flex-col justify-between p-5">
          <Skeleton className="h-11 w-11 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonBlock({ height = 180, className = "" }) {
  return <Skeleton className={cx("w-full", className)} style={{ height }} />;
}

/* ------------------------------------------------------------------
   Inline alert — user-safe copy only
   ------------------------------------------------------------------ */
export function Alert({ tone = "info", children, onDismiss, className = "" }) {
  const tones = {
    success: "border-[rgba(16,185,129,0.30)] bg-[rgba(16,185,129,0.10)] text-[#10B981]",
    error: "border-[rgba(239,68,68,0.30)] bg-[rgba(239,68,68,0.10)] text-[#F87171]",
    info: "border-[var(--mm-border)] bg-[var(--mm-card-2)] text-[var(--mm-text-2)]",
  };

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cx(
        "flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-[13px] font-medium",
        tones[tone],
        className
      )}
    >
      <span className="min-w-0">{children}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 opacity-60 transition-opacity hover:opacity-100"
          aria-label="Dismiss"
        >
          ✕
        </button>
      )}
    </div>
  );
}

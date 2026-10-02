import { Check, Crown, Shield, Star, Zap } from "lucide-react";
import { Card, Skeleton } from "./DashboardPrimitives";
import { cx } from "./cx";

const PLAN_STYLE = {
  FREE: {
    icon: Star,
    button: "btn-secondary",
  },
  PRO: {
    icon: Zap,
    button: "btn-primary",
  },
  ENTERPRISE: {
    icon: Shield,
    button: "btn-secondary",
  },
};

const styleFor = (name) => PLAN_STYLE[String(name || "").toUpperCase()] || PLAN_STYLE.FREE;

/* ------------------------------------------------------------------
   Pricing card
   ------------------------------------------------------------------ */
export function PricingCard({
  name,
  price,
  suffix = "/month",
  tagline,
  features = [],
  actionLabel,
  onAction,
  isCurrent = false,
  disabled = false,
  loadingAction = false,
}) {
  const style = styleFor(name);
  const Icon = style.icon;
  const isPro = String(name || "").toUpperCase() === "PRO";

  return (
    <div
      className={cx(
        "relative flex flex-col items-center p-7 text-center rounded-2xl border bg-[var(--surface)] shadow-[var(--panel-shadow)] transition-all duration-200",
        isCurrent
          ? "border-2 border-[var(--success)] shadow-md"
          : isPro
          ? "border-2 border-[var(--primary)] bg-gradient-to-b from-[var(--primary-subtle)] via-[var(--surface)] to-[var(--surface)]"
          : "border-[var(--border)]"
      )}
    >
      {isCurrent && (
        <span className="absolute -top-3.5 rounded-full bg-[var(--success)] px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-xs">
          Current Plan
        </span>
      )}

      {/* Circle Icon Tile */}
      <div
        className={cx(
          "mt-2 flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-xs",
          isPro ? "bg-[var(--primary)] text-white" : "bg-[var(--primary-soft)] text-[var(--primary)]"
        )}
      >
        <Icon className="h-7 w-7" />
      </div>

      <h3 className="mt-4 font-display text-xl font-extrabold text-[var(--text-primary)]">
        {name}
      </h3>

      <div className="mt-2 flex items-baseline justify-center gap-1">
        <span className="font-hero text-3xl font-extrabold text-[var(--text-primary)]">
          {price}
        </span>
        {price !== "Custom" && (
          <span className="text-xs font-semibold text-[var(--text-secondary)]">{suffix}</span>
        )}
      </div>

      <p className="mt-2 min-h-[40px] text-xs leading-relaxed text-[var(--text-secondary)]">
        {tagline}
      </p>

      {features.length > 0 && (
        <ul className="mt-6 flex w-full flex-col gap-2.5 border-t border-[var(--border)] pt-6 text-left">
          {features.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-xs text-[var(--text-secondary)]">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--success)]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}

      {actionLabel && (
        <button
          type="button"
          onClick={onAction}
          disabled={disabled || isCurrent}
          className={cx(
            "mt-6 w-full py-3 text-xs font-semibold rounded-xl transition duration-200 flex items-center justify-center gap-2",
            isCurrent
              ? "bg-[var(--background-soft)] text-[var(--text-muted)] border border-[var(--border)] cursor-not-allowed"
              : isPro
              ? "bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white shadow-xs"
              : "border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
          )}
        >
          {loadingAction && (
            <span
              className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
              aria-hidden="true"
            />
          )}
          {actionLabel}
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------
   "Current Subscription" banner
   ------------------------------------------------------------------ */
export function CurrentPlanBanner({ planName, isPremium, description }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-7 shadow-[var(--panel-shadow)]">
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">Current Subscription</p>
          <p className="mt-2 text-base font-semibold leading-snug text-[var(--text-primary)] sm:text-lg">
            {description || (
              <>
                You are currently on the{" "}
                <span className="text-[var(--primary)] font-bold">{String(planName || "FREE").toUpperCase()}</span> plan
              </>
            )}
          </p>
        </div>

        <span
          className={cx(
            "inline-flex items-center gap-1.5 shrink-0 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider border",
            isPremium
              ? "bg-[var(--primary)] text-white border-transparent shadow-xs"
              : "bg-[var(--background-soft)] text-[var(--text-secondary)] border-[var(--border)]"
          )}
        >
          <Crown className="h-3.5 w-3.5" aria-hidden="true" />
          {String(planName || "FREE").toUpperCase()}
        </span>
      </div>
    </div>
  );
}

export function PlanFeatureTile({ name, quota, unlimited }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--panel-shadow)] flex flex-col">
      <p className="font-display text-xs font-extrabold uppercase tracking-wide text-[var(--text-primary)]">
        {name}
      </p>
      <p className="mt-1.5 text-xs font-semibold text-[var(--text-secondary)]">
        {unlimited ? "Quota: Unlimited" : `Quota: ${quota ?? "—"}`}
      </p>
    </div>
  );
}

export function PricingCardSkeleton() {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 flex flex-col">
      <Skeleton className="h-10 w-10 rounded-xl" />
      <Skeleton className="mt-4 h-8 w-24" />
      <Skeleton className="mt-5 h-9 w-20" />
      <div className="my-5 h-px w-full bg-[var(--border)]" />
      <div className="flex flex-1 flex-col gap-2.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-3.5 w-full" />
        ))}
      </div>
      <Skeleton className="mt-6 h-11 w-full rounded-xl" />
    </div>
  );
}

export default PricingCard;

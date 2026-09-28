import { Check, Crown, Shield, Star, Zap } from "lucide-react";
import { Card, Skeleton } from "./DashboardPrimitives";
import { cx } from "./cx";

/* ------------------------------------------------------------------
   Plan accents matching Screenshots 4 & 5
   ------------------------------------------------------------------ */
const PLAN_STYLE = {
  FREE: {
    icon: Star,
    accent: "#A1A1AA",
    bg: "#27272A",
    button: "mm-btn-ghost",
  },
  PRO: {
    icon: Zap,
    accent: "#EC4899",
    bg: "#EC4899",
    button: "mm-btn-primary",
  },
  ENTERPRISE: {
    icon: Shield,
    accent: "#F59E0B",
    bg: "#F59E0B",
    button: "mm-btn-ghost",
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

  return (
    <Card
      className={cx(
        "relative flex flex-col items-center p-7 text-center transition-all",
        isCurrent && "border-2 border-[#10B981] shadow-[0_0_20px_rgba(16,185,129,0.2)]"
      )}
    >
      {isCurrent && (
        <span className="absolute -top-3.5 rounded-full bg-[#10B981] px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
          Current Plan
        </span>
      )}

      {/* Circle Icon Tile */}
      <div
        className="mt-2 grid h-14 w-14 place-items-center rounded-full text-white"
        style={{ backgroundColor: style.bg }}
      >
        <Icon className="h-7 w-7 fill-current" />
      </div>

      <h3 className="mt-4 font-display text-[20px] font-bold text-[var(--mm-text)]">
        {name}
      </h3>

      <div className="mt-2 flex items-baseline justify-center gap-1">
        <span className="font-display text-[32px] font-bold text-[var(--mm-text)]">
          {price}
        </span>
        {price !== "Custom" && (
          <span className="text-[13px] font-medium text-[var(--mm-text-2)]">{suffix}</span>
        )}
      </div>

      <p className="mt-2 min-h-[40px] text-[13px] text-[var(--mm-text-2)]">
        {tagline}
      </p>

      {features.length > 0 && (
        <ul className="mt-6 flex w-full flex-col gap-2.5 border-t border-[var(--mm-border)] pt-6 text-left">
          {features.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-[13px] text-[var(--mm-text-2)]">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#10B981]" />
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
            "mm-btn mt-6 w-full py-3 text-[13.5px]",
            isCurrent ? "bg-[var(--mm-card-2)] text-[var(--mm-text-2)] border border-[var(--mm-border)]" : style.button
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
    </Card>
  );
}


/* ------------------------------------------------------------------
   "Current Subscription" banner
   ------------------------------------------------------------------ */
export function CurrentPlanBanner({ planName, isPremium, description }) {
  return (
    <Card className="relative overflow-hidden p-6 sm:p-7">
      <div
        className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full opacity-40 blur-3xl"
        style={{ backgroundImage: "var(--mm-grad)" }}
        aria-hidden="true"
      />

      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="mm-eyebrow">Current Subscription</p>
          <p className="mt-2.5 text-[16px] font-semibold leading-snug text-[var(--mm-text)] sm:text-[17px]">
            {description || (
              <>
                You are currently on the{" "}
                <span className="mm-grad-text font-bold">{String(planName || "FREE").toUpperCase()}</span> plan
              </>
            )}
          </p>
        </div>

        <span
          className={cx("mm-badge shrink-0 !px-4 !py-2 !text-[12px]", isPremium && "mm-badge-grad")}
        >
          <Crown className="h-3.5 w-3.5" aria-hidden="true" />
          {String(planName || "FREE").toUpperCase()}
        </span>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------
   Plan feature / quota tile matching Screenshot 5
   ------------------------------------------------------------------ */
export function PlanFeatureTile({ name, quota, unlimited }) {
  return (
    <Card className="flex flex-col p-5">
      <p className="font-display text-[14px] font-bold uppercase tracking-wide text-[var(--mm-text)]">
        {name}
      </p>
      <p className="mt-1.5 text-[13px] font-semibold text-[var(--mm-text-2)]">
        {unlimited ? "Quota: Unlimited" : `Quota: ${quota ?? "—"}`}
      </p>
    </Card>
  );
}


export function PricingCardSkeleton() {
  return (
    <Card className="flex flex-col p-6">
      <Skeleton className="h-10 w-10 rounded-xl" />
      <Skeleton className="mt-4 h-8 w-24" />
      <Skeleton className="mt-5 h-9 w-20" />
      <div className="my-5 h-px w-full" />
      <div className="flex flex-1 flex-col gap-2.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-3.5 w-full" />
        ))}
      </div>
      <Skeleton className="mt-6 h-11 w-full rounded-xl" />
    </Card>
  );
}

export default PricingCard;

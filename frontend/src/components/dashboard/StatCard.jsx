import { Star } from "lucide-react";
import { Skeleton } from "./DashboardPrimitives";

/* ------------------------------------------------------------------
   Stat card — Label top-left, large value bottom-left, icon on right.
   Accent colors match the reference screenshot.
   ------------------------------------------------------------------ */
const TONES = {
  gray: { fg: "#E4E4E7", bg: "#27272A", ring: "#3F3F46" },
  blue: { fg: "#FFFFFF", bg: "#0088FF", ring: "#0088FF" },
  cyan: { fg: "#FFFFFF", bg: "#06B6D4", ring: "#06B6D4" },
  green: { fg: "#FFFFFF", bg: "#10B981", ring: "#10B981" },
  pink: { fg: "#FFFFFF", bg: "#EC4899", ring: "#EC4899" },
  purple: { fg: "#FFFFFF", bg: "#F97316", ring: "#F97316" },
  orange: { fg: "#FFFFFF", bg: "#F59E0B", ring: "#F59E0B" },
};

export default function StatCard({ icon: Icon, label, value, tone = "purple", loading = false }) {
  const t = TONES[tone] || TONES.purple;

  if (loading) {
    return (
      <div className="mm-card flex h-[140px] items-center justify-between p-6">
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-7 w-24" />
        </div>
        <Skeleton className="h-12 w-12 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="mm-card mm-card-hover group flex h-[140px] items-center justify-between p-6">
      <div className="min-w-0 flex-1 pr-3">
        <p className="truncate text-[13px] font-semibold text-[var(--mm-text-2)]">
          {label}
        </p>
        <p className="mt-1 truncate font-display text-[24px] font-bold tracking-tight text-[var(--mm-text)]">
          {value}
        </p>
      </div>

      <span
        className="mm-icon-tile grid h-12 w-12 shrink-0 place-items-center rounded-xl transition-transform duration-200 group-hover:scale-105"
        style={{ color: t.fg, backgroundColor: t.bg }}
        aria-hidden="true"
      >
        <Icon className="h-6 w-6" />
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------
   Plan stat card — variant for Current Plan
   ------------------------------------------------------------------ */
export function PlanStatCard({ planName, isPremium, loading = false }) {
  if (loading) {
    return (
      <div className="mm-card flex h-[140px] items-center justify-between p-6">
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-7 w-24" />
        </div>
        <Skeleton className="h-12 w-12 rounded-xl" />
      </div>
    );
  }

  const label = (planName || (isPremium ? "PRO" : "FREE")).toUpperCase();

  return (
    <div className="mm-card mm-card-hover group flex h-[140px] items-center justify-between p-6">
      <div className="min-w-0 flex-1 pr-3">
        <p className="truncate text-[13px] font-semibold text-[var(--mm-text-2)]">
          Current Plan
        </p>
        <p className="mt-1 truncate font-display text-[24px] font-bold tracking-tight text-[var(--mm-text)]">
          {label}
        </p>
      </div>

      <span
        className="mm-icon-tile grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[var(--mm-card-2)] border border-[var(--mm-border)] text-[var(--mm-purple)] transition-transform duration-200 group-hover:scale-105"
        aria-hidden="true"
      >
        <Star className="h-6 w-6" />
      </span>
    </div>
  );
}



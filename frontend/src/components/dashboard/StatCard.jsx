import { Star } from "lucide-react";
import { Skeleton } from "./DashboardPrimitives";

export default function StatCard({ icon: Icon, label, value, loading = false }) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xs flex h-[130px] items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-7 w-24" />
        </div>
        <Skeleton className="h-12 w-12 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="group rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--panel-shadow)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--primary)] hover:shadow-md flex h-[130px] items-center justify-between">
      <div className="min-w-0 flex-1 pr-3">
        <p className="truncate text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
          {label}
        </p>
        <p className="mt-1.5 truncate font-hero text-2xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-3xl">
          {value}
        </p>
      </div>

      <span
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)] transition-transform duration-200 group-hover:scale-105"
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
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xs flex h-[130px] items-center justify-between">
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
    <div className="group rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--panel-shadow)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--primary)] hover:shadow-md flex h-[130px] items-center justify-between">
      <div className="min-w-0 flex-1 pr-3">
        <p className="truncate text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
          Current Plan
        </p>
        <p className="mt-1.5 truncate font-hero text-2xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-3xl">
          {label}
        </p>
      </div>

      <span
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)] transition-transform duration-200 group-hover:scale-105"
        aria-hidden="true"
      >
        <Star className="h-6 w-6" />
      </span>
    </div>
  );
}

import { Zap, Crown, AlertCircle, ArrowUpRight } from "lucide-react";

function QuotaCard({ used = 0, limit = 2, plan = "FREE", onUpgrade }) {
  const remaining = Math.max(0, limit - used);
  const percentage = Math.min(100, Math.round((used / limit) * 100));
  const isExhausted = used >= limit;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--panel-shadow)] transition duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)] border border-[var(--border)]">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[var(--text-primary)]">AI Interview Allowance</h4>
            <p className="text-xs text-[var(--text-secondary)]">
              {plan === "PRO" ? "Monthly Pro Allocation" : "Free Plan Allocation"}
            </p>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider border ${
            plan === "PRO"
              ? "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)]"
              : "border-[var(--border)] bg-[var(--background-soft)] text-[var(--text-secondary)]"
          }`}
        >
          {plan === "PRO" && <Crown className="h-3 w-3" />}
          {plan} PLAN
        </span>
      </div>

      {/* Numerical Metrics */}
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-2xl font-black text-[var(--text-primary)]">
          {used} <span className="text-xs font-semibold text-[var(--text-muted)]">/ {limit} used</span>
        </span>
        <span
          className={`text-xs font-bold ${
            isExhausted ? "text-[var(--danger)]" : remaining === 1 ? "text-[var(--warning)]" : "text-[var(--success)]"
          }`}
        >
          {isExhausted ? "0 remaining" : `${remaining} remaining`}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--primary-soft)] mb-4">
        <div
          className={`h-full transition-all duration-500 ease-out rounded-full ${
            isExhausted
              ? "bg-[var(--danger)]"
              : "bg-[var(--primary)]"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Upgrade Prompt or Status Info */}
      <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
        {isExhausted ? (
          <div className="flex items-center gap-1.5 text-xs text-[var(--danger)] font-medium">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>Quota reached. Upgrade to Pro for 20 interviews/month.</span>
          </div>
        ) : (
          <span className="text-xs text-[var(--text-muted)]">
            {percentage}% consumed
          </span>
        )}

        {onUpgrade && (
          <button
            type="button"
            onClick={onUpgrade}
            className="inline-flex items-center gap-1 text-xs font-bold text-[var(--primary)] hover:text-[var(--primary-hover)] transition"
          >
            <span>{isExhausted ? "Upgrade to Pro" : "View Plans"}</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

export default QuotaCard;

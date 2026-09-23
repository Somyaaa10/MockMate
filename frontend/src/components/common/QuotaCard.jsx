import { Zap, Crown, AlertCircle, ArrowUpRight } from "lucide-react";

function QuotaCard({ used = 0, limit = 2, plan = "FREE", onUpgrade }) {
  const remaining = Math.max(0, limit - used);
  const percentage = Math.min(100, Math.round((used / limit) * 100));
  const isExhausted = used >= limit;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#262626] bg-[#0A0A0A] p-6 backdrop-blur-xl transition duration-300 hover:border-[#404040]">
      {/* Background Lighting Accent */}
      <div
        className={`absolute -top-12 -right-12 h-32 w-32 rounded-full blur-3xl opacity-20 pointer-events-none ${
          isExhausted ? "bg-rose-500" : "bg-purple-500"
        }`}
      />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#FFFFFF]">AI Interview Allowance</h4>
            <p className="text-xs text-[#A1A1A1]">
              {plan === "PRO" ? "Monthly Pro Allocation" : "Free Plan Allocation"}
            </p>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider border ${
            plan === "PRO"
              ? "border-purple-500/30 bg-purple-500/10 text-purple-400"
              : "border-[#262626] bg-[#171717] text-[#A1A1A1]"
          }`}
        >
          {plan === "PRO" && <Crown className="h-3 w-3" />}
          {plan} PLAN
        </span>
      </div>

      {/* Numerical Metrics */}
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-2xl font-black text-[#FFFFFF]">
          {used} <span className="text-xs font-semibold text-[#737373]">/ {limit} used</span>
        </span>
        <span
          className={`text-xs font-bold ${
            isExhausted ? "text-rose-400" : remaining === 1 ? "text-amber-400" : "text-emerald-400"
          }`}
        >
          {isExhausted ? "0 remaining" : `${remaining} remaining`}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-[#1A1A1A] mb-4">
        <div
          className={`h-full transition-all duration-500 ease-out rounded-full ${
            isExhausted
              ? "bg-gradient-to-r from-rose-500 to-amber-500"
              : "bg-gradient-to-r from-purple-500 to-pink-500"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Upgrade Prompt or Status Info */}
      <div className="flex items-center justify-between pt-2 border-t border-[#1A1A1A]">
        {isExhausted ? (
          <div className="flex items-center gap-1.5 text-xs text-rose-400 font-medium">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>Quota reached. Upgrade to Pro for 20 interviews/month.</span>
          </div>
        ) : (
          <span className="text-xs text-[#737373]">
            {percentage}% consumed
          </span>
        )}

        {onUpgrade && (
          <button
            type="button"
            onClick={onUpgrade}
            className="inline-flex items-center gap-1 text-xs font-bold text-purple-400 hover:text-purple-300 transition"
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

import { ShieldAlert, LayoutDashboard, AlertTriangle } from "lucide-react";

const VIOLATION_LABELS = {
  NO_PERSON: "Participant not visible",
  MULTIPLE_PEOPLE: "Multiple people detected",
  CAMERA_DISABLED: "Camera turned off",
  IDENTITY_MISMATCH: "Identity verification failed",
};

/**
 * IntegrityEndedModal
 * Full-screen modal displayed when warningCount reaches 3.
 * Explains that the session has been flagged for manual review —
 * NOT an automatic disqualification.
 * Never silently redirects.
 */
export default function IntegrityEndedModal({
  violationType,
  warningCount = 3,
  maxWarnings = 3,
  onReturnDashboard,
}) {
  const reasonLabel = VIOLATION_LABELS[violationType] || "Camera integrity violation";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#000000]/85 p-4 backdrop-blur-md">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-[#EF4444]/30 bg-[#0A0A0A] p-8 shadow-2xl text-center animate-slideUp">
        {/* Icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#EF4444]/30 bg-[#EF4444]/10 mb-6">
          <ShieldAlert className="h-8 w-8 text-[#EF4444]" />
        </div>

        {/* Title */}
        <h2 className="text-xl font-extrabold text-[#F5F5F5]">
          Interview Integrity Review
        </h2>
        <p className="mt-2 text-sm text-[#A1A1AA] leading-relaxed">
          This session has been flagged after{" "}
          <span className="font-bold text-[#F5F5F5]">{warningCount}</span> confirmed
          camera integrity violations.
        </p>

        {/* Warning count */}
        <div className="mt-6 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#101010] p-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#71717A] font-medium">Violations</span>
            <span className="font-bold text-[#EF4444]">
              {warningCount} / {maxWarnings}
            </span>
          </div>
          <div className="flex gap-1.5">
            {Array.from({ length: maxWarnings }, (_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full ${
                  i < warningCount ? "bg-[#EF4444]" : "bg-[#262626]"
                }`}
              />
            ))}
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#71717A] font-medium">Reason</span>
            <span className="font-semibold text-[#F5F5F5]">{reasonLabel}</span>
          </div>
        </div>

        {/* Manual review notice — critical for user trust */}
        <div className="mt-5 rounded-xl border border-[#F59E0B]/25 bg-[#F59E0B]/08 p-4 text-left">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-[#F59E0B] mt-0.5 shrink-0" />
            <div>
              <p className="text-[12px] font-bold text-[#F59E0B]">Manual Review</p>
              <p className="text-[11px] text-[#A1A1AA] mt-0.5 leading-relaxed">
                You will <span className="font-semibold text-[#F5F5F5]">not</span> be
                automatically disqualified. This session has been flagged for manual
                review only. Your interview responses and score have been preserved.
              </p>
            </div>
          </div>
        </div>

        {/* Action */}
        <button
          type="button"
          onClick={onReturnDashboard}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#FFFFFF] py-3.5 text-sm font-bold text-[#000000] shadow-sm transition hover:bg-[#F5F5F5] active:bg-[#E5E5E5]"
        >
          <LayoutDashboard className="h-4 w-4" />
          Return to Dashboard
        </button>

        <p className="mt-3 text-[10px] text-[#71717A]">
          Your data has been saved. You can review your session from the dashboard.
        </p>
      </div>
    </div>
  );
}

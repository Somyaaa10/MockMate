import { Sparkles, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";

export default function InterviewEvaluation({ evaluation, onProceed }) {
  if (!evaluation) return null;

  return (
    <div className="rounded-2xl border border-[var(--strong-line)] bg-[var(--bg-surface)] p-6 backdrop-blur-xl space-y-4 shadow-2xl transition duration-300 hover:border-[var(--strong-line-2)]">
      <div className="flex items-center justify-between border-b border-[var(--faint-line)] pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--chip-bg)] border border-[var(--strong-line)] text-[var(--text-primary-2)]">
            <Sparkles className="h-4 w-4" />
          </div>
          <h3 className="text-base font-bold text-[var(--text-primary-3)]">AI Evaluation Summary</h3>
        </div>

        <div className="rounded-full border border-[var(--strong-line)] bg-[var(--chip-bg)] px-4 py-1 text-xs font-extrabold text-[var(--text-primary-2)]">
          Score: {evaluation.score ?? "N/A"} / 10
        </div>
      </div>

      {/* Main Feedback */}
      <p className="text-xs leading-relaxed text-[var(--text-secondary-2)]">
        {evaluation.feedback}
      </p>

      {/* Strengths & Improvements */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
        {evaluation.strengths && evaluation.strengths.length > 0 && (
          <div className="rounded-xl border border-[rgba(34,197,94,0.25)] bg-[rgba(34,197,94,0.10)] p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#4ADE80] mb-2 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Key Strengths
            </p>
            <ul className="space-y-1 text-xs text-[var(--text-primary-3)]">
              {evaluation.strengths.map((str, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-[#4ADE80] font-bold">•</span>
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {evaluation.improvements && evaluation.improvements.length > 0 && (
          <div className="rounded-xl border border-[rgba(245,158,11,0.25)] bg-[rgba(245,158,11,0.10)] p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#FBBF24] mb-2 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> Areas to Improve
            </p>
            <ul className="space-y-1 text-xs text-[var(--text-primary-3)]">
              {evaluation.improvements.map((imp, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-[#FBBF24] font-bold">•</span>
                  <span>{imp}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Proceed Button */}
      <div className="pt-3 text-right">
        <button
          type="button"
          onClick={onProceed}
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--inv-bg)] border border-[var(--inv-bg)] px-6 py-3 text-xs font-bold text-[var(--inv-text)] shadow-sm transition hover:bg-[var(--inv-hover-3)] active:bg-[var(--inv-hover-4)]"
        >
          <span>Continue Interview</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

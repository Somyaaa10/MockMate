import { Sparkles, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";

export default function InterviewEvaluation({ evaluation, onProceed }) {
  if (!evaluation) return null;

  return (
    <div className="rounded-2xl border border-[#262626] bg-[#0A0A0A] p-6 backdrop-blur-xl space-y-4 shadow-2xl transition duration-300 hover:border-[#404040]">
      <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#171717] border border-[#262626] text-[#FFFFFF]">
            <Sparkles className="h-4 w-4" />
          </div>
          <h3 className="text-base font-bold text-[#FAFAFA]">AI Evaluation Summary</h3>
        </div>

        <div className="rounded-full border border-[#262626] bg-[#171717] px-4 py-1 text-xs font-extrabold text-[#FFFFFF]">
          Score: {evaluation.score ?? "N/A"} / 10
        </div>
      </div>

      {/* Main Feedback */}
      <p className="text-xs leading-relaxed text-[#A1A1A1]">
        {evaluation.feedback}
      </p>

      {/* Strengths & Improvements */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
        {evaluation.strengths && evaluation.strengths.length > 0 && (
          <div className="rounded-xl border border-[rgba(34,197,94,0.25)] bg-[rgba(34,197,94,0.10)] p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#4ADE80] mb-2 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Key Strengths
            </p>
            <ul className="space-y-1 text-xs text-[#FAFAFA]">
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
            <ul className="space-y-1 text-xs text-[#FAFAFA]">
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
          className="inline-flex items-center gap-2 rounded-xl bg-[#FFFFFF] border border-[#FFFFFF] px-6 py-3 text-xs font-bold text-[#000000] shadow-sm transition hover:bg-[#EDEDED] active:bg-[#D4D4D4]"
        >
          <span>Continue Interview</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

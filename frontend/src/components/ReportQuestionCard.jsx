import { useState } from "react";
import { ChevronDown, ChevronUp, CheckCircle, AlertTriangle, Sparkles, MessageSquare } from "lucide-react";

function ReportQuestionCard({ questionItem, index, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const score = questionItem.score !== null && questionItem.score !== undefined
    ? questionItem.score
    : "N/A";

  const getScoreBadgeStyle = (val) => {
    if (typeof val !== "number") return "border-[#262626] bg-[#171717] text-[#A1A1A1]";
    if (val >= 8) return "border-[rgba(34,197,94,0.25)] bg-[rgba(34,197,94,0.10)] text-[#4ADE80]";
    if (val >= 5) return "border-[rgba(245,158,11,0.25)] bg-[rgba(245,158,11,0.10)] text-[#FBBF24]";
    return "border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.10)] text-[#F87171]";
  };

  const answeredDate = questionItem.answeredAt
    ? new Date(questionItem.answeredAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="rounded-xl border border-[#262626] bg-[#0A0A0A] backdrop-blur-md overflow-hidden transition duration-200 hover:border-[#404040] hover:bg-[#111111]">
      {/* Header / Clickable Toggle */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-5 text-left transition hover:bg-[#111111]"
      >
        <div className="flex items-center gap-3 pr-4 min-w-0">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#171717] text-xs font-bold text-[#FFFFFF] border border-[#262626]">
            Q{index + 1}
          </span>
          <h4 className="truncate text-base font-semibold text-[#FAFAFA]">
            {questionItem.question}
          </h4>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span
            className={`rounded-full border px-3 py-1 text-xs font-bold ${getScoreBadgeStyle(
              questionItem.score
            )}`}
          >
            Score: {score} / 10
          </span>
          {isOpen ? (
            <ChevronUp className="h-5 w-5 text-[#A1A1A1]" />
          ) : (
            <ChevronDown className="h-5 w-5 text-[#A1A1A1]" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isOpen && (
        <div className="space-y-4 border-t border-[#1A1A1A] bg-[#000000] p-5">
          {/* User Answer */}
          <div>
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#A1A1A1]">
              <MessageSquare className="h-3.5 w-3.5 text-[#FFFFFF]" />
              Your Answer
            </p>
            <div className="mt-2 rounded-xl border border-[#262626] bg-[#0A0A0A] p-4 text-sm leading-relaxed text-[#FAFAFA]">
              {questionItem.answer ? (
                <p className="whitespace-pre-wrap">{questionItem.answer}</p>
              ) : (
                <span className="italic text-[#737373]">No answer recorded.</span>
              )}
            </div>
            {answeredDate && (
              <p className="mt-1 text-right text-[11px] text-[#737373]">
                Answered at {answeredDate}
              </p>
            )}
          </div>

          {/* AI Feedback */}
          {questionItem.feedback && (
            <div>
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#A1A1A1]">
                <Sparkles className="h-3.5 w-3.5 text-[#FFFFFF]" />
                AI Feedback
              </p>
              <div className="mt-2 rounded-xl border border-[#262626] bg-[#0A0A0A] p-4 text-sm leading-relaxed text-[#A1A1A1]">
                {questionItem.feedback}
              </div>
            </div>
          )}

          {/* Strengths & Improvements grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
            {/* Strengths */}
            <div>
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#4ADE80]">
                <CheckCircle className="h-3.5 w-3.5" />
                Key Strengths
              </p>
              <div className="mt-2 space-y-1.5">
                {questionItem.strengths && questionItem.strengths.length > 0 ? (
                  questionItem.strengths.map((str, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 rounded-lg border border-[rgba(34,197,94,0.25)] bg-[rgba(34,197,94,0.10)] p-2.5 text-xs text-[#FAFAFA]"
                    >
                      <span className="mt-0.5 text-[#4ADE80] font-bold">✓</span>
                      <span>{str}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs italic text-[#737373]">No strengths recorded.</p>
                )}
              </div>
            </div>

            {/* Improvements */}
            <div>
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#FBBF24]">
                <AlertTriangle className="h-3.5 w-3.5" />
                Areas for Improvement
              </p>
              <div className="mt-2 space-y-1.5">
                {questionItem.improvements && questionItem.improvements.length > 0 ? (
                  questionItem.improvements.map((imp, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 rounded-lg border border-[rgba(245,158,11,0.25)] bg-[rgba(245,158,11,0.10)] p-2.5 text-xs text-[#FAFAFA]"
                    >
                      <span className="mt-0.5 text-[#FBBF24] font-bold">•</span>
                      <span>{imp}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs italic text-[#737373]">No improvements recorded.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportQuestionCard;

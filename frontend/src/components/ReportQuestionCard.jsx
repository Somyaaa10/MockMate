import { useState } from "react";
import { ChevronDown, ChevronUp, CheckCircle, AlertTriangle, Sparkles, MessageSquare } from "lucide-react";

function ReportQuestionCard({ questionItem, questionData, index = 0, defaultOpen = false }) {
  const item = questionItem || questionData || {};
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const score = item.score !== null && item.score !== undefined
    ? item.score
    : "N/A";

  const getScoreBadgeStyle = (val) => {
    if (typeof val !== "number") return "border-[var(--strong-line)] bg-[var(--chip-bg)] text-[var(--text-secondary-2)]";
    if (val >= 8) return "border-[rgba(34,197,94,0.25)] bg-[rgba(34,197,94,0.10)] text-[#4ADE80]";
    if (val >= 5) return "border-[rgba(245,158,11,0.25)] bg-[rgba(245,158,11,0.10)] text-[#FBBF24]";
    return "border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.10)] text-[#F87171]";
  };

  const answeredDate = item.answeredAt
    ? new Date(item.answeredAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="rounded-xl border border-[var(--strong-line)] bg-[var(--bg-surface)] backdrop-blur-md overflow-hidden transition duration-200 hover:border-[var(--strong-line-2)] hover:bg-[var(--card-bg-2)]">
      {/* Header / Clickable Toggle */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-5 text-left transition hover:bg-[var(--card-bg-2)]"
      >
        <div className="flex items-center gap-3 pr-4 min-w-0">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--chip-bg)] text-xs font-bold text-[var(--text-primary-2)] border border-[var(--strong-line)]">
            Q{index + 1}
          </span>
          <h4 className="truncate text-base font-semibold text-[var(--text-primary-3)]">
            {item.question || item.text || "Interview Question"}
          </h4>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span
            className={`rounded-full border px-3 py-1 text-xs font-bold ${getScoreBadgeStyle(
              item.score
            )}`}
          >
            Score: {score} / 10
          </span>
          {isOpen ? (
            <ChevronUp className="h-5 w-5 text-[var(--text-secondary-2)]" />
          ) : (
            <ChevronDown className="h-5 w-5 text-[var(--text-secondary-2)]" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isOpen && (
        <div className="space-y-4 border-t border-[var(--faint-line)] bg-[var(--bg-void)] p-5">
          {/* User Answer */}
          <div>
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary-2)]">
              <MessageSquare className="h-3.5 w-3.5 text-[var(--text-primary-2)]" />
              Your Answer
            </p>
            <div className="mt-2 rounded-xl border border-[var(--strong-line)] bg-[var(--bg-surface)] p-4 text-sm leading-relaxed text-[var(--text-primary-3)]">
              {item.answer ? (
                <p className="whitespace-pre-wrap">{item.answer}</p>
              ) : (
                <span className="italic text-[var(--text-muted-2)]">No answer provided.</span>
              )}
            </div>
            {answeredDate && (
              <p className="mt-1 text-right text-[11px] text-[var(--text-muted-2)]">
                Answered at {answeredDate}
              </p>
            )}
          </div>

          {/* AI Feedback */}
          {item.feedback && (
            <div>
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary-2)]">
                <Sparkles className="h-3.5 w-3.5 text-[var(--text-primary-2)]" />
                AI Feedback
              </p>
              <div className="mt-2 rounded-xl border border-[var(--strong-line)] bg-[var(--bg-surface)] p-4 text-sm leading-relaxed text-[var(--text-secondary-2)]">
                {item.feedback}
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
                {item.strengths && item.strengths.length > 0 ? (
                  item.strengths.map((str, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 rounded-lg border border-[rgba(34,197,94,0.25)] bg-[rgba(34,197,94,0.10)] p-2.5 text-xs text-[var(--text-primary-3)]"
                    >
                      <span className="mt-0.5 text-[#4ADE80] font-bold">✓</span>
                      <span>{str}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs italic text-[var(--text-muted-2)]">No strengths identified.</p>
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
                {item.improvements && item.improvements.length > 0 ? (
                  item.improvements.map((imp, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 rounded-lg border border-[rgba(245,158,11,0.25)] bg-[rgba(245,158,11,0.10)] p-2.5 text-xs text-[var(--text-primary-3)]"
                    >
                      <span className="mt-0.5 text-[#FBBF24] font-bold">•</span>
                      <span>{imp}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs italic text-[var(--text-muted-2)]">No improvements identified.</p>
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

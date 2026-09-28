import { useState } from "react";
import { Volume2, Sparkles, Bot, MessageSquareText, HelpCircle } from "lucide-react";

export default function AIInterviewer({
  question,
  greeting,
  targetRole,
  experienceLevel,
  questionNumber,
  totalQuestions,
  interviewState,
  isFollowUp,
  conversationHistory = [],
  onReplayQuestion,
}) {
  const [showHistory, setShowHistory] = useState(false);
  const isSpeaking = interviewState === "AI_SPEAKING";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--strong-line)] bg-[var(--bg-surface)] p-6 sm:p-8 backdrop-blur-xl text-center space-y-6 transition duration-300 hover:border-[var(--strong-line-2)] hover:bg-[var(--card-bg-2)]">
      {/* Top Metadata Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--faint-line)] pb-4 text-xs font-semibold text-[var(--text-secondary-2)]">
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-[var(--strong-line)] bg-[var(--chip-bg)] px-3 py-1 text-[var(--text-primary-2)] font-bold">
            {targetRole || "Software Developer"}
          </span>
          {experienceLevel && (
            <span className="rounded-full border border-[var(--strong-line)] bg-[var(--chip-bg)] px-2.5 py-1 text-[var(--text-secondary-2)]">
              {experienceLevel}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-1.5 rounded-lg border border-[var(--strong-line)] bg-[var(--chip-bg)] px-3 py-1 text-xs text-[var(--text-secondary-2)] hover:bg-[var(--strong-line)] hover:text-[var(--text-primary-2)] transition"
        >
          <MessageSquareText className="h-3.5 w-3.5" />
          <span>{showHistory ? "Hide Transcript" : "View Live Log"}</span>
        </button>
      </div>

      {/* Avatar Orb & Audio Waveform Visualizer */}
      <div className="relative mx-auto flex h-32 w-32 items-center justify-center">
        {/* Glow ambient background */}
        <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-orange-600/30 to-pink-600/30 blur-2xl animate-pulse-slow" />

        {isSpeaking && (
          <div className="absolute -inset-2 rounded-full border-2 border-orange-500/40 animate-ping duration-1000" />
        )}

        {interviewState === "PROCESSING" && (
          <div className="absolute -inset-3 rounded-full border-2 border-dashed border-orange-400 animate-spin" />
        )}

        <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-orange-500/30 bg-[var(--bg-surface)] shadow-2xl shadow-orange-500/20">
          <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-[var(--card-bg-2)] to-[var(--bg-surface)]">
            <Bot
              className={`h-10 w-10 text-orange-400 transition-transform ${
                isSpeaking ? "scale-110" : ""
              }`}
            />
          </div>
        </div>
      </div>

      {/* Audio Waveform Bars (Active during AI Speech) */}
      {isSpeaking && (
        <div className="flex items-center justify-center gap-1 h-6">
          <span className="w-1 bg-orange-400 rounded-full animate-wave-1" />
          <span className="w-1 bg-pink-400 rounded-full animate-wave-2" />
          <span className="w-1 bg-orange-500 rounded-full animate-wave-3" />
          <span className="w-1 bg-pink-500 rounded-full animate-wave-4" />
          <span className="w-1 bg-orange-400 rounded-full animate-wave-2" />
        </div>
      )}

      {/* Interviewer State Badge */}
      <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 text-xs font-bold text-orange-400 backdrop-blur-md">
        {isSpeaking ? (
          <>
            <span className="h-2 w-2 rounded-full bg-orange-400 animate-ping" />
            <span>🔊 AI Interviewer is speaking...</span>
          </>
        ) : interviewState === "GREETING" ? (
          <>
            <span className="h-2 w-2 rounded-full bg-orange-400 animate-pulse" />
            <span>👋 Welcoming candidate...</span>
          </>
        ) : interviewState === "LISTENING" ? (
          <>
            <span className="h-2 w-2 rounded-full bg-rose-400 animate-pulse" />
            <span>🎙️ Listening to your response...</span>
          </>
        ) : interviewState === "PROCESSING" ? (
          <>
            <Sparkles className="h-3.5 w-3.5 animate-spin text-orange-400" />
            <span>AI interviewer is listening & thinking...</span>
          </>
        ) : (
          <>
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Ready for your answer</span>
          </>
        )}
      </div>

      {/* Dynamic Adaptive Follow-Up Badge Indicator */}
      {isFollowUp && (
        <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-extrabold text-amber-300">
          <HelpCircle className="h-3.5 w-3.5" />
          <span>⚡ Adaptive AI Follow-Up Question (Probing Candidate Depth)</span>
        </div>
      )}


      {/* AI Speech Text Display */}
      {showHistory ? (
        <div className="mx-auto max-w-2xl rounded-xl border border-[var(--strong-line)] bg-[var(--bg-void)] p-4 text-left space-y-3 max-h-60 overflow-y-auto font-mono text-xs">
          <p className="text-[10px] uppercase font-bold text-[var(--text-muted-2)] mb-2 tracking-wider">
            Live Interview Conversation Log
          </p>
          {conversationHistory.length > 0 ? (
            conversationHistory.map((item, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-lg border ${
                  item.speaker === "ai"
                    ? "border-[var(--strong-line)] bg-[var(--card-bg-2)] text-[var(--text-primary-3)]"
                    : "border-[var(--strong-line)] bg-[var(--bg-surface)] text-[var(--text-secondary-2)]"
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-bold uppercase mb-1">
                  <span>{item.speaker === "ai" ? "🤖 AI Interviewer" : "👤 Candidate"}</span>
                  {item.isFollowUp && (
                    <span className="text-[#FBBF24] font-extrabold">[Follow-up]</span>
                  )}
                </div>
                <p className="leading-relaxed">{item.text}</p>
              </div>
            ))
          ) : (
            <p className="text-[var(--text-muted-2)] italic">No conversation log available yet.</p>
          )}
        </div>
      ) : (
        <div className="mx-auto max-w-2xl space-y-2">
          {greeting && (
            <p className="text-xs text-[var(--text-secondary-2)] italic bg-[var(--card-bg-2)] rounded-xl p-3 border border-[var(--strong-line)]">
              "{greeting}"
            </p>
          )}
          <h2 className="text-lg font-bold text-[var(--text-primary-3)] leading-relaxed sm:text-xl tracking-wide">
            "{question}"
          </h2>
        </div>
      )}

      {/* Replay Audio Control */}
      <div className="flex justify-center pt-2">
        <button
          type="button"
          onClick={onReplayQuestion}
          disabled={isSpeaking}
          className="inline-flex items-center gap-2 rounded-xl border border-[var(--strong-line)] bg-[var(--chip-bg)] px-4 py-2 text-xs font-semibold text-[var(--text-secondary-2)] transition hover:bg-[var(--strong-line)] hover:text-[var(--text-primary-2)] disabled:opacity-50"
          title="Replay AI voice output"
        >
          <Volume2 className="h-4 w-4 text-[var(--text-primary-2)]" />
          <span>Replay AI Voice</span>
        </button>
      </div>
    </div>
  );
}

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
    <div className="relative overflow-hidden rounded-2xl border border-[#262626] bg-[#0A0A0A] p-6 sm:p-8 backdrop-blur-xl text-center space-y-6 transition duration-300 hover:border-[#404040] hover:bg-[#111111]">
      {/* Top Metadata Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1A1A1A] pb-4 text-xs font-semibold text-[#A1A1A1]">
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-[#262626] bg-[#171717] px-3 py-1 text-[#FFFFFF] font-bold">
            {targetRole || "Software Developer"}
          </span>
          <span className="rounded-full border border-[#262626] bg-[#171717] px-2.5 py-1 text-[#A1A1A1]">
            {experienceLevel || "Mid Level"}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-1.5 rounded-lg border border-[#262626] bg-[#171717] px-3 py-1 text-xs text-[#A1A1A1] hover:bg-[#262626] hover:text-[#FFFFFF] transition"
        >
          <MessageSquareText className="h-3.5 w-3.5" />
          <span>{showHistory ? "Hide Transcript" : "View Live Log"}</span>
        </button>
      </div>

      {/* Avatar Orb & Audio Waveform Visualizer */}
      <div className="relative mx-auto flex h-32 w-32 items-center justify-center">
        {/* Glow ambient background */}
        <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-purple-600/30 to-pink-600/30 blur-2xl animate-pulse-slow" />

        {isSpeaking && (
          <div className="absolute -inset-2 rounded-full border-2 border-purple-500/40 animate-ping duration-1000" />
        )}

        {interviewState === "PROCESSING" && (
          <div className="absolute -inset-3 rounded-full border-2 border-dashed border-purple-400 animate-spin" />
        )}

        <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-purple-500/30 bg-[#0A0A0A] shadow-2xl shadow-purple-500/20">
          <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-[#111111] to-[#0A0A0A]">
            <Bot
              className={`h-10 w-10 text-purple-400 transition-transform ${
                isSpeaking ? "scale-110" : ""
              }`}
            />
          </div>
        </div>
      </div>

      {/* Audio Waveform Bars (Active during AI Speech) */}
      {isSpeaking && (
        <div className="flex items-center justify-center gap-1 h-6">
          <span className="w-1 bg-purple-400 rounded-full animate-wave-1" />
          <span className="w-1 bg-pink-400 rounded-full animate-wave-2" />
          <span className="w-1 bg-purple-500 rounded-full animate-wave-3" />
          <span className="w-1 bg-pink-500 rounded-full animate-wave-4" />
          <span className="w-1 bg-purple-400 rounded-full animate-wave-2" />
        </div>
      )}

      {/* Interviewer State Badge */}
      <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-xs font-bold text-purple-300 backdrop-blur-md">
        {isSpeaking ? (
          <>
            <span className="h-2 w-2 rounded-full bg-purple-400 animate-ping" />
            <span>🔊 AI Interviewer is speaking...</span>
          </>
        ) : interviewState === "GREETING" ? (
          <>
            <span className="h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
            <span>👋 Welcoming candidate...</span>
          </>
        ) : interviewState === "LISTENING" ? (
          <>
            <span className="h-2 w-2 rounded-full bg-rose-400 animate-pulse" />
            <span>🎙️ Listening to your response...</span>
          </>
        ) : interviewState === "PROCESSING" ? (
          <>
            <Sparkles className="h-3.5 w-3.5 animate-spin text-purple-300" />
            <span>Evaluating answer & deciding next dynamic question...</span>
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
        <div className="mx-auto max-w-2xl rounded-xl border border-[#262626] bg-[#000000] p-4 text-left space-y-3 max-h-60 overflow-y-auto font-mono text-xs">
          <p className="text-[10px] uppercase font-bold text-[#737373] mb-2 tracking-wider">
            Live Interview Conversation Log
          </p>
          {conversationHistory.length > 0 ? (
            conversationHistory.map((item, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-lg border ${
                  item.speaker === "ai"
                    ? "border-[#262626] bg-[#111111] text-[#FAFAFA]"
                    : "border-[#262626] bg-[#0A0A0A] text-[#A1A1A1]"
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
            <p className="text-[#737373] italic">No conversation log recorded yet.</p>
          )}
        </div>
      ) : (
        <div className="mx-auto max-w-2xl space-y-2">
          {greeting && (
            <p className="text-xs text-[#A1A1A1] italic bg-[#111111] rounded-xl p-3 border border-[#262626]">
              "{greeting}"
            </p>
          )}
          <h2 className="text-lg font-bold text-[#FAFAFA] leading-relaxed sm:text-xl tracking-wide">
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
          className="inline-flex items-center gap-2 rounded-xl border border-[#262626] bg-[#171717] px-4 py-2 text-xs font-semibold text-[#A1A1A1] transition hover:bg-[#262626] hover:text-[#FFFFFF] disabled:opacity-50"
          title="Replay AI voice output"
        >
          <Volume2 className="h-4 w-4 text-[#FFFFFF]" />
          <span>Replay AI Voice</span>
        </button>
      </div>
    </div>
  );
}

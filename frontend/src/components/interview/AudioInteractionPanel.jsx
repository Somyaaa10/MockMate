import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2, Sparkles, AlertCircle, Loader2, User } from "lucide-react";

export default function AudioInteractionPanel({
  candidateName = "Candidate",
  interviewState,
  onAnswerSubmit,
  isSubmitting,
}) {
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [speechError, setSpeechError] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [hasUserSpoken, setHasUserSpoken] = useState(false);

  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const latestTranscriptRef = useRef("");
  const isMutedRef = useRef(false);

  latestTranscriptRef.current = transcript;
  isMutedRef.current = isMuted;

  // Function to finish and auto-submit answer internally
  const submitCurrentAnswer = () => {
    if (isMutedRef.current) return;

    const textToSend = latestTranscriptRef.current.trim();
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    setIsListening(false);
    setTranscript("");
    setHasUserSpoken(false);

    if (textToSend) {
      console.log("🎙️ Auto-submitting candidate answer:", textToSend);
      onAnswerSubmit(textToSend);
    }
  };

  useEffect(() => {
    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        if (!isMutedRef.current) {
          setIsListening(true);
          setSpeechError(null);
        }
      };

      recognition.onresult = (event) => {
        if (isMutedRef.current) return;

        let finalStr = "";
        let interimStr = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalStr += result[0].transcript + " ";
          } else {
            interimStr += result[0].transcript;
          }
        }

        const combined = (latestTranscriptRef.current + " " + finalStr + " " + interimStr).trim();
        if (combined) {
          setTranscript(combined);
          setHasUserSpoken(true);

          // Reset silence timer for automatic submission after 2.2 seconds of silence
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
          }

          silenceTimerRef.current = setTimeout(() => {
            if (latestTranscriptRef.current.trim() && !isMutedRef.current) {
              submitCurrentAnswer();
            }
          }, 2200);
        }
      };

      recognition.onerror = (event) => {
        console.warn("SpeechRecognition error:", event.error);
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          setSpeechError("Microphone permission denied. Please allow microphone access.");
        } else if (event.error === "no-speech") {
          // Silent timeout
        } else {
          setSpeechError(`Speech recognition: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        // If recognition ended after candidate spoke and not muted, auto-submit
        if (latestTranscriptRef.current.trim() && !isMutedRef.current) {
          submitCurrentAnswer();
        }
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.warn("Failed to initialize SpeechRecognition:", err.message);
      setIsSupported(false);
    }

    return () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  // Manage listening state based on interviewState and isMuted
  useEffect(() => {
    if (!recognitionRef.current) return;

    if (!isMuted && (interviewState === "READY_TO_ANSWER" || interviewState === "LISTENING")) {
      try {
        setSpeechError(null);
        setTranscript("");
        setHasUserSpoken(false);
        recognitionRef.current.start();
      } catch (e) {
        // Recognition might already be running
      }
    } else {
      // Muted OR AI_SPEAKING or PROCESSING or COMPLETED
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsListening(false);
    }
  }, [interviewState, isMuted]);

  // Handle Mute / Unmute Toggle
  const toggleMute = () => {
    setIsMuted((prev) => {
      const nextState = !prev;
      if (nextState) {
        // Muting: stop active timers and speech recognition
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
          } catch (e) {}
        }
        setIsListening(false);
      } else {
        // Unmuting: start recognition if candidate's turn
        if (interviewState === "READY_TO_ANSWER" || interviewState === "LISTENING") {
          try {
            recognitionRef.current?.start();
          } catch (e) {}
        }
      }
      return nextState;
    });
  };

  const isAiSpeaking = interviewState === "AI_SPEAKING";
  const isProcessing = interviewState === "PROCESSING" || isSubmitting;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--strong-line)] bg-[var(--bg-surface)] p-6 sm:p-8 text-center backdrop-blur-xl shadow-2xl flex flex-col items-center justify-between space-y-6 min-h-[420px]">
      {/* Visual Ambient Glow */}
      <div
        className={`absolute -inset-10 rounded-full blur-3xl transition-opacity duration-700 ${
          isMuted
            ? "bg-rose-500/10 opacity-60"
            : isAiSpeaking
            ? "bg-blue-500/10 opacity-70"
            : isListening && hasUserSpoken
            ? "bg-emerald-500/20 opacity-90"
            : isListening
            ? "bg-orange-500/15 opacity-80"
            : isProcessing
            ? "bg-purple-500/20 opacity-80"
            : "bg-gray-500/5 opacity-50"
        }`}
      />

      {/* Candidate Identity Card Header */}
      <div className="w-full flex items-center justify-between rounded-xl border border-[var(--strong-line)] bg-[var(--card-bg-2)] px-4 py-3 text-left z-10">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--strong-line)] bg-[var(--bg-surface)] text-[var(--text-primary-2)]">
            <User className="h-5 w-5 text-orange-400" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[var(--text-primary-2)] leading-none">
              {candidateName}
            </h4>
            <p className="text-[10px] font-semibold text-[var(--text-secondary-2)] mt-1">
              Candidate
            </p>
          </div>
        </div>

        <div
          className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${
            isMuted
              ? "border-rose-500/40 bg-rose-500/10 text-rose-400"
              : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isMuted ? "bg-rose-400" : "bg-emerald-400 animate-pulse"
            }`}
          />
          <span>{isMuted ? "Muted" : "Audio Active"}</span>
        </div>
      </div>

      {/* Main Orb / Visualizer */}
      <div className="relative flex h-32 w-32 items-center justify-center my-2">
        {isMuted ? (
          <div className="absolute -inset-2 rounded-full border border-rose-500/30" />
        ) : isListening && hasUserSpoken ? (
          <div className="absolute -inset-4 rounded-full border-2 border-emerald-500/40 animate-ping duration-1000" />
        ) : isListening ? (
          <div className="absolute -inset-2 rounded-full border border-orange-500/30 animate-pulse duration-1000" />
        ) : isProcessing ? (
          <div className="absolute -inset-3 rounded-full border-2 border-dashed border-purple-400 animate-spin" />
        ) : null}

        <div
          className={`relative flex h-24 w-24 items-center justify-center rounded-full border shadow-2xl transition-all duration-300 ${
            isMuted
              ? "border-rose-500/40 bg-rose-950/30 text-rose-400"
              : isAiSpeaking
              ? "border-blue-500/40 bg-blue-950/30 text-blue-400"
              : isListening && hasUserSpoken
              ? "border-emerald-500/50 bg-emerald-950/40 text-emerald-400 scale-105"
              : isListening
              ? "border-orange-500/40 bg-orange-950/30 text-orange-400"
              : isProcessing
              ? "border-purple-500/40 bg-purple-950/30 text-purple-400"
              : "border-[var(--strong-line)] bg-[var(--card-bg-2)] text-[var(--text-secondary-2)]"
          }`}
        >
          {isMuted ? (
            <MicOff className="h-10 w-10 text-rose-400" />
          ) : isAiSpeaking ? (
            <Volume2 className="h-10 w-10 animate-pulse text-blue-400" />
          ) : isProcessing ? (
            <Sparkles className="h-10 w-10 animate-spin text-purple-400" />
          ) : isListening ? (
            <Mic className={`h-10 w-10 ${hasUserSpoken ? "scale-110" : ""}`} />
          ) : (
            <MicOff className="h-10 w-10 opacity-50" />
          )}
        </div>
      </div>

      {/* Waveform Bars Animation */}
      <div className="h-6 flex items-center justify-center gap-1.5">
        {isMuted ? (
          <span className="text-xs font-semibold text-rose-400">Microphone input muted</span>
        ) : isListening ? (
          <>
            <span className={`w-1.5 rounded-full transition-all duration-150 ${hasUserSpoken ? "bg-emerald-400 h-6 animate-pulse" : "bg-orange-400 h-3"}`} />
            <span className={`w-1.5 rounded-full transition-all duration-150 ${hasUserSpoken ? "bg-emerald-500 h-8 animate-pulse delay-75" : "bg-orange-500 h-4"}`} />
            <span className={`w-1.5 rounded-full transition-all duration-150 ${hasUserSpoken ? "bg-emerald-400 h-5 animate-pulse delay-150" : "bg-orange-400 h-2"}`} />
            <span className={`w-1.5 rounded-full transition-all duration-150 ${hasUserSpoken ? "bg-emerald-500 h-7 animate-pulse delay-200" : "bg-orange-500 h-5"}`} />
            <span className={`w-1.5 rounded-full transition-all duration-150 ${hasUserSpoken ? "bg-emerald-400 h-4 animate-pulse delay-300" : "bg-orange-400 h-3"}`} />
          </>
        ) : isProcessing ? (
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Processing your response...</span>
          </div>
        ) : isAiSpeaking ? (
          <span className="text-xs font-semibold text-blue-400">AI voice output active</span>
        ) : (
          <span className="text-xs font-medium text-[var(--text-muted-2)]">Standby</span>
        )}
      </div>

      {/* State Badge & Guidance Text */}
      <div className="space-y-1">
        <h3 className="text-sm font-extrabold tracking-wide text-[var(--text-primary-2)]">
          {isMuted
            ? "Microphone Muted"
            : isAiSpeaking
            ? "AI is speaking..."
            : isProcessing
            ? "Thinking..."
            : isListening && hasUserSpoken
            ? "Listening to your response..."
            : isListening
            ? "Listening..."
            : "Your turn"}
        </h3>
        <p className="text-xs font-medium text-[var(--text-secondary-2)] max-w-xs mx-auto">
          {isMuted
            ? "Click unmute when you are ready to speak"
            : isAiSpeaking
            ? "Please listen to the AI interviewer"
            : isProcessing
            ? "One moment..."
            : isListening && hasUserSpoken
            ? "Speak naturally into your microphone"
            : isListening
            ? "Speak when you're ready"
            : "Initializing audio stream..."}
        </p>
      </div>

      {/* Microphone Mute / Unmute Control Button */}
      <div className="pt-2 w-full flex justify-center z-10">
        <button
          type="button"
          onClick={toggleMute}
          disabled={isAiSpeaking || isProcessing}
          className={`inline-flex items-center gap-2 rounded-xl border px-6 py-2.5 text-xs font-bold transition shadow-sm ${
            isMuted
              ? "border-rose-500/50 bg-rose-500/15 text-rose-400 hover:bg-rose-500/20 active:scale-95"
              : "border-[var(--strong-line)] bg-[var(--chip-bg)] text-[var(--text-primary-2)] hover:bg-[var(--strong-line)] active:scale-95"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isMuted ? (
            <>
              <MicOff className="h-4 w-4 text-rose-400" />
              <span>Unmute Microphone</span>
            </>
          ) : (
            <>
              <Mic className="h-4 w-4 text-emerald-400" />
              <span>Mute Microphone</span>
            </>
          )}
        </button>
      </div>

      {/* Error Alert */}
      {speechError && (
        <div className="flex items-center gap-2 rounded-xl border border-[#EF4444]/30 bg-[#EF4444]/10 p-3 text-xs text-[#EF4444]">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{speechError}</span>
        </div>
      )}

      {/* Unsupported Alert */}
      {!isSupported && (
        <div className="flex items-center gap-2 rounded-xl border border-[#F59E0B]/30 bg-[#F59E0B]/10 p-3 text-xs text-[#F59E0B]">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Speech recognition is not supported in this browser.</span>
        </div>
      )}
    </div>
  );
}

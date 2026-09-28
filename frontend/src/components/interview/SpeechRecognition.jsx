import { useState, useEffect, useRef } from "react";
import { Mic, Sparkles, AlertCircle, Edit3, Check } from "lucide-react";

export default function SpeechRecognition({
  interviewState,
  onAnswerSubmit,
  isSubmitting,
}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(true);
  const [speechError, setSpeechError] = useState(null);
  const [isEditingText, setIsEditingText] = useState(false);

  const recognitionRef = useRef(null);

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
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event) => {
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

        if (finalStr) {
          setTranscript((prev) => (prev + " " + finalStr).trim());
        }
        setInterimTranscript(interimStr);
      };

      recognition.onerror = (event) => {
        console.warn("SpeechRecognition error:", event.error);
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          setSpeechError("Microphone access is denied for speech recognition.");
        } else if (event.error === "no-speech") {
          // Silent timeout
        } else {
          setSpeechError(`Speech error: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.warn("Failed to initialize SpeechRecognition:", err.message);
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsListening(false);
    } else {
      try {
        setSpeechError(null);
        recognitionRef.current.start();
      } catch (e) {
        console.warn("Failed starting speech recognition:", e.message);
      }
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const fullText = (transcript + " " + interimTranscript).trim();
    if (!fullText) return;

    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsListening(false);
    }

    onAnswerSubmit(fullText);
  };

  const isAiSpeaking = interviewState === "AI_SPEAKING";

  return (
    <div className="rounded-2xl border border-[var(--strong-line)] bg-[var(--bg-surface)] p-6 backdrop-blur-xl space-y-4">
      {/* Speech Recognition Controls & Status */}
      <div className="flex items-center justify-between border-b border-[var(--faint-line)] pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleListening}
            disabled={isAiSpeaking || isSubmitting}
            className={`relative flex h-12 w-12 items-center justify-center rounded-xl border transition ${
              isListening
                ? "border-[var(--inv-bg)] bg-[var(--chip-bg)] text-[var(--text-primary-2)] animate-pulse"
                : "border-[var(--strong-line)] bg-[var(--chip-bg)] text-[var(--text-secondary-2)] hover:bg-[var(--strong-line)] hover:text-[var(--text-primary-2)]"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title={isListening ? "Stop Microphone" : "Start Speaking Answer"}
          >
            <Mic className="h-6 w-6" />
          </button>

          <div>
            <h4 className="text-sm font-bold text-[var(--text-primary-3)] leading-tight">
              {isListening
                ? "Listening to your response..."
                : isAiSpeaking
                ? "AI is speaking..."
                : "Click microphone & answer verbally"}
            </h4>
            <p className="text-xs text-[var(--text-secondary-2)] mt-0.5">
              {isListening
                ? "Speak clearly into your microphone"
                : "MockMate automatically converts your speech to text"}
            </p>
          </div>
        </div>

        {/* Listening Waveform Bars Animation */}
        {isListening && (
          <div className="flex items-center gap-1 h-6 px-3 py-1 rounded-full bg-[var(--chip-bg)] border border-[var(--strong-line)]">
            <span className="w-1 bg-[var(--inv-bg)] rounded-full h-3 animate-pulse" />
            <span className="w-1 bg-[var(--inv-bg)] rounded-full h-5 animate-pulse delay-75" />
            <span className="w-1 bg-[var(--inv-bg)] rounded-full h-4 animate-pulse delay-150" />
            <span className="w-1 bg-[var(--inv-bg)] rounded-full h-6 animate-pulse delay-200" />
            <span className="w-1 bg-[var(--inv-bg)] rounded-full h-3 animate-pulse delay-300" />
          </div>
        )}
      </div>

      {/* Unsupported Browser Alert */}
      {!isSupported && (
        <div className="flex items-center gap-2 rounded-xl border border-[rgba(245,158,11,0.25)] bg-[rgba(245,158,11,0.10)] p-3 text-xs text-[#FBBF24]">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>
            Speech recognition is not supported in this browser. You can type your response below.
          </span>
        </div>
      )}

      {/* Speech Error Alert */}
      {speechError && (
        <div className="flex items-center gap-2 rounded-xl border border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.10)] p-3 text-xs text-[#F87171]">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{speechError}</span>
        </div>
      )}

      {/* Live Transcript Display Box */}
      <div className="relative rounded-xl border border-[var(--strong-line)] bg-[var(--bg-void)] p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted-2)]">
            Recognized Speech Transcript
          </span>
          <button
            type="button"
            onClick={() => setIsEditingText(!isEditingText)}
            className="text-xs text-[var(--text-secondary-2)] hover:text-[var(--text-primary-2)] flex items-center gap-1"
          >
            {isEditingText ? (
              <>
                <Check className="h-3.5 w-3.5" /> Done Editing
              </>
            ) : (
              <>
                <Edit3 className="h-3.5 w-3.5" /> Edit Text
              </>
            )}
          </button>
        </div>

        {isEditingText ? (
          <textarea
            rows={3}
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            className="w-full rounded-lg border border-[var(--strong-line)] bg-[var(--bg-surface)] p-2.5 text-xs text-[var(--text-primary-3)] placeholder:text-[var(--text-muted-2)] focus:border-[var(--inv-bg)] focus:outline-none"
            placeholder="Type or correct your answer here..."
          />
        ) : (
          <div className="min-h-[60px] text-xs text-[var(--text-primary-3)] leading-relaxed font-mono">
            {transcript || interimTranscript ? (
              <>
                <span>{transcript}</span>
                {interimTranscript && (
                  <span className="text-[var(--text-secondary-2)] italic"> {interimTranscript}</span>
                )}
              </>
            ) : (
              <span className="text-[var(--text-muted-2)] italic">
                Your spoken answer will appear here as you speak...
              </span>
            )}
          </div>
        )}
      </div>

      {/* Submit Action */}
      <form onSubmit={handleFormSubmit} className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={() => {
            setTranscript("");
            setInterimTranscript("");
          }}
          disabled={isAiSpeaking || isSubmitting || (!transcript && !interimTranscript)}
          className="text-xs font-medium text-[var(--text-muted-2)] hover:text-[var(--text-primary-2)] transition disabled:opacity-40"
        >
          Clear Answer
        </button>

        <button
          type="submit"
          disabled={
            isAiSpeaking ||
            isSubmitting ||
            !(transcript + " " + interimTranscript).trim()
          }
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--inv-bg)] border border-[var(--inv-bg)] px-6 py-3 text-xs font-bold text-[var(--inv-text)] shadow-sm transition hover:bg-[var(--inv-hover-3)] active:bg-[var(--inv-hover-4)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span>Processing response...</span>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>Submit Verbal Answer</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}

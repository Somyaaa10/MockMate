import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import {
  Crown,
  X,
  Award,
  FileText,
  Loader2,
  AlertCircle,
  Clock,
} from "lucide-react";
import axios from "axios";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config/config";

import AIInterviewer from "../components/interview/AIInterviewer";
import AudioInteractionPanel from "../components/interview/AudioInteractionPanel";
import ThemeToggle from "../components/common/ThemeToggle";

function AIInterviewPage() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const candidateName = user?.fullName || user?.name || "Candidate";

  // Session Data

  const [greeting, setGreeting] = useState("");
  const [question, setQuestion] = useState("");
  const [isFollowUp, setIsFollowUp] = useState(false);
  const [targetRole, setTargetRole] = useState("Full Stack Developer");
  const [questionNumber, setQuestionNumber] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [interviewType, setInterviewType] = useState("technical");

  const [conversationHistory, setConversationHistory] = useState([]);

  // Timer State
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // State Machine: "LOADING" | "GREETING" | "AI_SPEAKING" | "READY_TO_ANSWER" | "LISTENING" | "PROCESSING" | "COMPLETED"
  const [interviewState, setInterviewState] = useState("LOADING");

  const [loadingSession, setLoadingSession] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Completion Results
  const [completed, setCompleted] = useState(false);
  const [overallScore, setOverallScore] = useState(null);
  const [finalFeedback, setFinalFeedback] = useState(null);

  const socketRef = useRef(null);

  // -------------------------------------------------------------
  // 1. SPEECH SYNTHESIS HELPER (AI VOICE TTS)
  // -------------------------------------------------------------
  const speakText = (textToSpeak, onEndCallback) => {
    if (!textToSpeak || !window.speechSynthesis) {
      setInterviewState("READY_TO_ANSWER");
      if (onEndCallback) onEndCallback();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        setInterviewState("AI_SPEAKING");
      };

      utterance.onend = () => {
        setInterviewState("READY_TO_ANSWER");
        if (onEndCallback) onEndCallback();
      };

      utterance.onerror = (e) => {
        console.warn("SpeechSynthesis error:", e);
        setInterviewState("READY_TO_ANSWER");
        if (onEndCallback) onEndCallback();
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn("SpeechSynthesis exception:", err);
      setInterviewState("READY_TO_ANSWER");
      if (onEndCallback) onEndCallback();
    }
  };

  const handleReplayQuestion = () => {
    if (question) {
      speakText(question);
    }
  };

  // -------------------------------------------------------------
  // 2. SOCKET.IO REAL-TIME CONNECTION
  // -------------------------------------------------------------
  useEffect(() => {
    if (!token || !id) return;

    try {
      const socket = io("http://localhost:5000", {
        auth: { token },
      });
      socketRef.current = socket;

      socket.emit("ai_interview:join", { interviewId: id });
    } catch (err) {
      console.warn("Socket connection failed:", err.message);
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [token, id]);

  // -------------------------------------------------------------
  // 3. ELAPSED TIME TIMER
  // -------------------------------------------------------------
  useEffect(() => {
    if (interviewState === "LOADING" || interviewState === "COMPLETED") return;

    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [interviewState]);

  const formatTimer = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // -------------------------------------------------------------
  // 4. INITIAL SESSION LOAD & RECOVERY
  // -------------------------------------------------------------
  useEffect(() => {
    if (!token || !id) return;

    // Check state passed from AIInterviewSetup
    const navData = location.state?.firstQuestionData;
    if (navData && navData.interviewId === id) {
      setGreeting(navData.greeting || "");
      setQuestion(navData.question || navData.firstQuestion || "");
      setQuestionNumber(navData.questionNumber || 1);
      setTotalQuestions(navData.totalQuestions || 5);
      setTargetRole(navData.targetRole || "Full Stack Developer");

      setLoadingSession(false);

      const greetingMsg = navData.greeting || "Welcome to your MockMate interview.";
      const qMsg = navData.question || navData.firstQuestion;

      speakText(greetingMsg, () => {
        if (qMsg) speakText(qMsg);
      });

      return;
    }

    // Direct fetch recovery
    const fetchSession = async () => {
      try {
        setLoadingSession(true);
        setError(null);

        const res = await axios.get(`${API_BASE_URL}/interviews/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data?.data;
        if (!data) throw new Error("Interview session not found");


        setInterviewType(data.interviewType || "technical");

        setTargetRole(data.targetRole || "Full Stack Developer");
        setTotalQuestions(data.numberOfQuestions || data.questions?.length || 5);
        setConversationHistory(data.conversationHistory || []);

        if (data.status === "completed") {
          setCompleted(true);
          setOverallScore(data.overallScore);
          setFinalFeedback(data.finalFeedback);
          setInterviewState("COMPLETED");
        } else {
          const currentIndex = data.currentQuestionIndex || 0;
          const currentQObj = data.questions[currentIndex];
          const currentQText = currentQObj?.question || "Tell me about yourself.";

          setQuestionNumber(currentIndex + 1);
          setQuestion(currentQText);
          setGreeting(data.conversationHistory?.[0]?.text || "");
          setLoadingSession(false);

          speakText(currentQText);
        }
      } catch (err) {
        const msg =
          err.response?.data?.message || "Unable to load interview session.";
        setError(msg);
      } finally {
        setLoadingSession(false);
      }
    };

    fetchSession();

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [token, id, location.state]);

  // -------------------------------------------------------------
  // 5. AUTOMATIC ANSWER SUBMISSION (No manual submit button)
  // -------------------------------------------------------------
  const handleAnswerSubmit = async (spokenAnswerText) => {
    if (!spokenAnswerText || !spokenAnswerText.trim()) return;

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    setSubmitting(true);
    setInterviewState("PROCESSING");
    setError(null);

    try {
      const res = await axios.post(
        `${API_BASE_URL}/interviews/${id}/answer`,
        { answer: spokenAnswerText.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const resData = res.data?.data;
      if (resData) {
        setCompleted(resData.completed);
        setIsFollowUp(Boolean(resData.isFollowUp));

        // Update local conversation log
        setConversationHistory((prev) => [
          ...prev,
          { speaker: "candidate", text: spokenAnswerText.trim() },
        ]);

        if (resData.completed) {
          setOverallScore(resData.overallScore);
          setFinalFeedback(resData.finalFeedback);
          setInterviewState("COMPLETED");

          const closingMsg =
            "Thank you. That concludes our interview. I appreciate your time. Your interview report is now being prepared.";
          setConversationHistory((prev) => [
            ...prev,
            { speaker: "ai", text: closingMsg },
          ]);

          speakText(closingMsg);
        } else if (resData.nextQuestion) {
          setQuestion(resData.nextQuestion);
          setQuestionNumber((prev) => prev + 1);

          setConversationHistory((prev) => [
            ...prev,
            {
              speaker: "ai",
              text: resData.nextQuestion,
              isFollowUp: Boolean(resData.isFollowUp),
            },
          ]);

          speakText(resData.nextQuestion);
        }
      }
    } catch (err) {
      if (err.response?.status === 429) {
        setError("Too many AI requests. Please wait a moment and try again.");
      } else {
        const msg =
          err.response?.data?.message ||
          "Failed to process response. Please try again.";
        setError(msg);
      }
      setInterviewState("READY_TO_ANSWER");
    } finally {
      setSubmitting(false);
    }
  };

  const handleExit = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to end the interview? Your interview transcript and report will be saved."
    );
    if (confirmed) {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      try {
        await axios.post(
          `${API_BASE_URL}/interviews/${id}/complete`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        console.warn("Complete on exit:", err.message);
      }
      navigate("/dashboard");
    }
  };

  const formatTypeLabel = (typeStr) => {
    if (!typeStr) return "Technical Interview";
    const clean = typeStr.toLowerCase();
    if (clean === "hr") return "HR Interview";
    if (clean === "behavioral") return "Behavioral Interview";
    if (clean === "mixed") return "Mixed Interview";
    return "Technical Interview";
  };

  if (loadingSession) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg-void)] text-[var(--text-primary-2)] p-6">
        <Loader2 className="h-10 w-10 animate-spin text-[var(--text-primary-2)] mb-3" />
        <p className="text-sm font-medium text-[var(--text-secondary-2)]">
          Loading Real-Time AI Interviewer...
        </p>
      </div>
    );
  }

  if (error && !question) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-void)] p-6">
        <div className="w-full max-w-md rounded-2xl border border-[#EF4444]/30 bg-[#EF4444]/10 p-8 text-center backdrop-blur-xl">
          <AlertCircle className="mx-auto h-10 w-10 text-[#EF4444] mb-3" />
          <h3 className="text-lg font-bold text-[var(--text-primary-2)]">
            Interview Error
          </h3>
          <p className="mt-2 text-sm text-[#EF4444]">{error}</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-6 rounded-xl border border-[var(--strong-line)] bg-[var(--bg-surface)] px-5 py-2.5 text-xs font-semibold text-[var(--text-primary-2)] hover:bg-[var(--hover-bg)]"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // RENDER FINAL COMPLETION SCREEN
  if (completed) {
    return (
      <div className="min-h-screen bg-[var(--bg-void)] text-[var(--text-primary-2)] selection:bg-[var(--inv-bg)] selection:text-[var(--inv-text)]">
        <header className="border-b border-[var(--strong-line)] bg-[var(--bg-void)]">
          <div className="mx-auto flex h-20 max-w-4xl items-center justify-between px-6">
            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--strong-line)] bg-[var(--card-bg-2)] shadow-sm">
                <Crown className="h-5 w-5 text-[var(--text-primary-2)]" />
              </div>
              <span className="text-xl font-bold tracking-tight text-[var(--text-primary-2)]">
                MockMate
              </span>
            </Link>
          </div>
        </header>

        <main className="mx-auto w-full max-w-3xl px-6 py-16">
          <div className="rounded-2xl border border-[var(--strong-line)] bg-[var(--card-bg-2)] p-10 text-center backdrop-blur-xl shadow-2xl">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--bg-surface)] border border-[var(--strong-line)] text-[var(--text-primary-2)] shadow-lg mb-6">
              <Award className="h-10 w-10" />
            </div>

            <h1 className="text-3xl font-extrabold text-[var(--text-primary-2)]">
              Real-Time AI Interview Concluded!
            </h1>
            <p className="mt-2 text-sm text-[var(--text-secondary-2)]">
              Your performance was evaluated across technical depth, communication, and problem solving.
            </p>

            <div className="mt-8 inline-flex flex-col items-center rounded-2xl border border-[var(--strong-line)] bg-[var(--bg-surface)] px-8 py-4 backdrop-blur-md">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary-2)]">
                Overall Performance Score
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-[var(--text-primary-2)]">
                  {overallScore !== null && overallScore !== undefined
                    ? Math.round(overallScore)
                    : "Completed"}
                </span>
                {typeof overallScore === "number" && (
                  <span className="text-sm font-semibold text-[var(--text-muted-2)]">/ 10</span>
                )}
              </div>
            </div>

            {finalFeedback?.summary && (
              <div className="mt-8 text-left rounded-xl border border-[var(--strong-line)] bg-[var(--bg-surface)] p-6">
                <h4 className="text-sm font-bold text-[var(--text-primary-2)] mb-2">Executive Summary</h4>
                <p className="text-xs text-[var(--text-secondary-2)] leading-relaxed">
                  {finalFeedback.summary}
                </p>
              </div>
            )}

            <div className="mt-10 flex justify-center">
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--inv-bg)] px-8 py-3.5 text-sm font-bold text-[var(--inv-text)] shadow-sm transition hover:bg-[var(--inv-hover)]"
              >
                <FileText className="h-4 w-4" />
                View Full Performance Report
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-void)] text-[var(--text-primary-2)] selection:bg-[var(--inv-bg)] selection:text-[var(--inv-text)] flex flex-col justify-between">
      {/* Header — Simplified Audio-Only Header */}
      <header className="border-b border-[var(--strong-line)] bg-[var(--bg-void)] sticky top-0 z-40">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--strong-line)] bg-[var(--card-bg-2)]">
              <Crown className="h-4 w-4 text-[var(--text-primary-2)]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--text-primary-2)] leading-none">
                MockMate AI Interviewer
              </h2>
              <p className="text-xs font-medium text-[var(--text-secondary-2)] mt-1">
                {targetRole} • {formatTypeLabel(interviewType)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            {/* Live Elapsed Timer */}
            <div className="flex items-center gap-1.5 rounded-full border border-[var(--strong-line)] bg-[var(--bg-surface)] px-3 py-1 text-xs font-bold text-[var(--text-primary-2)] font-mono">
              <Clock className="h-3.5 w-3.5 text-[var(--text-secondary-2)]" />
              <span>{formatTimer(elapsedSeconds)}</span>
            </div>

            <button
              type="button"
              onClick={handleExit}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--strong-line)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary-2)] transition hover:bg-[var(--hover-bg)] hover:text-[var(--text-primary-2)]"
            >
              <X className="h-4 w-4" />
              <span className="hidden sm:inline">End Interview</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid Layout */}
      <main className="mx-auto w-full max-w-7xl px-6 py-8 flex-1 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: AI Interviewer */}
        <div className="lg:col-span-8 space-y-6 flex flex-col justify-center">
          <AIInterviewer
            question={question}
            greeting={greeting}
            targetRole={targetRole}
            experienceLevel=""
            questionNumber={questionNumber}
            totalQuestions={totalQuestions}
            interviewState={interviewState}
            isFollowUp={isFollowUp}
            conversationHistory={conversationHistory}
            onReplayQuestion={handleReplayQuestion}
          />

          {/* Error Notice */}
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-[#EF4444]/30 bg-[#EF4444]/10 p-4 text-xs font-semibold text-[#EF4444]">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Right Column: Audio Interaction Panel (No Camera) */}
        <div className="lg:col-span-4 space-y-6 flex flex-col justify-center">
          <AudioInteractionPanel
            candidateName={candidateName}
            interviewState={interviewState}
            onAnswerSubmit={handleAnswerSubmit}
            isSubmitting={submitting}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--strong-line)] bg-[var(--bg-void)] py-4 sticky bottom-0 z-40 text-center text-xs text-[var(--text-muted-2)]">
        Real-Time AI Mock Interview • Audio Only Mode • Speak naturally into your microphone
      </footer>
    </div>
  );
}

export default AIInterviewPage;

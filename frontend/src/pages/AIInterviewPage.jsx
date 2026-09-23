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
  Briefcase,
  UserCheck,
  CheckCircle2,
  Sparkles,
  Volume2,
  Shield,
  Circle,
} from "lucide-react";
import axios from "axios";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config/config";

import AIInterviewer from "../components/interview/AIInterviewer";
import InterviewCamera from "../components/interview/InterviewCamera";
import SpeechRecognition from "../components/interview/SpeechRecognition";
import InterviewEvaluation from "../components/interview/InterviewEvaluation";
import CameraWarningBanner from "../components/interview/CameraWarningBanner";
import IntegrityEndedModal from "../components/interview/IntegrityEndedModal";
import useCameraMonitor from "../hooks/useCameraMonitor";

function AIInterviewPage() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Session Data
  const [interviewData, setInterviewData] = useState(null);
  const [greeting, setGreeting] = useState("");
  const [question, setQuestion] = useState("");
  const [isFollowUp, setIsFollowUp] = useState(false);
  const [targetRole, setTargetRole] = useState("Full Stack Developer");
  const [experienceLevel, setExperienceLevel] = useState("Mid Level");
  const [questionNumber, setQuestionNumber] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [interviewType, setInterviewType] = useState("technical");
  const [difficulty, setDifficulty] = useState("medium");
  const [conversationHistory, setConversationHistory] = useState([]);

  // Enrolled face descriptor passed from setup page (memory only — never localStorage)
  const enrolledDescriptor = location.state?.enrolledDescriptor || null;

  // Camera ref — shared between InterviewCamera and useCameraMonitor
  const cameraVideoRef = useRef(null);
  const [camEnabled, setCamEnabled] = useState(true);

  // Timer State
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // State Machine: "LOADING" | "GREETING" | "AI_SPEAKING" | "READY_TO_ANSWER" | "LISTENING" | "PROCESSING" | "EVALUATION" | "COMPLETED"
  const [interviewState, setInterviewState] = useState("LOADING");

  const [loadingSession, setLoadingSession] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Evaluation & Completion Results
  const [evaluation, setEvaluation] = useState(null);
  const [nextQuestionText, setNextQuestionText] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [overallScore, setOverallScore] = useState(null);
  const [finalFeedback, setFinalFeedback] = useState(null);

  const socketRef = useRef(null);

  // ── Camera Monitoring (separate from AI interview state) ──────────────
  const isInterviewActive = interviewState !== "LOADING" && interviewState !== "COMPLETED";

  const {
    monitorState,
    warningCount,
    activeViolation,
    isEnded: integrityEnded,
  } = useCameraMonitor({
    videoRef: cameraVideoRef,
    isActive: isInterviewActive,
    enrolledDescriptor,
    camEnabled,
    onViolationConfirmed: ({ type, message, count }) => {
      console.log(`[Integrity] Confirmed warning ${count}/3: ${type}`);
    },
    onInterviewEnded: ({ reason }) => {
      console.log(`[Integrity] Interview ended: ${reason}`);
    },
  });

  // Camera status for indicator dot
  const cameraStatus = activeViolation ? "warning" : isInterviewActive ? "ok" : null;

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
      setExperienceLevel(navData.experienceLevel || "Mid Level");
      setDifficulty(navData.difficulty || "medium");
      setLoadingSession(false);

      // AI Greeting -> Speak Greeting then Question
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

        setInterviewData(data);
        setInterviewType(data.interviewType || "technical");
        setDifficulty(data.difficulty || "medium");
        setTargetRole(data.targetRole || "Full Stack Developer");
        setExperienceLevel(data.experienceLevel || "Mid Level");
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
  // 5. SUBMIT VERBAL ANSWER
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
        setEvaluation(resData.evaluation);
        setCompleted(resData.completed);
        setNextQuestionText(resData.nextQuestion);
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

          speakText("Thank you. That concludes your interview. I'll now prepare your performance report.");
        } else {
          setInterviewState("EVALUATION");
        }
      }
    } catch (err) {
      if (err.response?.status === 429) {
        setError("Too many AI requests. Please wait a moment and try again.");
      } else {
        const msg =
          err.response?.data?.message || "Failed to evaluate answer. Please try again.";
        setError(msg);
      }
      setInterviewState("READY_TO_ANSWER");
    } finally {
      setSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // 6. PROCEED TO NEXT QUESTION / FOLLOW-UP
  // -------------------------------------------------------------
  const handleProceedNextQuestion = () => {
    if (completed) {
      setInterviewState("COMPLETED");
      return;
    }

    if (nextQuestionText) {
      setQuestion(nextQuestionText);
      setQuestionNumber((prev) => prev + 1);
      setNextQuestionText(null);
      setEvaluation(null);

      // Add to conversation log
      setConversationHistory((prev) => [
        ...prev,
        { speaker: "ai", text: nextQuestionText, isFollowUp },
      ]);

      speakText(nextQuestionText);
    }
  };

  const handleExit = () => {
    const confirmed = window.confirm(
      "Are you sure you want to leave? Your interview progress is saved."
    );
    if (confirmed) {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      navigate("/dashboard");
    }
  };

  // Handle camera toggle changes from InterviewCamera
  const handleCamStatusChange = (enabled) => {
    setCamEnabled(enabled);
  };

  // Handle camera stream ready — attach to our monitoring ref
  const handleStreamAcquired = (stream) => {
    // The video element inside InterviewCamera already has the stream.
    // We use the video element via cameraVideoRef for monitoring.
    // InterviewCamera internally sets srcObject; we just need the ref.
  };

  const formatLabel = (str) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

  if (loadingSession) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#000000] text-[#FFFFFF] p-6">
        <Loader2 className="h-10 w-10 animate-spin text-[#FFFFFF] mb-3" />
        <p className="text-sm font-medium text-[#A1A1A1]">Loading Real-Time AI Interviewer...</p>
      </div>
    );
  }

  if (error && !question) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#000000] p-6">
        <div className="w-full max-w-md rounded-2xl border border-[#EF4444]/30 bg-[#EF4444]/10 p-8 text-center backdrop-blur-xl">
          <AlertCircle className="mx-auto h-10 w-10 text-[#EF4444] mb-3" />
          <h3 className="text-lg font-bold text-[#FFFFFF]">Interview Error</h3>
          <p className="mt-2 text-sm text-[#EF4444]">{error}</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-6 rounded-xl border border-[#262626] bg-[#0A0A0A] px-5 py-2.5 text-xs font-semibold text-[#FFFFFF] hover:bg-[#1A1A1A]"
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
      <div className="min-h-screen bg-[#000000] text-[#FFFFFF] selection:bg-[#FFFFFF] selection:text-[#000000]">
        <header className="border-b border-[#262626] bg-[#000000]">
          <div className="mx-auto flex h-20 max-w-4xl items-center justify-between px-6">
            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#262626] bg-[#111111] shadow-sm">
                <Crown className="h-5 w-5 text-[#FFFFFF]" />
              </div>
              <span className="text-xl font-bold tracking-tight text-[#FFFFFF]">
                MockMate
              </span>
            </Link>
          </div>
        </header>

        <main className="mx-auto w-full max-w-3xl px-6 py-16">
          <div className="rounded-2xl border border-[#262626] bg-[#111111] p-10 text-center backdrop-blur-xl shadow-2xl">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-[#0A0A0A] border border-[#262626] text-[#FFFFFF] shadow-lg mb-6">
              <Award className="h-10 w-10" />
            </div>

            <h1 className="text-3xl font-extrabold text-[#FFFFFF]">
              Real-Time AI Interview Concluded!
            </h1>
            <p className="mt-2 text-sm text-[#A1A1A1]">
              Your performance was dynamically evaluated across technical depth, communication, and problem solving.
            </p>

            <div className="mt-8 inline-flex flex-col items-center rounded-2xl border border-[#262626] bg-[#0A0A0A] px-8 py-4 backdrop-blur-md">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#A1A1A1]">
                Overall Performance Score
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-[#FFFFFF]">
                  {overallScore !== null && overallScore !== undefined
                    ? overallScore
                    : "Completed"}
                </span>
                {typeof overallScore === "number" && (
                  <span className="text-sm font-semibold text-[#737373]">/ 10</span>
                )}
              </div>
            </div>

            {finalFeedback?.summary && (
              <div className="mt-8 text-left rounded-xl border border-[#262626] bg-[#0A0A0A] p-6">
                <h4 className="text-sm font-bold text-[#FFFFFF] mb-2">Executive Summary</h4>
                <p className="text-xs text-[#A1A1A1] leading-relaxed">
                  {finalFeedback.summary}
                </p>
              </div>
            )}

            <div className="mt-10 flex justify-center">
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="inline-flex items-center gap-2 rounded-xl bg-[#FFFFFF] px-8 py-3.5 text-sm font-bold text-[#000000] shadow-sm transition hover:bg-[#F5F5F5]"
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

  const progressPercent = Math.min(
    100,
    Math.max(0, (questionNumber / totalQuestions) * 100)
  );

  return (
    <div className="min-h-screen bg-[#000000] text-[#FFFFFF] selection:bg-[#FFFFFF] selection:text-[#000000] flex flex-col justify-between">
      {/* Integrity Ended Modal — shown when 3 violations confirmed */}
      {integrityEnded && (
        <IntegrityEndedModal
          violationType={activeViolation?.type}
          warningCount={warningCount}
          maxWarnings={3}
          onReturnDashboard={() => {
            if (window.speechSynthesis) window.speechSynthesis.cancel();
            navigate("/dashboard");
          }}
        />
      )}

      {/* Header */}
      <header className="border-b border-[#262626] bg-[#000000] sticky top-0 z-40">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#262626] bg-[#111111]">
              <Crown className="h-4 w-4 text-[#FFFFFF]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#FFFFFF] leading-none">MockMate AI Interviewer</h2>
              <p className="text-xs font-medium text-[#A1A1A1] mt-1">
                {targetRole} • {experienceLevel} • {formatLabel(difficulty)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Camera status indicator */}
            {isInterviewActive && (
              <div className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${
                activeViolation
                  ? "border-[#F59E0B]/40 bg-[#F59E0B]/10 text-[#F59E0B]"
                  : "border-[#22C55E]/30 bg-[#22C55E]/10 text-[#22C55E]"
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${activeViolation ? "bg-[#F59E0B] animate-pulse" : "bg-[#22C55E]"}`} />
                {activeViolation ? "⚠ Check Camera" : "● Camera Active"}
              </div>
            )}

            {/* Live Elapsed Timer */}
            <div className="flex items-center gap-1.5 rounded-full border border-[#262626] bg-[#0A0A0A] px-3 py-1 text-xs font-bold text-[#FFFFFF] font-mono">
              <Clock className="h-3.5 w-3.5" />
              <span>{formatTimer(elapsedSeconds)}</span>
            </div>

            {/* Warning count badge */}
            {isInterviewActive && (
              <div className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${
                warningCount > 0
                  ? warningCount >= 2 ? "border-[#EF4444]/40 bg-[#EF4444]/10 text-[#EF4444]" : "border-[#F59E0B]/40 bg-[#F59E0B]/10 text-[#F59E0B]"
                  : "border-[#262626] bg-[#0A0A0A] text-[#A1A1A1]"
              }`}>
                Warnings: {warningCount}/3
              </div>
            )}

            {/* Question Progress */}
            <span className="rounded-full border border-[#262626] bg-[#0A0A0A] px-3 py-1 text-xs font-bold text-[#A1A1A1]">
              Q{questionNumber} / Dynamic
            </span>

            <button
              type="button"
              onClick={handleExit}
              className="flex items-center gap-1.5 rounded-lg border border-[#262626] bg-[#0A0A0A] px-3 py-1.5 text-xs font-semibold text-[#A1A1A1] transition hover:bg-[#1A1A1A] hover:text-[#FFFFFF]"
            >
              <X className="h-4 w-4" />
              <span className="hidden sm:inline">End Interview</span>
            </button>
          </div>
        </div>

        {/* Subtle Progress Bar */}
        <div className="h-0.5 w-full bg-[#262626]">
          <div
            className="h-full bg-[#FFFFFF] transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </header>

      {/* Warning Banner — non-blocking, shown just below header */}
      {activeViolation && !integrityEnded && (
        <div className="sticky top-[65px] z-30 mx-auto w-full max-w-7xl px-6 pt-2">
          <CameraWarningBanner
            violationType={activeViolation.type}
            message={activeViolation.message}
            warningCount={warningCount}
            maxWarnings={3}
            onCameraEnable={() => handleCamStatusChange(true)}
          />
        </div>
      )}

      {/* Main Grid Layout */}
      <main className="mx-auto w-full max-w-7xl px-6 py-8 flex-1 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: AI Interviewer & Evaluation */}
        <div className="lg:col-span-8 space-y-6 flex flex-col justify-center">
          {/* AI Interviewer Component */}
          <AIInterviewer
            question={question}
            greeting={greeting}
            targetRole={targetRole}
            experienceLevel={experienceLevel}
            questionNumber={questionNumber}
            totalQuestions={totalQuestions}
            interviewState={interviewState}
            isFollowUp={isFollowUp}
            conversationHistory={conversationHistory}
            onReplayQuestion={handleReplayQuestion}
          />

          {/* Evaluation Component */}
          {evaluation && (
            <InterviewEvaluation
              evaluation={evaluation}
              onProceed={handleProceedNextQuestion}
            />
          )}

          {/* Error Notice */}
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-[#EF4444]/30 bg-[#EF4444]/10 p-4 text-xs font-semibold text-[#EF4444]">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Right Column: Candidate Camera & Voice Input */}
        <div className="lg:col-span-4 space-y-6 flex flex-col justify-center">
          {/* User Camera Preview — videoRef forwarded for monitoring */}
          <InterviewCamera
            videoRef={cameraVideoRef}
            onStreamAcquired={handleStreamAcquired}
            onCamStatusChange={handleCamStatusChange}
            cameraStatus={cameraStatus}
          />

          {/* Speech Recognition Input */}
          {!evaluation && (
            <SpeechRecognition
              interviewState={interviewState}
              onAnswerSubmit={handleAnswerSubmit}
              isSubmitting={submitting}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#262626] bg-[#000000] py-4 sticky bottom-0 z-40 text-center text-xs text-[#737373]">
        Real-Time AI Mock Interview • Speak naturally into your microphone
      </footer>
    </div>
  );
}

export default AIInterviewPage;

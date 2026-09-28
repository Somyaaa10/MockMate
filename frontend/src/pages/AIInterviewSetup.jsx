import { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  Crown,
  ArrowLeft,
  FileText,
  Zap,
  Sliders,
  HelpCircle,
  Loader2,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  Briefcase,
  UserCheck,
  Clock,
  Camera,
  Mic,
  Video,
  VideoOff,
  MicOff,
  X,
  ShieldAlert,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config/config";
import PreJoinCheck from "../components/interview/PreJoinCheck";
import ThemeToggle from "../components/common/ThemeToggle";

function AIInterviewSetup() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Form State
  const [resumes, setResumes] = useState([]);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [targetRole, setTargetRole] = useState("Full Stack Developer");
  const [customRole, setCustomRole] = useState("");
  const [interviewType, setInterviewType] = useState("technical");
  const [difficulty, setDifficulty] = useState("medium");
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const [durationMinutes, setDurationMinutes] = useState(15);

  // Profile photo / face enrollment state
  const [enrolledDescriptor, setEnrolledDescriptor] = useState(null);
  const [loadingDescriptor, setLoadingDescriptor] = useState(false);

  // PreJoin check modal (replaces old hardware-only modal)
  const [showPrecheckModal, setShowPrecheckModal] = useState(false);

  // Legacy hardware check state (kept for compatibility, no longer used)
  const [camAllowed, setCamAllowed] = useState(false);
  const [micAllowed, setMicAllowed] = useState(false);
  const [checkingHardware, setCheckingHardware] = useState(false);
  const [hardwareError, setHardwareError] = useState(null);

  const modalVideoRef = useRef(null);
  const modalStreamRef = useRef(null);

  // Submitting & Error State
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [quotaInfo, setQuotaInfo] = useState(null);

  // Fetch User Resumes & Quota on Mount
  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        setLoadingResumes(true);
        const [resumesRes, dashRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/resumes`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE_URL}/dashboard`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const resumeList = Array.isArray(resumesRes.data?.data) ? resumesRes.data.data : [];
        setResumes(resumeList);

        const targetResumeId = location.state?.selectedResumeId || location.state?.resumeId;
        if (targetResumeId && resumeList.some((r) => r._id === targetResumeId)) {
          setSelectedResumeId(targetResumeId);
        } else if (resumeList.length > 0) {
          setSelectedResumeId(resumeList[0]._id);
        }

        if (dashRes.data?.data) {
          setQuotaInfo({
            plan: dashRes.data.data.plan,
            used: dashRes.data.data.aiInterviewsUsed ?? 0,
            limit: dashRes.data.data.aiInterviewsLimit ?? 2,
            remaining: dashRes.data.data.aiInterviewsRemaining ?? 2,
            quotaExceeded: dashRes.data.data.quotaExceeded ?? false,
          });
        }
      } catch (err) {
        console.error("Failed to fetch setup data:", err);
      } finally {
        setLoadingResumes(false);
      }
    };

    fetchData();
  }, [token]);

  // Fetch enrolled face descriptor when pre-check modal is opened
  const fetchEnrolledDescriptor = async () => {
    if (!token || enrolledDescriptor) return;
    setLoadingDescriptor(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/auth/face-descriptor`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEnrolledDescriptor(res.data?.data?.faceDescriptor || null);
    } catch {
      setEnrolledDescriptor(null);
    } finally {
      setLoadingDescriptor(false);
    }
  };

  // Clean up media stream if modal is closed
  useEffect(() => {
    return () => {
      if (modalStreamRef.current) {
        modalStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);


  const handleSubmitSetup = async (e) => {
    e.preventDefault();

    if (!selectedResumeId) {
      setError("Please select a resume before starting the interview.");
      return;
    }

    const qCount = Number(numberOfQuestions);
    if (!Number.isInteger(qCount) || qCount < 1 || qCount > 20) {
      setError("Number of questions must be between 1 and 20.");
      return;
    }

    setError(null);
    handleLaunchInterview();
  };

  // Launch interview session directly
  const handleLaunchInterview = async () => {
    const finalRole = targetRole === "Custom" ? (customRole || "Software Developer") : targetRole;
    const qCount = Number(numberOfQuestions);

    if (modalStreamRef.current) {
      modalStreamRef.current.getTracks().forEach((t) => t.stop());
    }

    setSubmitting(true);
    setError(null);

    try {
      // Step 1: Create Interview Session
      const createRes = await axios.post(
        `${API_BASE_URL}/interviews`,
        {
          resumeId: selectedResumeId,
          targetRole: finalRole,
          interviewType,
          difficulty,
          numberOfQuestions: qCount,
          durationMinutes,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const interviewId = createRes.data?.data?.interviewId;
      if (!interviewId) {
        throw new Error("Failed to retrieve interview session ID.");
      }

      // Step 2: Start Interview Session
      const startRes = await axios.post(
        `${API_BASE_URL}/interviews/${interviewId}/start`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const firstQuestionData = startRes.data?.data;

      // Navigate to Active Interview Player — pass enrolledDescriptor in memory (state)
      navigate(`/interview/${interviewId}`, {
        state: { firstQuestionData, enrolledDescriptor },
      });
    } catch (err) {
      const errMsg =
        err.response?.data?.message || "Unable to start interview. Please try again.";
      setError(errMsg);
      setSubmitting(false);
      setShowPrecheckModal(false);
    }
  };

  const roleOptions = [
    "Full Stack Developer",
    "Frontend Engineer",
    "Backend Engineer",
    "DevOps Engineer",
    "Data Engineer",
    "Mobile App Developer",
    "Custom",
  ];

  const interviewTypeOptions = [
    {
      id: "technical",
      label: "Technical",
      icon: "⚡",
      desc: "Technical skills, coding & problem solving",
    },
    {
      id: "hr",
      label: "HR",
      icon: "👤",
      desc: "Behavioral, background & career questions",
    },
    {
      id: "behavioral",
      label: "Behavioral",
      icon: "◇",
      desc: "Situational, teamwork & workplace scenarios",
    },
    {
      id: "mixed",
      label: "Mixed",
      icon: "✦",
      desc: "Technical + HR + Behavioral",
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-void)] text-[var(--text-primary-2)] selection:bg-[var(--inv-bg)] selection:text-[var(--inv-text)]">
      {/* Top Bar Navigation */}
      <header className="border-b border-[var(--strong-line)] bg-[var(--bg-void)] sticky top-0 z-30">
        <div className="mx-auto flex h-20 max-w-5xl items-center justify-between px-6">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--strong-line)] bg-[var(--card-bg-2)] shadow-sm">
              <Crown className="h-5 w-5 text-[var(--text-primary-2)]" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[var(--text-primary-2)]">
              MockMate
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--strong-line)] bg-[var(--bg-surface)] px-4 py-2 text-sm font-semibold text-[var(--text-secondary-2)] transition hover:bg-[var(--hover-bg)] hover:text-[var(--text-primary-2)]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Setup Container */}
      <main className="mx-auto w-full max-w-3xl px-6 py-12">
        {/* Step Indicator */}

        <div className="flex items-center justify-center gap-4 mt-6">
          <div className="flex items-center gap-2 text-xs font-bold text-orange-400">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-400">1</span>
            <span>01 Setup</span>
          </div>
          <div className="h-0.5 w-8 bg-[var(--strong-line)]" />
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-muted-2)]">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--hover-bg)] border border-[var(--strong-line)]">2</span>
            <span>02 Live AI Interview</span>
          </div>
          <div className="h-0.5 w-8 bg-[var(--strong-line)]" />
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-muted-2)]">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--hover-bg)] border border-[var(--strong-line)]">3</span>
            <span>03 AI Evaluation</span>
          </div>
        </div>

        <div className="text-center mt-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 text-xs font-bold text-orange-400 backdrop-blur-xl">
            <Sparkles className="h-3.5 w-3.5 fill-current" />
            Adaptive AI Interview Engine
          </div>

          <h1 className="mt-4 text-3xl font-extrabold text-[var(--text-primary-2)] sm:text-4xl tracking-tight">
            Prepare Your AI Interview
          </h1>
          <p className="mt-2 text-sm text-[var(--text-secondary-2)] max-w-lg mx-auto">
            Configure your target role, difficulty, and resume context for a real-time adaptive technical evaluation.
          </p>
        </div>

        {/* Personalization Preview Banner */}
        <div className="mt-8 rounded-2xl border border-orange-500/20 bg-gradient-to-r from-orange-950/20 via-[var(--bg-surface)] to-pink-950/20 p-5 backdrop-blur-xl">
          <p className="text-xs font-bold uppercase tracking-wider text-orange-400 mb-2">
            ✨ Real-Time Personalization Preview
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-[var(--text-primary-3)]">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-orange-400 shrink-0" />
              <span>Resume Projects</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-orange-400 shrink-0" />
              <span>Technical Skills</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-orange-400 shrink-0" />
              <span>Work Experience</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-orange-400 shrink-0" />
              <span>Adaptive Questioning</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmitSetup} className="mt-8 space-y-8">

          {/* 1. TARGET ROLE */}
          <div className="rounded-2xl border border-[var(--strong-line)] bg-[var(--card-bg-2)] p-6 backdrop-blur-xl">
            <div>
              <label className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[var(--text-primary-2)] mb-2">
                <Briefcase className="h-4 w-4 text-[var(--text-secondary-2)]" />
                1. Target Job Role
              </label>
              <p className="text-xs text-[var(--text-secondary-2)] mb-3">
                The AI will tailor questions specifically to this position
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {roleOptions.map((role) => {
                  const isSelected = targetRole === role;
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setTargetRole(role)}
                      className={`rounded-xl border p-3 text-xs font-bold text-left transition ${
                        isSelected
                          ? "border-[var(--inv-bg)] bg-[var(--inv-bg)] text-[var(--inv-text)]"
                          : "border-[var(--strong-line)] bg-[var(--bg-surface)] text-[var(--text-secondary-2)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary-2)]"
                      }`}
                    >
                      {role}
                    </button>
                  );
                })}
              </div>

              {targetRole === "Custom" && (
                <div className="mt-3">
                  <input
                    type="text"
                    placeholder="Enter custom job title (e.g. AI Systems Engineer)..."
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value)}
                    className="w-full rounded-xl border border-[var(--strong-line)] bg-[var(--bg-surface)] px-4 py-2.5 text-xs text-[var(--text-primary-2)] placeholder:text-[var(--text-muted-2)] focus:border-[var(--inv-bg)] focus:outline-none"
                  />
                </div>
              )}
            </div>
          </div>

          {/* 2. SELECT RESUME */}
          <div className="rounded-2xl border border-[var(--strong-line)] bg-[var(--card-bg-2)] p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[var(--text-primary-2)]">
                <FileText className="h-4 w-4 text-[var(--text-secondary-2)]" />
                2. Candidate Resume Context
              </label>
              {resumes.length > 0 && (
                <Link
                  to="/dashboard"
                  className="text-xs font-semibold text-orange-400 hover:text-orange-300 transition flex items-center gap-1"
                >
                  + Upload New Resume
                </Link>
              )}
            </div>
            <p className="text-xs text-[var(--text-secondary-2)] mb-4">
              Select the resume you want to use for this interview. Questions will be personalized based on your actual experience.
            </p>

            {loadingResumes ? (
              <div className="flex items-center gap-2 py-4 text-sm text-[var(--text-secondary-2)]">
                <Loader2 className="h-4 w-4 animate-spin text-[var(--text-primary-2)]" />
                Loading your uploaded resumes...
              </div>
            ) : resumes.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#F59E0B]/30 bg-[#F59E0B]/10 p-6 text-center">
                <p className="text-sm font-bold text-[#F59E0B]">
                  No resume available
                </p>
                <p className="mt-1 text-xs text-[var(--text-secondary-2)] max-w-md mx-auto">
                  Upload a resume to enable personalized interview questions based on your background and projects.
                </p>
                <Link
                  to="/dashboard"
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[var(--inv-bg)] px-5 py-2.5 text-xs font-bold text-[var(--inv-text)] shadow-sm transition hover:bg-[var(--inv-hover)]"
                >
                  Upload Resume
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-3">
                  {resumes.map((r) => {
                    const isSelected = selectedResumeId === r._id;
                    const skillsSummary = Array.isArray(r.skills) && r.skills.length > 0
                      ? r.skills.slice(0, 4).join(" • ")
                      : r.targetRole || "Uploaded recently";

                    return (
                      <div
                        key={r._id}
                        onClick={() => setSelectedResumeId(r._id)}
                        className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition ${
                          isSelected
                            ? "border-orange-500/50 bg-orange-500/10 shadow-sm"
                            : "border-[var(--strong-line)] bg-[var(--bg-surface)] hover:border-[var(--border-strong)]"
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                            isSelected
                              ? "border-orange-500/40 bg-orange-500/20 text-orange-400"
                              : "border-[var(--strong-line)] bg-[var(--card-bg-2)] text-[var(--text-secondary-2)]"
                          }`}>
                            <FileText className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[var(--text-primary-2)]">
                              {r.fileName}
                            </p>
                            <p className="text-xs font-semibold text-orange-400 mt-0.5">
                              {skillsSummary}
                            </p>
                            <p className="text-[10px] text-[var(--text-muted-2)] mt-0.5">
                              Uploaded {new Date(r.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-white shrink-0">
                            <CheckCircle2 className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2 text-right">
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary-2)] hover:text-[var(--text-primary-2)] transition"
                  >
                    + Upload New Resume
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* 3. INTERVIEW TYPE */}
          <div className="rounded-2xl border border-[var(--strong-line)] bg-[var(--card-bg-2)] p-6 backdrop-blur-xl">
            <label className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[var(--text-primary-2)] mb-2">
              <Zap className="h-4 w-4 text-orange-400" />
              3. Interview Type
            </label>
            <p className="text-xs text-[var(--text-secondary-2)] mb-4">
              Select the category of questions for this interview session
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {interviewTypeOptions.map((opt) => {
                const isSelected = interviewType === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setInterviewType(opt.id)}
                    className={`cursor-pointer rounded-xl border p-4 transition flex flex-col justify-between ${
                      isSelected
                        ? "border-orange-500/50 bg-orange-500/10 shadow-sm"
                        : "border-[var(--strong-line)] bg-[var(--bg-surface)] hover:border-[var(--border-strong)]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{opt.icon}</span>
                        <p className="text-sm font-bold text-[var(--text-primary-2)]">{opt.label}</p>
                      </div>
                      {isSelected && (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-white shrink-0">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-[var(--text-secondary-2)]">{opt.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. MAX QUESTION LIMIT */}
          <div className="rounded-2xl border border-[var(--strong-line)] bg-[var(--card-bg-2)] p-6 backdrop-blur-xl">
            <label className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[var(--text-primary-2)] mb-2">
              <HelpCircle className="h-4 w-4 text-[var(--text-secondary-2)]" />
              4. Max Question Limit
            </label>
            <p className="text-xs text-[var(--text-secondary-2)] mb-3">
              Set the maximum number of questions for this session
            </p>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                max="20"
                value={numberOfQuestions}
                onChange={(e) => setNumberOfQuestions(e.target.value)}
                className="w-full rounded-xl border border-[var(--strong-line)] bg-[var(--bg-surface)] px-4 py-2.5 text-xs font-bold text-[var(--text-primary-2)] focus:border-[var(--inv-bg)] focus:outline-none"
              />
              <span className="text-xs font-medium text-[var(--text-secondary-2)] shrink-0">
                Questions
              </span>
            </div>
          </div>

          {/* Quota Exceeded Banner */}
          {quotaInfo?.quotaExceeded && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-5 text-xs font-semibold text-rose-500">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
                <div>
                  <p className="font-bold text-[var(--text-primary-2)]">INTERVIEW LIMIT REACHED</p>
                  <p className="mt-0.5 text-[var(--text-secondary-2)]">
                    You have used all {quotaInfo.limit} {quotaInfo.plan === "FREE" ? "free " : ""}AI interviews. Upgrade your plan to continue.
                  </p>
                </div>
              </div>
              <Link
                to="/dashboard"
                className="shrink-0 rounded-xl bg-[var(--inv-bg)] px-4 py-2 text-xs font-bold text-[var(--inv-text)] shadow-sm transition hover:bg-[var(--inv-hover-2)]"
              >
                Upgrade to Pro
              </Link>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-[#EF4444]/30 bg-[#EF4444]/10 p-4 text-xs font-semibold text-[#EF4444]">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button -> Launches Interview Directly */}
          <button
            type="submit"
            disabled={submitting || resumes.length === 0 || quotaInfo?.quotaExceeded}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-[var(--inv-bg)] py-4 text-base font-bold text-[var(--inv-text)] shadow-sm transition hover:bg-[var(--inv-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin text-[var(--inv-text)]" />
                <span>Starting Session...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                <span>Start AI Interview</span>
              </>
            )}
          </button>

        </form>
      </main>
    </div>
  );
}

export default AIInterviewSetup;

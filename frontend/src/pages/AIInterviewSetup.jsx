import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";

import {
  Crown,
  ArrowLeft,
  FileText,
  Zap,
  HelpCircle,
  Loader2,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  Briefcase,
} from "lucide-react";

import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config/config";
import ThemeToggle from "../components/common/ThemeToggle";

const DEFAULT_DIFFICULTY = "medium";
const DEFAULT_DURATION_MINUTES = 15;

function AIInterviewSetup() {
  const { token } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  // -------------------------------------------------------------
  // FORM STATE
  // -------------------------------------------------------------

  const [resumes, setResumes] = useState([]);
  const [loadingResumes, setLoadingResumes] = useState(true);

  const [selectedResumeId, setSelectedResumeId] = useState("");

  const [targetRole, setTargetRole] = useState("Full Stack Developer");
  const [customRole, setCustomRole] = useState("");

  const [interviewType, setInterviewType] = useState("technical");

  const [numberOfQuestions, setNumberOfQuestions] = useState(5);

  // Face descriptor is retained for compatibility with the active
  // interview route. The current setup flow does not perform
  // hardware/face enrollment checks.
  const [enrolledDescriptor] = useState(null);

  // -------------------------------------------------------------
  // SUBMITTING / ERROR / QUOTA STATE
  // -------------------------------------------------------------

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [quotaInfo, setQuotaInfo] = useState(null);

  // -------------------------------------------------------------
  // FETCH USER RESUMES & QUOTA
  // -------------------------------------------------------------

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        setLoadingResumes(true);

        const [resumesRes, dashRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/resumes`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),

          axios.get(`${API_BASE_URL}/dashboard`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        const resumeList = Array.isArray(resumesRes.data?.data)
          ? resumesRes.data.data
          : [];

        setResumes(resumeList);

        // Resume passed from dashboard / previous page
        const targetResumeId =
          location.state?.selectedResumeId || location.state?.resumeId;

        if (
          targetResumeId &&
          resumeList.some((resume) => resume._id === targetResumeId)
        ) {
          setSelectedResumeId(targetResumeId);
        } else if (resumeList.length > 0) {
          setSelectedResumeId(resumeList[0]._id);
        }

        // Dashboard quota information
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
  }, [
    token,
    location.state?.selectedResumeId,
    location.state?.resumeId,
  ]);

  // -------------------------------------------------------------
  // FORM VALIDATION
  // -------------------------------------------------------------

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

    if (quotaInfo?.quotaExceeded) {
      setError(
        "Your AI interview limit has been reached. Please upgrade your plan.",
      );
      return;
    }

    setError(null);

    await handleLaunchInterview();
  };

  // -------------------------------------------------------------
  // LAUNCH INTERVIEW SESSION
  // -------------------------------------------------------------

  const handleLaunchInterview = async () => {
    const finalRole =
      targetRole === "Custom"
        ? customRole.trim() || "Software Developer"
        : targetRole;

    const qCount = Number(numberOfQuestions);

    setSubmitting(true);
    setError(null);

    try {
      // ---------------------------------------------------------
      // STEP 1: CREATE INTERVIEW SESSION
      // ---------------------------------------------------------

      const createRes = await axios.post(
        `${API_BASE_URL}/interviews`,
        {
          resumeId: selectedResumeId,
          targetRole: finalRole,
          interviewType,
          difficulty: DEFAULT_DIFFICULTY,
          numberOfQuestions: qCount,
          durationMinutes: DEFAULT_DURATION_MINUTES,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const interviewId = createRes.data?.data?.interviewId;

      if (!interviewId) {
        throw new Error("Failed to retrieve interview session ID.");
      }

      // ---------------------------------------------------------
      // STEP 2: START INTERVIEW SESSION
      // ---------------------------------------------------------

      const startRes = await axios.post(
        `${API_BASE_URL}/interviews/${interviewId}/start`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const firstQuestionData = startRes.data?.data;

      // ---------------------------------------------------------
      // STEP 3: NAVIGATE TO ACTIVE INTERVIEW
      // ---------------------------------------------------------

      navigate(`/interview/${interviewId}`, {
        state: {
          firstQuestionData,
          enrolledDescriptor,
        },
      });
    } catch (err) {
      const errMsg =
        err.response?.data?.message ||
        "Unable to start interview. Please try again.";

      setError(errMsg);
      setSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // OPTIONS
  // -------------------------------------------------------------

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

  // -------------------------------------------------------------
  // UI
  // -------------------------------------------------------------

  return (
    <div className="min-h-screen bg-[var(--bg-void)] text-[var(--text-primary-2)] selection:bg-[var(--inv-bg)] selection:text-[var(--inv-text)]">
      {/* Top Bar Navigation */}
      <header className="sticky top-0 z-30 border-b border-[var(--strong-line)] bg-[var(--bg-void)]">
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
        <div className="mt-6 flex items-center justify-center gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-orange-400">
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-orange-500/40 bg-orange-500/20 text-orange-400">
              1
            </span>
            <span>01 Setup</span>
          </div>

          <div className="h-0.5 w-8 bg-[var(--strong-line)]" />

          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-muted-2)]">
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[var(--strong-line)] bg-[var(--hover-bg)]">
              2
            </span>
            <span>02 Live AI Interview</span>
          </div>

          <div className="h-0.5 w-8 bg-[var(--strong-line)]" />

          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-muted-2)]">
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[var(--strong-line)] bg-[var(--hover-bg)]">
              3
            </span>
            <span>03 AI Evaluation</span>
          </div>
        </div>

        {/* Page Heading */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 text-xs font-bold text-orange-400 backdrop-blur-xl">
            <Sparkles className="h-3.5 w-3.5 fill-current" />
            Adaptive AI Interview Engine
          </div>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-[var(--text-primary-2)] sm:text-4xl">
            Prepare Your AI Interview
          </h1>

          <p className="mx-auto mt-2 max-w-lg text-sm text-[var(--text-secondary-2)]">
            Configure your target role, difficulty, and resume context for a
            real-time adaptive technical evaluation.
          </p>
        </div>

        {/* Personalization Preview Banner */}
        <div className="mt-8 rounded-2xl border border-orange-500/20 bg-gradient-to-r from-orange-950/20 via-[var(--bg-surface)] to-pink-950/20 p-5 backdrop-blur-xl">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-orange-400">
            ✨ Real-Time Personalization Preview
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs text-[var(--text-primary-3)] sm:grid-cols-4">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-orange-400" />
              <span>Resume Projects</span>
            </div>

            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-orange-400" />
              <span>Technical Skills</span>
            </div>

            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-orange-400" />
              <span>Work Experience</span>
            </div>

            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-orange-400" />
              <span>Adaptive Questioning</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmitSetup} className="mt-8 space-y-8">
          {/* 1. TARGET ROLE */}
          <div className="rounded-2xl border border-[var(--strong-line)] bg-[var(--card-bg-2)] p-6 backdrop-blur-xl">
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[var(--text-primary-2)]">
                <Briefcase className="h-4 w-4 text-[var(--text-secondary-2)]" />
                1. Target Job Role
              </label>

              <p className="mb-3 text-xs text-[var(--text-secondary-2)]">
                The AI will tailor questions specifically to this position
              </p>

              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {roleOptions.map((role) => {
                  const isSelected = targetRole === role;

                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setTargetRole(role)}
                      className={`rounded-xl border p-3 text-left text-xs font-bold transition ${isSelected
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
            <div className="mb-2 flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[var(--text-primary-2)]">
                <FileText className="h-4 w-4 text-[var(--text-secondary-2)]" />
                2. Candidate Resume Context
              </label>

              {resumes.length > 0 && (
                <Link
                  to="/dashboard"
                  className="flex items-center gap-1 text-xs font-semibold text-orange-400 transition hover:text-orange-300"
                >
                  + Upload New Resume
                </Link>
              )}
            </div>

            <p className="mb-4 text-xs text-[var(--text-secondary-2)]">
              Select the resume you want to use for this interview. Questions
              will be personalized based on your actual experience.
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

                <p className="mx-auto mt-1 max-w-md text-xs text-[var(--text-secondary-2)]">
                  Upload a resume to enable personalized interview questions
                  based on your background and projects.
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
                  {resumes.map((resume) => {
                    const isSelected = selectedResumeId === resume._id;

                    const skillsSummary =
                      Array.isArray(resume.skills) &&
                        resume.skills.length > 0
                        ? resume.skills.slice(0, 4).join(" • ")
                        : resume.targetRole || "Uploaded recently";

                    return (
                      <div
                        key={resume._id}
                        onClick={() => setSelectedResumeId(resume._id)}
                        className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition ${isSelected
                            ? "border-orange-500/50 bg-orange-500/10 shadow-sm"
                            : "border-[var(--strong-line)] bg-[var(--bg-surface)] hover:border-[var(--border-strong)]"
                          }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${isSelected
                                ? "border-orange-500/40 bg-orange-500/20 text-orange-400"
                                : "border-[var(--strong-line)] bg-[var(--card-bg-2)] text-[var(--text-secondary-2)]"
                              }`}
                          >
                            <FileText className="h-5 w-5" />
                          </div>

                          <div>
                            <p className="text-sm font-bold text-[var(--text-primary-2)]">
                              {resume.fileName}
                            </p>

                            <p className="mt-0.5 text-xs font-semibold text-orange-400">
                              {skillsSummary}
                            </p>

                            <p className="mt-0.5 text-[10px] text-[var(--text-muted-2)]">
                              Uploaded{" "}
                              {new Date(
                                resume.createdAt,
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500 text-white">
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
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary-2)] transition hover:text-[var(--text-primary-2)]"
                  >
                    + Upload New Resume
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* 3. INTERVIEW TYPE */}
          <div className="rounded-2xl border border-[var(--strong-line)] bg-[var(--card-bg-2)] p-6 backdrop-blur-xl">
            <label className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[var(--text-primary-2)]">
              <Zap className="h-4 w-4 text-orange-400" />
              3. Interview Type
            </label>

            <p className="mb-4 text-xs text-[var(--text-secondary-2)]">
              Select the category of questions for this interview session
            </p>

            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              {interviewTypeOptions.map((option) => {
                const isSelected = interviewType === option.id;

                return (
                  <div
                    key={option.id}
                    onClick={() => setInterviewType(option.id)}
                    className={`flex cursor-pointer flex-col justify-between rounded-xl border p-4 transition ${isSelected
                        ? "border-orange-500/50 bg-orange-500/10 shadow-sm"
                        : "border-[var(--strong-line)] bg-[var(--bg-surface)] hover:border-[var(--border-strong)]"
                      }`}
                  >
                    <div className="mb-1.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{option.icon}</span>

                        <p className="text-sm font-bold text-[var(--text-primary-2)]">
                          {option.label}
                        </p>
                      </div>

                      {isSelected && (
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-500 text-white">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-[var(--text-secondary-2)]">
                      {option.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. MAX QUESTION LIMIT */}
          <div className="rounded-2xl border border-[var(--strong-line)] bg-[var(--card-bg-2)] p-6 backdrop-blur-xl">
            <label className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[var(--text-primary-2)]">
              <HelpCircle className="h-4 w-4 text-orange-400" />
              4. Max Question Limit
            </label>

            <p className="mb-3 text-xs text-[var(--text-secondary-2)]">
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

              <span className="shrink-0 text-xs font-medium text-[var(--text-secondary-2)]">
                Questions
              </span>
            </div>
          </div>

          {/* QUOTA EXCEEDED */}
          {quotaInfo?.quotaExceeded && (
            <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-5 text-xs font-semibold text-rose-500 sm:flex-row">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />

                <div>
                  <p className="font-bold text-[var(--text-primary-2)]">
                    INTERVIEW LIMIT REACHED
                  </p>

                  <p className="mt-0.5 text-[var(--text-secondary-2)]">
                    You have used all {quotaInfo.limit}{" "}
                    {quotaInfo.plan === "FREE" ? "free " : ""}
                    AI interviews. Upgrade your plan to continue.
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

          {/* ERROR MESSAGE */}
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-[#EF4444]/30 bg-[#EF4444]/10 p-4 text-xs font-semibold text-[#EF4444]">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* START INTERVIEW */}
          <button
            type="submit"
            disabled={
              submitting ||
              resumes.length === 0 ||
              quotaInfo?.quotaExceeded
            }
            className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-[var(--inv-bg)] py-4 text-base font-bold text-[var(--inv-text)] shadow-sm transition hover:bg-[var(--inv-hover)] disabled:cursor-not-allowed disabled:opacity-50"
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
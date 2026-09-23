import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
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

function AIInterviewSetup() {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [resumes, setResumes] = useState([]);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [targetRole, setTargetRole] = useState("Full Stack Developer");
  const [customRole, setCustomRole] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("Mid Level");
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

        if (resumeList.length > 0) {
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


  const openHardwareCheck = async (e) => {
    e.preventDefault();

    // Profile photo gate — block if not enrolled
    if (!user?.hasFaceDescriptor || !user?.profileImage) {
      setError("Profile photo required. Please add a profile photo with face enrollment in your Profile tab before starting an AI interview.");
      return;
    }

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
    setShowPrecheckModal(true);
    fetchEnrolledDescriptor();
  };

  const testHardwarePermissions = async () => {
    setCheckingHardware(true);
    setHardwareError(null);
    setCamAllowed(false);
    setMicAllowed(false);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Browser does not support media devices.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      modalStreamRef.current = stream;
      if (modalVideoRef.current) {
        modalVideoRef.current.srcObject = stream;
      }

      const hasVideo = stream.getVideoTracks().length > 0 && stream.getVideoTracks()[0].enabled;
      const hasAudio = stream.getAudioTracks().length > 0 && stream.getAudioTracks()[0].enabled;

      setCamAllowed(hasVideo);
      setMicAllowed(hasAudio);
    } catch (err) {
      console.warn("Hardware test error:", err.name, err.message);
      let userMsg = "Camera and microphone permissions are required.";
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        userMsg = "Permission denied. Please allow microphone and camera in your browser settings.";
      } else if (err.name === "NotFoundError") {
        userMsg = "No camera or microphone hardware found on your device.";
      }
      setHardwareError(userMsg);
    } finally {
      setCheckingHardware(false);
    }
  };

  const closePrecheckModal = () => {
    if (modalStreamRef.current) {
      modalStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    setShowPrecheckModal(false);
  };

  // Called by PreJoinCheck when all 6 checks pass
  const handlePreJoinPassed = ({ stream }) => {
    // Preserve the stream reference for the interview page if needed
    if (stream) modalStreamRef.current = stream;
    handleLaunchInterview();
  };

  // Launch interview session after pre-join check passes
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
          experienceLevel,
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

  const experienceOptions = [
    { id: "Entry Level", label: "Entry Level", desc: "0 - 2 years experience" },
    { id: "Mid Level", label: "Mid Level", desc: "2 - 5 years experience" },
    { id: "Senior", label: "Senior", desc: "5+ years & leadership" },
  ];

  const interviewTypeOptions = [
    { id: "technical", label: "Technical", desc: "Coding, architecture, & algorithms" },
    { id: "hr", label: "HR", desc: "Cultural fit, background, & motivation" },
    { id: "behavioral", label: "Behavioral", desc: "Past experiences & situational response" },
    { id: "mixed", label: "Mixed", desc: "Balanced combination of technical & HR" },
  ];

  const difficultyOptions = [
    { id: "easy", label: "Easy", color: "text-emerald-400 border-emerald-500/30" },
    { id: "medium", label: "Medium", color: "text-amber-400 border-amber-500/30" },
    { id: "hard", label: "Hard", color: "text-rose-400 border-rose-500/30" },
  ];

  return (
    <div className="min-h-screen bg-[#000000] text-[#FFFFFF] selection:bg-[#FFFFFF] selection:text-[#000000]">
      {/* Top Bar Navigation */}
      <header className="border-b border-[#262626] bg-[#000000] sticky top-0 z-30">
        <div className="mx-auto flex h-20 max-w-5xl items-center justify-between px-6">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#262626] bg-[#111111] shadow-sm">
              <Crown className="h-5 w-5 text-[#FFFFFF]" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#FFFFFF]">
              MockMate
            </span>
          </Link>

          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-[#262626] bg-[#0A0A0A] px-4 py-2 text-sm font-semibold text-[#A1A1A1] transition hover:bg-[#1A1A1A] hover:text-[#FFFFFF]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Main Setup Container */}
      <main className="mx-auto w-full max-w-3xl px-6 py-12">
        {/* Step Indicator */}

        <div className="flex items-center justify-center gap-4 mt-6">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-400">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300">1</span>
            <span>01 Setup</span>
          </div>
          <div className="h-0.5 w-8 bg-[#262626]" />
          <div className="flex items-center gap-2 text-xs font-semibold text-[#737373]">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1A1A1A] border border-[#262626]">2</span>
            <span>02 Live AI Interview</span>
          </div>
          <div className="h-0.5 w-8 bg-[#262626]" />
          <div className="flex items-center gap-2 text-xs font-semibold text-[#737373]">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1A1A1A] border border-[#262626]">3</span>
            <span>03 AI Evaluation</span>
          </div>
        </div>

        <div className="text-center mt-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-xs font-bold text-purple-300 backdrop-blur-xl">
            <Sparkles className="h-3.5 w-3.5 fill-current" />
            Adaptive AI Interview Engine
          </div>

          <h1 className="mt-4 text-3xl font-extrabold text-[#FFFFFF] sm:text-4xl tracking-tight">
            Prepare Your AI Interview
          </h1>
          <p className="mt-2 text-sm text-[#A1A1A1] max-w-lg mx-auto">
            Configure your target role, difficulty, and resume context for a real-time adaptive technical evaluation.
          </p>
        </div>

        {/* Personalization Preview Banner */}
        <div className="mt-8 rounded-2xl border border-purple-500/20 bg-gradient-to-r from-purple-950/20 via-[#0A0A0A] to-pink-950/20 p-5 backdrop-blur-xl">
          <p className="text-xs font-bold uppercase tracking-wider text-purple-300 mb-2">
            ✨ Real-Time Personalization Preview
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-[#FAFAFA]">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-purple-400 shrink-0" />
              <span>Resume Projects</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-purple-400 shrink-0" />
              <span>Technical Skills</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-purple-400 shrink-0" />
              <span>Work Experience</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-purple-400 shrink-0" />
              <span>Adaptive Questioning</span>
            </div>
          </div>
        </div>

        <form onSubmit={openHardwareCheck} className="mt-8 space-y-8">

          {/* 1. TARGET ROLE & EXPERIENCE LEVEL */}
          <div className="rounded-2xl border border-[#262626] bg-[#111111] p-6 backdrop-blur-xl space-y-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#FFFFFF] mb-2">
                <Briefcase className="h-4 w-4 text-[#A1A1A1]" />
                1. Target Job Role
              </label>
              <p className="text-xs text-[#A1A1A1] mb-3">
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
                          ? "border-[#FFFFFF] bg-[#FFFFFF] text-[#000000]"
                          : "border-[#262626] bg-[#0A0A0A] text-[#A1A1A1] hover:border-white/20 hover:text-[#FFFFFF]"
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
                    className="w-full rounded-xl border border-[#262626] bg-[#0A0A0A] px-4 py-2.5 text-xs text-[#FFFFFF] placeholder:text-[#737373] focus:border-[#FFFFFF] focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* Experience Level */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#FFFFFF] mb-2">
                <UserCheck className="h-4 w-4 text-[#A1A1A1]" />
                Experience Level
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {experienceOptions.map((opt) => {
                  const isSelected = experienceLevel === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => setExperienceLevel(opt.id)}
                      className={`cursor-pointer rounded-xl border p-3.5 transition ${
                        isSelected
                          ? "border-[#FFFFFF] bg-[#1A1A1A]"
                          : "border-[#262626] bg-[#0A0A0A] hover:border-white/20"
                      }`}
                    >
                      <p className="text-xs font-bold text-[#FFFFFF]">{opt.label}</p>
                      <p className="mt-0.5 text-[10px] text-[#A1A1A1]">{opt.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 2. SELECT RESUME */}
          <div className="rounded-2xl border border-[#262626] bg-[#111111] p-6 backdrop-blur-xl">
            <label className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#FFFFFF] mb-2">
              <FileText className="h-4 w-4 text-[#A1A1A1]" />
              2. Candidate Resume Context
            </label>
            <p className="text-xs text-[#A1A1A1] mb-4">
              AI uses your actual projects, skills, and work history to ask personalized questions
            </p>

            {loadingResumes ? (
              <div className="flex items-center gap-2 py-4 text-sm text-[#A1A1A1]">
                <Loader2 className="h-4 w-4 animate-spin text-[#FFFFFF]" />
                Loading your uploaded resumes...
              </div>
            ) : resumes.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#F59E0B]/30 bg-[#F59E0B]/10 p-6 text-center">
                <p className="text-sm font-medium text-[#F59E0B]">
                  No resume uploaded in your account
                </p>
                <p className="mt-1 text-xs text-[#A1A1A1]">
                  Upload a PDF resume on your dashboard so AI can formulate questions based on your background.
                </p>
                <Link
                  to="/dashboard"
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#FFFFFF] px-4 py-2 text-xs font-semibold text-[#000000] shadow-sm transition hover:bg-[#F5F5F5]"
                >
                  Upload Resume in Dashboard
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {resumes.map((r) => {
                  const isSelected = selectedResumeId === r._id;
                  return (
                    <div
                      key={r._id}
                      onClick={() => setSelectedResumeId(r._id)}
                      className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition ${
                        isSelected
                          ? "border-[#FFFFFF] bg-[#1A1A1A]"
                          : "border-[#262626] bg-[#0A0A0A] hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-[#FFFFFF] shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-[#FFFFFF]">
                            {r.fileName}
                          </p>
                          <p className="text-xs text-[#737373]">
                            Uploaded {new Date(r.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {isSelected && (
                        <CheckCircle2 className="h-5 w-5 text-[#FFFFFF]" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. INTERVIEW TYPE & DIFFICULTY */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Interview Type */}
            <div className="rounded-2xl border border-[#262626] bg-[#111111] p-6 backdrop-blur-xl">
              <label className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#FFFFFF] mb-2">
                <Zap className="h-4 w-4 text-[#A1A1A1]" />
                3. Interview Type
              </label>
              <div className="grid grid-cols-1 gap-2.5 mt-3">
                {interviewTypeOptions.map((opt) => {
                  const isSelected = interviewType === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => setInterviewType(opt.id)}
                      className={`cursor-pointer rounded-xl border p-3 transition ${
                        isSelected
                          ? "border-[#FFFFFF] bg-[#1A1A1A]"
                          : "border-[#262626] bg-[#0A0A0A] hover:border-white/20"
                      }`}
                    >
                      <p className="text-xs font-bold text-[#FFFFFF]">{opt.label}</p>
                      <p className="text-[10px] text-[#A1A1A1]">{opt.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Difficulty & Questions */}
            <div className="rounded-2xl border border-[#262626] bg-[#111111] p-6 backdrop-blur-xl space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#FFFFFF] mb-2">
                  <Sliders className="h-4 w-4 text-[#A1A1A1]" />
                  4. Difficulty
                </label>
                <div className="flex gap-2 mt-3">
                  {difficultyOptions.map((opt) => {
                    const isSelected = difficulty === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setDifficulty(opt.id)}
                        className={`flex-1 rounded-xl border py-2.5 text-xs font-bold transition ${
                          isSelected
                            ? "border-[#FFFFFF] bg-[#FFFFFF] text-[#000000]"
                            : "border-[#262626] bg-[#0A0A0A] text-[#A1A1A1] hover:bg-[#1A1A1A] hover:text-[#FFFFFF]"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#FFFFFF] mb-2">
                  <HelpCircle className="h-4 w-4 text-[#A1A1A1]" />
                  Max Question Limit
                </label>
                <div className="flex items-center gap-3 mt-2">
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={numberOfQuestions}
                    onChange={(e) => setNumberOfQuestions(e.target.value)}
                    className="w-full rounded-xl border border-[#262626] bg-[#0A0A0A] px-4 py-2 text-xs font-bold text-[#FFFFFF] focus:border-[#FFFFFF] focus:outline-none"
                  />
                  <span className="text-xs font-medium text-[#A1A1A1] shrink-0">
                    Questions
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quota Exceeded Banner */}
          {quotaInfo?.quotaExceeded && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-5 text-xs font-semibold text-rose-300">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
                <div>
                  <p className="font-bold text-white">INTERVIEW LIMIT REACHED</p>
                  <p className="mt-0.5 text-[#A1A1A1]">
                    You have used all {quotaInfo.limit} {quotaInfo.plan === "FREE" ? "free " : ""}AI interviews. Upgrade your plan to continue.
                  </p>
                </div>
              </div>
              <Link
                to="/dashboard"
                className="shrink-0 rounded-xl bg-white px-4 py-2 text-xs font-bold text-black shadow-sm transition hover:bg-slate-200"
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

          {/* Submit Button -> Launches Hardware Check */}
          <button
            type="submit"
            disabled={submitting || resumes.length === 0 || quotaInfo?.quotaExceeded}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#FFFFFF] py-4 text-base font-bold text-[#000000] shadow-sm transition hover:bg-[#F5F5F5] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Camera className="h-5 w-5" />
            <span>Check Hardware & Start AI Interview</span>
          </button>

        </form>
      </main>

      {/* PRE-JOIN IDENTITY & INTEGRITY CHECK MODAL */}
      {showPrecheckModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000]/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-[#262626] bg-[#111111] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#262626] pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0A0A0A] border border-[rgba(139,92,246,0.3)]">
                  <Camera className="h-4 w-4 text-[#8B5CF6]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#FFFFFF]">Ready for your interview?</h3>
                  <p className="text-[11px] text-[#71717A]">Identity & integrity verification</p>
                </div>
              </div>
              <button
                type="button"
                onClick={closePrecheckModal}
                className="text-[#737373] hover:text-[#FFFFFF]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {loadingDescriptor ? (
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-[#8B5CF6]" />
                <p className="text-xs text-[#A1A1AA]">Loading your identity profile...</p>
              </div>
            ) : (
              <PreJoinCheck
                enrolledDescriptor={enrolledDescriptor}
                hasProfilePhoto={!!(user?.profileImage)}
                onProceed={handlePreJoinPassed}
                onCancel={closePrecheckModal}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}


export default AIInterviewSetup;

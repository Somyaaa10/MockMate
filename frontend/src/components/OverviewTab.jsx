import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  CheckCheck,
  CircleDashed,
  Clock,
  FileText,
  Lightbulb,
  Loader2,
  TrendingUp,
  Upload,
  User,
  Users,
  Zap,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config/config";
import ResumeAnalysisModal from "./ResumeAnalysisModal";
import { Alert, Card, CardHeader, Section } from "./dashboard/DashboardPrimitives";
import { cx } from "./dashboard/cx";
import StatCard, { PlanStatCard } from "./dashboard/StatCard";
import ProfileSummary from "./dashboard/ProfileSummary";
import ResumeCard from "./dashboard/ResumeCard";
import FeatureGrid from "./dashboard/FeatureCard";
import { normalizeFeatures } from "./dashboard/featureRegistry";

/* ------------------------------------------------------------------
   Helpers
   ------------------------------------------------------------------ */
const getHour = () => new Date().getHours();
const getGreeting = () => {
  const h = getHour();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

const formatShortDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - d) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

const capitalize = (str) => (str ? str.charAt(0).toUpperCase() + str.slice(1) : "");

const typeLabel = (type) => {
  switch (type) {
    case "technical":
      return "Technical";
    case "behavioral":
      return "Behavioral";
    case "hr":
      return "HR";
    case "mixed":
      return "Technical + Behavioral";
    default:
      return capitalize(type) || "Interview";
  }
};

const LEVEL_NAMES = [
  "Rookie",
  "Rising Star",
  "Contender",
  "Challenger",
  "Strategist",
  "Virtuoso",
  "Champion",
  "Grandmaster",
];

const scorePill = (score) =>
  score >= 80
    ? "border-[rgba(16,185,129,0.30)] bg-[rgba(16,185,129,0.10)] text-[#059669] dark:text-[#34D399]"
    : score >= 60
    ? "border-[rgba(168,85,247,0.30)] bg-[rgba(168,85,247,0.10)] text-[#9333EA] dark:text-[#C084FC]"
    : "border-[rgba(245,158,11,0.30)] bg-[rgba(245,158,11,0.10)] text-[#D97706] dark:text-[#FBBF24]";

/* ------------------------------------------------------------------
   Score trend — inline SVG line chart (real data only)
   ------------------------------------------------------------------ */
function ScoreLineChart({ series, bestScore }) {
  if (series.length === 1) {
    const score = Math.round(series[0].score);
    return (
      <div className="flex h-[104px] items-center justify-center rounded-xl border border-[var(--mm-border)] bg-[var(--mm-bg)]">
        <div className="flex flex-col items-center gap-1">
          <span className="font-display text-2xl font-bold text-[var(--mm-text)]">{score}%</span>
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[var(--mm-text-3)]">
            First session
          </span>
        </div>
      </div>
    );
  }

  const n = series.length;
  const W = 100;
  const H = 40;
  const PAD_Y = 4;

  const points = series.map((item, i) => {
    const x = n === 1 ? W / 2 : (i / (n - 1)) * W;
    const y = H - PAD_Y - (Math.min(Math.max(item.score, 0), 100) / 100) * (H - PAD_Y * 2);
    return { x, y, score: Math.round(item.score), date: item.date };
  });

  const avg = Math.round(series.reduce((sum, s) => sum + s.score, 0) / series.length);
  const avgY = H - PAD_Y - (avg / 100) * (H - PAD_Y * 2);
  const line = points.map((p) => `${p.x},${p.y}`).join(" ");
  const best = Math.round(bestScore);

  return (
    <div className="fade-in">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height: "104px" }}
        preserveAspectRatio="none"
        role="img"
        aria-label={`Score trend chart, average ${avg}%, best ${best}%`}
      >
        <defs>
          <linearGradient id="ipLineStroke" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F97316" />
            <stop offset="60%" stopColor="#FB923C" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>
        </defs>

        <polygon points={`${points[0].x},${H} ${line} ${points[n - 1].x},${H}`} fill="rgba(249,115,22,0.12)" />

        <line
          x1="0"
          x2={W}
          y1={avgY}
          y2={avgY}
          stroke="var(--mm-border)"
          strokeWidth="0.35"
          strokeDasharray="1.5 1.2"
        />
        <text x={W - 0.5} y={avgY - 0.9} fontSize="2.6" textAnchor="end" fill="var(--mm-text-3)">
          avg {avg}%
        </text>

        <polyline
          points={line}
          fill="none"
          stroke="url(#ipLineStroke)"
          strokeWidth="0.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        {points.map((p, i) => {
          const isBest = p.score === best;
          return (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r={isBest ? 1.6 : 1}
                fill={isBest ? "#EC4899" : "#F97316"}
                stroke="var(--mm-bg)"
                strokeWidth="0.5"
                vectorEffect="non-scaling-stroke"
              />
              {isBest && (
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="2.6"
                  fill="none"
                  stroke="#FF2FAE"
                  strokeWidth="0.25"
                  opacity="0.5"
                />
              )}
              <title>{`${p.date} — ${p.score}%`}</title>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------
   Main Component
   ------------------------------------------------------------------ */
function OverviewTab({ onSwitchTab }) {
  const { user, token } = useAuth();

  const [dashboardData, setDashboardData] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [recentInterviews, setRecentInterviews] = useState([]);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingResume, setDeletingResume] = useState(false);
  const [analyzingId, setAnalyzingId] = useState(null);
  const [activeAnalysisResume, setActiveAnalysisResume] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  const fileInputRef = useRef(null);

  /* ---------------- Data ---------------- */
  useEffect(() => {
    if (!token) return;

    const fetchDashboard = async () => {
      try {
        setLoadingDashboard(true);
        const res = await axios.get(`${API_BASE_URL}/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data?.data) setDashboardData(res.data.data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoadingDashboard(false);
      }
    };

    const fetchResumes = async () => {
      try {
        setLoadingResumes(true);
        const res = await axios.get(`${API_BASE_URL}/resumes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data?.data)
          setResumes(Array.isArray(res.data.data) ? res.data.data : []);
      } catch (err) {
        console.error("Resume fetch error:", err);
      } finally {
        setLoadingResumes(false);
      }
    };

    const fetchInterviews = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/interviews`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const all = Array.isArray(res.data?.data) ? res.data.data : [];
        setRecentInterviews(all.filter((i) => i.status === "completed").slice(0, 8));
      } catch (err) {
        console.error("Interviews fetch error:", err);
      }
    };

    fetchDashboard();
    fetchResumes();
    fetchInterviews();
  }, [token]);

  /* ---------------- Resume upload ---------------- */
  const uploadFile = async (file) => {
    if (!file || !token) return;
    setUploadSuccess(null);
    setUploadError(null);

    const isPdf =
      file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setUploadError("Only PDF files are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Resume must be smaller than 5 MB.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);
    setUploading(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/resumes/upload`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.data) {
        setResumes((prev) => [res.data.data, ...prev]);
        setUploadSuccess("Resume uploaded successfully!");
      }
    } catch (err) {
      setUploadError(
        err.response?.data?.message || "Resume upload failed. Please try again."
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFileUpload = (e) => {
    uploadFile(e.target.files?.[0]);
  };

  const handleDeleteResume = async () => {
    if (!token || !primaryResume?._id) return;
    try {
      setDeletingResume(true);
      await axios.delete(`${API_BASE_URL}/resumes/${primaryResume._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResumes((prev) => prev.filter((r) => r._id !== primaryResume._id));
      setActiveAnalysisResume(null);
      setUploadSuccess("Resume deleted.");
    } catch {
      setUploadError("Could not delete the resume. Please try again.");
    } finally {
      setDeletingResume(false);
    }
  };

  /* ---------------- Resume analysis ---------------- */
  const handleAnalyzeResume = async (resumeId) => {
    if (!token || !resumeId) return;
    const existing = resumes.find((r) => r._id === resumeId);
    if (existing?.analyzedAt) {
      setActiveAnalysisResume(existing);
      return;
    }
    setAnalyzingId(resumeId);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/resumes/${resumeId}/analyze`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updated = res.data?.data;
      if (updated) {
        setResumes((prev) => prev.map((r) => (r._id === resumeId ? updated : r)));
        setActiveAnalysisResume(updated);
      }
    } catch (err) {
      console.error("Analysis error:", err);
      setUploadError("Analysis failed. Please try again.");
    } finally {
      setAnalyzingId(null);
    }
  };

  /* ---------------- Derived stats (all from real API data) ---------------- */
  const completedInterviews = dashboardData?.completedInterviews ?? 0;
  const inProgressInterviews = dashboardData?.inProgressInterviews ?? 0;
  const averageScore = dashboardData?.averageScore ?? 0;
  const bestScore = dashboardData?.bestScore ?? 0;
  const aiUsed = dashboardData?.aiInterviewsUsed ?? 0;
  const aiLimit = dashboardData?.aiInterviewsLimit ?? 0;
  const firstName = user?.fullName ? user.fullName.split(" ")[0] : "there";
  const hasResume = resumes.length > 0;
  const primaryResume = resumes[0];
  const resumeAnalyzed = Boolean(primaryResume?.analyzedAt);
  const isPremium = Boolean(user?.isPremium || dashboardData?.isPremium);
  const planName = dashboardData?.plan || (isPremium ? "PRO" : "FREE");

  const level = Math.min(Math.floor(completedInterviews / 5) + 1, LEVEL_NAMES.length);
  const levelName = LEVEL_NAMES[level - 1];

  const profileFields = [user?.fullName, user?.email, user?.mobile, user?.designation];
  const profileComplete = profileFields.every(Boolean);

  const features = normalizeFeatures();
  const featureCount = features.length;

  const FREE_LIMIT = 2;
  const quotaLimit = aiLimit > 0 ? aiLimit : FREE_LIMIT;
  const quotaUsed = Math.min(aiUsed, quotaLimit);
  const quotaRemaining = Math.max(quotaLimit - quotaUsed, 0);
  const quotaExhausted = !isPremium && quotaRemaining <= 0;
  const quotaPct = Math.round((quotaUsed / quotaLimit) * 100);
  const quotaMessage = isPremium
    ? "Unlimited AI interviews with your Pro plan"
    : quotaRemaining === 0
    ? "0 interviews remaining"
    : quotaRemaining === 1
    ? "1 interview remaining"
    : `${quotaRemaining} interviews remaining`;

  /* ---------------- Recommended next step ----------------
     Plain descriptor only — the action is resolved in the click
     handler so no ref is captured during render. */
  const recommendation = (() => {
    if (hasResume && !resumeAnalyzed) {
      return {
        key: "analyze",
        title: "Analyze your resume",
        desc: "Analyze your resume before starting a personalized interview.",
        cta: "Analyze Resume",
        Icon: CheckCircle2,
        pending: analyzingId === primaryResume?._id,
      };
    }
    if (!hasResume) {
      return {
        key: "upload",
        title: "Add your resume",
        desc: "Upload your resume to unlock personalized, role-specific questions.",
        cta: "Upload Resume",
        Icon: Upload,
        pending: false,
      };
    }
    if (completedInterviews === 0) {
      return {
        key: "start",
        title: "Complete your first AI interview",
        desc: "Complete your first AI interview to unlock your performance report.",
        cta: "Start AI Interview",
        Icon: Bot,
        pending: false,
      };
    }
    return {
      key: "report",
      title: "Your performance report is ready",
      desc: "Review your strengths and areas for improvement from your latest session.",
      cta: "View Report",
      Icon: CheckCircle2,
      pending: false,
    };
  })();

  /* Resolved outside render so the file input ref is only touched
     from an event handler. */
  const handleRecommendation = () => {
    switch (recommendation.key) {
      case "analyze":
        return handleAnalyzeResume(primaryResume?._id);
      case "upload":
        return fileInputRef.current?.click();
      case "start":
        return onSwitchTab("interview");
      default:
        return onSwitchTab("reports");
    }
  };

  const trendSeries = [...recentInterviews]
    .reverse()
    .map((interview) => ({
      score: interview.overallScore ?? 0,
      date: formatShortDate(interview.createdAt),
    }));

  /* ==================================================================
     Render
     ================================================================== */
  return (
    <div className="space-y-8">
      {/* Hidden file input — drives the "Upload Resume" quick action */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".pdf,application/pdf"
        className="hidden"
        aria-label="Upload resume PDF"
      />

      {/* Upload feedback */}
      {uploadSuccess && (
        <Alert tone="success" onDismiss={() => setUploadSuccess(null)}>
          {uploadSuccess}
        </Alert>
      )}


      {/* ── 1. Statistic cards ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <PlanStatCard
          planName={planName}
          isPremium={isPremium}
          loading={loadingDashboard}
        />
        <StatCard
          icon={CheckCircle2}
          label="Features"
          value={featureCount}
          tone="blue"
        />
        <StatCard
          icon={FileText}
          label="Resume Status"
          value={loadingResumes ? "—" : resumeAnalyzed ? "Analysed" : hasResume ? "Uploaded" : "None"}
          tone="green"
          loading={loadingResumes}
        />
        <StatCard
          icon={User}
          label="Profile"
          value={profileComplete ? "Complete" : "Incomplete"}
          tone="pink"
        />
      </div>

      {/* ── 2. Profile + Resume ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <ProfileSummary
            user={user}
            action={
              <button
                type="button"
                onClick={() => onSwitchTab("profile")}
                className="mm-btn mm-btn-quiet shrink-0 px-3 py-1.5 text-[12px]"
              >
                Edit
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </button>
            }
          />
        </div>

        <div className="lg:col-span-5">
          <ResumeCard
            resume={primaryResume}
            loading={loadingResumes}
            uploading={uploading || deletingResume}
            analyzing={analyzingId === primaryResume?._id}
            analyzed={resumeAnalyzed}
            error={uploadError}
            onSelectFile={uploadFile}
            onAnalyze={() => handleAnalyzeResume(primaryResume?._id)}
            onViewAnalysis={() => handleAnalyzeResume(primaryResume?._id)}
            onDelete={hasResume ? handleDeleteResume : undefined}
          />
        </div>
      </div>

      {/* ── 3. Available Features ── */}
      <Section
        id="features"
        title="Available Features"
        action={
          <button
            type="button"
            onClick={() => onSwitchTab("plan")}
            className="mm-btn mm-btn-quiet shrink-0 px-3 py-1.5 text-[12px]"
          >
            View plan
            <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </button>
        }
      >
        <FeatureGrid
          features={features.map((f) =>
            f.feature === "AI_INTERVIEW"
              ? { ...f, quota: isPremium ? null : quotaLimit, used: quotaUsed }
              : f
          )}
          onSelect={(href) => {
            if (href === "/peer/setup") onSwitchTab("peer");
            else window.location.assign(href);
          }}
        />
      </Section>




      {/* Resume analysis modal */}
      {activeAnalysisResume && (
        <ResumeAnalysisModal
          resume={activeAnalysisResume}
          onClose={() => setActiveAnalysisResume(null)}
        />
      )}
    </div>
  );
}

export default OverviewTab;

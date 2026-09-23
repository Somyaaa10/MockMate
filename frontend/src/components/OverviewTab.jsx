import { useEffect, useState, useRef } from "react";
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Bot,
  Users,
  ArrowRight,
  Loader2,
  Clock,
  TrendingUp,
  Sparkles,
  CheckCheck,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config/config";
import ResumeAnalysisModal from "./ResumeAnalysisModal";

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

const formatRelativeDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - d) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

/* ------------------------------------------------------------------
   Stat Card
   ------------------------------------------------------------------ */
function StatCard({ label, value, sub, highlight }) {
  return (
    <div className="saas-card rounded-2xl p-5 space-y-2">
      <span className="text-[11px] font-medium text-[#71717A] block">{label}</span>
      <div
        className={`text-2xl sm:text-3xl font-bold font-mono tracking-tight ${
          highlight ? "text-[#C4B5FD]" : "text-[#F5F5F5]"
        }`}
      >
        {value}
      </div>
      {sub && <span className="text-[11px] text-[#A1A1AA]">{sub}</span>}
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
  const [analyzingId, setAnalyzingId] = useState(null);
  const [activeAnalysisResume, setActiveAnalysisResume] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  const fileInputRef = useRef(null);

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
        const completed = all
          .filter((i) => i.status === "completed")
          .slice(0, 3);
        setRecentInterviews(completed);
      } catch (err) {
        console.error("Interviews fetch error:", err);
      }
    };

    fetchDashboard();
    fetchResumes();
    fetchInterviews();
  }, [token]);

  /* Resume Upload */
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    setUploadSuccess(null);
    setUploadError(null);

    const isPdf =
      file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setUploadError("Only PDF files are allowed.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Resume must be smaller than 5 MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
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

  /* Resume Analysis */
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
    } finally {
      setAnalyzingId(null);
    }
  };

  /* Stats */
  const completedInterviews = dashboardData?.completedInterviews ?? 0;
  const averageScore = dashboardData?.averageScore ?? 0;
  const bestScore = dashboardData?.bestScore ?? 0;
  const practiceHours = (completedInterviews * 0.35).toFixed(1);
  const firstName = user?.fullName ? user.fullName.split(" ")[0] : "there";
  const hasResume = resumes.length > 0;
  const primaryResume = resumes[0];

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".pdf,application/pdf"
        className="hidden"
        aria-label="Upload resume PDF"
      />

      {/* ── 1. WELCOME ── */}
      <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#0A0A0A] p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <p className="text-[13px] text-[#71717A] font-medium">
              {getGreeting()} 👋
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F5F5] tracking-tight">
              {firstName}, ready to practice?
            </h1>
            <p className="text-sm text-[#A1A1AA] max-w-md">
              Sharpen your interview skills with AI-powered mock interviews and
              real-time feedback.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onSwitchTab("interview")}
              className="btn-primary inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold"
            >
              <Bot className="h-4 w-4" />
              <span>Start AI Interview</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="btn-secondary inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium disabled:opacity-60"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin text-[#8B5CF6]" />
              ) : (
                <Upload className="h-4 w-4 text-[#8B5CF6]" />
              )}
              <span>{uploading ? "Uploading..." : "Upload Resume"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Upload Messages */}
      {uploadSuccess && (
        <div className="flex items-center justify-between rounded-xl border border-[#22C55E]/20 bg-[#22C55E]/08 px-4 py-3 text-[13px] font-medium text-[#22C55E]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            <span>{uploadSuccess}</span>
          </div>
          <button onClick={() => setUploadSuccess(null)} className="text-[#22C55E]/60 hover:text-[#22C55E] ml-4">
            <span className="sr-only">Dismiss</span>✕
          </button>
        </div>
      )}
      {uploadError && (
        <div className="flex items-center justify-between rounded-xl border border-[#EF4444]/20 bg-[#EF4444]/08 px-4 py-3 text-[13px] font-medium text-[#EF4444]">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{uploadError}</span>
          </div>
          <button onClick={() => setUploadError(null)} className="text-[#EF4444]/60 hover:text-[#EF4444] ml-4">
            <span className="sr-only">Dismiss</span>✕
          </button>
        </div>
      )}

      {/* ── 2. PROGRESS ── */}
      <div className="space-y-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-[#71717A]">
          Your Progress
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            label="Interviews"
            value={loadingDashboard ? "—" : completedInterviews}
            sub="Completed sessions"
          />
          <StatCard
            label="Average Score"
            value={loadingDashboard ? "—" : `${averageScore}%`}
            sub="Overall accuracy"
            highlight
          />
          <StatCard
            label="Best Score"
            value={loadingDashboard ? "—" : `${bestScore}%`}
            sub="Personal best"
          />
          <StatCard
            label="Practice Time"
            value={loadingDashboard ? "—" : `${practiceHours}h`}
            sub="Hours practiced"
          />
        </div>
      </div>

      {/* ── 3. QUICK ACTIONS ── */}
      <div className="space-y-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-[#71717A]">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* AI Interview */}
          <div className="saas-card saas-card-interactive rounded-2xl p-5 flex flex-col gap-4 transition-all duration-150 cursor-pointer"
               onClick={() => onSwitchTab("interview")}>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[rgba(139,92,246,0.12)]">
                    <Bot className="h-4 w-4 text-[#8B5CF6]" />
                  </div>
                  <h3 className="text-[15px] font-semibold text-[#F5F5F5]">AI Interview</h3>
                </div>
                <p className="text-[13px] text-[#A1A1AA] leading-relaxed">
                  Practice with an adaptive AI interviewer tailored to your target role.
                </p>
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onSwitchTab("interview"); }}
              className="btn-primary inline-flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-semibold"
            >
              <span>Start Interview</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Peer Practice */}
          <div className="saas-card saas-card-interactive rounded-2xl p-5 flex flex-col gap-4 transition-all duration-150 cursor-pointer"
               onClick={() => onSwitchTab("peer")}>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[rgba(255,255,255,0.06)]">
                    <Users className="h-4 w-4 text-[#A1A1AA]" />
                  </div>
                  <h3 className="text-[15px] font-semibold text-[#F5F5F5]">Peer Practice</h3>
                </div>
                <p className="text-[13px] text-[#A1A1AA] leading-relaxed">
                  Practice 1:1 with another candidate in a private video room.
                </p>
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onSwitchTab("peer"); }}
              className="btn-secondary inline-flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-semibold"
            >
              <span>Find a Partner</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── 4. RECENT INTERVIEWS ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-[#71717A]">
            Recent Interviews
          </h2>
          {recentInterviews.length > 0 && (
            <button
              onClick={() => onSwitchTab("reports")}
              className="text-[12px] text-[#8B5CF6] hover:text-[#A78BFA] font-medium transition-colors"
            >
              View all →
            </button>
          )}
        </div>

        {recentInterviews.length === 0 ? (
          <div className="saas-card rounded-2xl p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#151515] border border-[rgba(255,255,255,0.07)] mb-3">
              <Clock className="h-5 w-5 text-[#71717A]" />
            </div>
            <p className="text-[14px] font-semibold text-[#F5F5F5]">No interviews yet</p>
            <p className="text-[13px] text-[#71717A] mt-1 mb-4">
              Complete your first AI interview to see your performance here.
            </p>
            <button
              onClick={() => onSwitchTab("interview")}
              className="btn-primary inline-flex items-center gap-2 rounded-xl px-5 py-2 text-[13px] font-semibold"
            >
              <Bot className="h-3.5 w-3.5" />
              Start Interview
            </button>
          </div>
        ) : (
          <div className="saas-card rounded-2xl divide-y divide-[rgba(255,255,255,0.06)]">
            {recentInterviews.map((interview) => {
              const score = interview.overallScore ?? null;
              const role = capitalize(interview.targetRole || interview.role || "Interview");
              const level = capitalize(interview.experienceLevel || interview.level || "");
              return (
                <div
                  key={interview._id}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[rgba(139,92,246,0.10)]">
                      <Bot className="h-3.5 w-3.5 text-[#8B5CF6]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-[#F5F5F5] truncate">
                        {role}{level ? ` · ${level}` : ""}
                      </p>
                      <p className="text-[11px] text-[#71717A] flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3" />
                        {formatRelativeDate(interview.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {score !== null && (
                      <span
                        className={`text-[13px] font-bold font-mono ${
                          score >= 80
                            ? "text-[#22C55E]"
                            : score >= 60
                            ? "text-[#F5F5F5]"
                            : "text-[#F59E0B]"
                        }`}
                      >
                        {score}%
                      </span>
                    )}
                    <CheckCheck className="h-3.5 w-3.5 text-[#22C55E]" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── 5. RESUME REMINDER ── */}
      {!loadingResumes && (
        <div className="saas-card rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border ${
                hasResume
                  ? "bg-[rgba(34,197,94,0.08)] border-[rgba(34,197,94,0.20)] text-[#22C55E]"
                  : "bg-[#151515] border-[rgba(255,255,255,0.07)] text-[#71717A]"
              }`}
            >
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[#F5F5F5]">
                {hasResume ? (
                  <span className="flex items-center gap-1.5">
                    Resume Ready
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#22C55E]" />
                  </span>
                ) : (
                  "Add your resume"
                )}
              </p>
              <p className="text-[12px] text-[#71717A] mt-0.5">
                {hasResume
                  ? `${primaryResume?.originalName || primaryResume?.fileName || "Resume.pdf"} — used for personalized questions`
                  : "Upload your resume to get personalized interview questions."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {hasResume && (
              <button
                onClick={() => handleAnalyzeResume(primaryResume._id)}
                disabled={analyzingId === primaryResume?._id}
                className="btn-secondary inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-medium disabled:opacity-60"
              >
                {analyzingId === primaryResume?._id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5 text-[#8B5CF6]" />
                )}
                <span>{analyzingId === primaryResume?._id ? "Analyzing..." : "Analyze"}</span>
              </button>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="btn-secondary inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-medium disabled:opacity-60"
            >
              <Upload className="h-3.5 w-3.5 text-[#8B5CF6]" />
              <span>{hasResume ? "Replace" : "Upload Resume"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Resume Analysis Modal */}
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

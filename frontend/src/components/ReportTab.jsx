import { useEffect, useState } from "react";
import {
  Award,
  CheckCircle,
  AlertTriangle,
  Loader2,
  AlertCircle,
  PlayCircle,
  Bot,
  Clock,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config/config";
import ReportQuestionCard from "./ReportQuestionCard";

const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

/* ------------------------------------------------------------------
   Score Metric
   ------------------------------------------------------------------ */
function ScoreMetric({ label, value }) {
  const pct = typeof value === "number" ? value : null;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-medium text-[#A1A1AA]">{label}</span>
        <span className="text-[13px] font-bold text-[#F5F5F5] font-mono">
          {pct !== null ? `${pct}%` : "N/A"}
        </span>
      </div>
      <div className="progress-bar">
        <div
          className="progress-bar-fill"
          style={{ width: pct !== null ? `${pct}%` : "0%" }}
        />
      </div>
    </div>
  );
}

function ReportTab() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [completedInterviews, setCompletedInterviews] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState(null);

  const [selectedReportId, setSelectedReportId] = useState(null);
  const [reportDetail, setReportDetail] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [reportError, setReportError] = useState(null);

  useEffect(() => {
    if (!token) return;
    const fetchList = async () => {
      try {
        setLoadingList(true);
        setListError(null);
        const res = await axios.get(`${API_BASE_URL}/interviews`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const all = Array.isArray(res.data?.data) ? res.data.data : [];
        const completed = all.filter((i) => i.status === "completed");
        setCompletedInterviews(completed);
        if (completed.length > 0) setSelectedReportId(completed[0]._id);
      } catch (err) {
        setListError(err.response?.data?.message || "Unable to load reports. Please try again.");
      } finally {
        setLoadingList(false);
      }
    };
    fetchList();
  }, [token]);

  useEffect(() => {
    if (!token || !selectedReportId) return;
    const fetchDetail = async () => {
      try {
        setLoadingReport(true);
        setReportError(null);
        const res = await axios.get(
          `${API_BASE_URL}/interviews/${selectedReportId}/report`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data?.data) setReportDetail(res.data.data);
      } catch (err) {
        setReportError(err.response?.data?.message || "Failed to load report detail.");
      } finally {
        setLoadingReport(false);
      }
    };
    fetchDetail();
  }, [token, selectedReportId]);

  if (loadingList) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-[#8B5CF6]" />
      </div>
    );
  }

  if (listError) {
    return (
      <div className="saas-card rounded-2xl p-6 text-center max-w-md mx-auto">
        <AlertCircle className="mx-auto h-8 w-8 text-[#EF4444] mb-3" />
        <p className="text-[14px] font-semibold text-[#F5F5F5]">Error loading reports</p>
        <p className="text-[12px] text-[#EF4444] mt-1">{listError}</p>
      </div>
    );
  }

  /* Empty State */
  if (completedInterviews.length === 0) {
    return (
      <div className="space-y-4 max-w-3xl mx-auto">
        <div>
          <h1 className="text-xl font-bold text-[#F5F5F5]">Reports</h1>
          <p className="text-[13px] text-[#A1A1AA] mt-0.5">
            Track your interview performance and identify areas to improve.
          </p>
        </div>
        <div className="saas-card rounded-2xl p-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-[rgba(255,255,255,0.07)] bg-[#151515] mb-4">
            <Award className="h-5 w-5 text-[#71717A]" />
          </div>
          <p className="text-[14px] font-semibold text-[#F5F5F5]">No performance reports yet</p>
          <p className="text-[13px] text-[#71717A] mt-1 mb-5 max-w-xs mx-auto">
            Complete an AI interview to generate your first evaluation report.
          </p>
          <button
            onClick={() => navigate("/interview/new")}
            className="btn-primary inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-semibold"
          >
            <PlayCircle className="h-4 w-4" />
            Start AI Interview
          </button>
        </div>
      </div>
    );
  }

  const selectedInterview = completedInterviews.find((i) => i._id === selectedReportId);
  const overallScore = reportDetail?.overallScore ?? null;
  const technicalScore = reportDetail?.technicalScore ?? null;
  const commScore = reportDetail?.communicationScore ?? null;
  const problemScore = reportDetail?.problemSolvingScore ?? null;
  const strengths = reportDetail?.strengths ?? [];
  const weaknesses = reportDetail?.weaknesses ?? [];
  const questions = reportDetail?.questions ?? [];

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#F5F5F5]">Reports</h1>
        <p className="text-[13px] text-[#A1A1AA] mt-0.5">
          Track your interview performance and identify areas to improve.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ── LEFT: Interview List ── */}
        <div className="lg:w-72 flex-shrink-0 space-y-2">
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-[#71717A]">
            Completed Interviews
          </h2>
          <div className="saas-card rounded-2xl overflow-hidden divide-y divide-[rgba(255,255,255,0.06)]">
            {completedInterviews.map((item) => {
              const isSelected = item._id === selectedReportId;
              const score = item.overallScore ?? null;
              return (
                <button
                  key={item._id}
                  onClick={() => setSelectedReportId(item._id)}
                  className={`w-full flex items-center justify-between px-4 py-3.5 text-left transition-colors ${
                    isSelected
                      ? "bg-[rgba(139,92,246,0.10)]"
                      : "hover:bg-[rgba(255,255,255,0.03)]"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className={`text-[12px] font-semibold truncate ${isSelected ? "text-[#C4B5FD]" : "text-[#F5F5F5]"}`}>
                      {capitalize(item.targetRole || item.role || "Interview")}
                    </p>
                    <p className="text-[11px] text-[#71717A] flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3" />
                      {formatDate(item.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    {score !== null && (
                      <span className={`text-[12px] font-bold font-mono ${score >= 80 ? "text-[#22C55E]" : score >= 60 ? "text-[#F5F5F5]" : "text-[#F59E0B]"}`}>
                        {score}%
                      </span>
                    )}
                    {isSelected && <ChevronRight className="h-3.5 w-3.5 text-[#8B5CF6]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── RIGHT: Report Detail ── */}
        <div className="flex-1 min-w-0">
          {loadingReport ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-[#8B5CF6]" />
            </div>
          ) : reportError ? (
            <div className="saas-card rounded-2xl p-6 text-center">
              <AlertCircle className="mx-auto h-6 w-6 text-[#EF4444] mb-2" />
              <p className="text-[12px] text-[#EF4444]">{reportError}</p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Score Header */}
              {selectedInterview && (
                <div className="saas-card rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <p className="text-[16px] font-bold text-[#F5F5F5]">
                        {capitalize(selectedInterview.targetRole || selectedInterview.role || "Interview")}
                      </p>
                      <p className="text-[12px] text-[#71717A] mt-0.5">
                        {capitalize(selectedInterview.experienceLevel || selectedInterview.level || "")}
                        {" · "}
                        {capitalize(selectedInterview.interviewType || "")}
                        {" · "}
                        {formatDate(selectedInterview.createdAt)}
                      </p>
                    </div>
                    {overallScore !== null && (
                      <div className="text-right">
                        <p className="text-3xl font-bold text-[#F5F5F5] font-mono">
                          {overallScore}%
                        </p>
                        <p className="text-[11px] text-[#71717A]">Overall Score</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Performance Breakdown */}
              <div className="saas-card rounded-2xl p-5 space-y-4">
                <h3 className="text-[12px] font-semibold text-[#F5F5F5]">Performance</h3>
                <ScoreMetric label="Technical Skills" value={technicalScore} />
                <ScoreMetric label="Communication" value={commScore} />
                <ScoreMetric label="Problem Solving" value={problemScore} />
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="saas-card rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-[#22C55E]" />
                    <h3 className="text-[12px] font-semibold text-[#F5F5F5]">Key Strengths</h3>
                  </div>
                  <ul className="space-y-1.5">
                    {strengths.length > 0 ? (
                      strengths.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-[12px] text-[#A1A1AA]">
                          <span className="text-[#22C55E] mt-0.5 flex-shrink-0">•</span>
                          <span>{item}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-[12px] text-[#71717A]">Solid performance overall.</li>
                    )}
                  </ul>
                </div>

                <div className="saas-card rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-[#F59E0B]" />
                    <h3 className="text-[12px] font-semibold text-[#F5F5F5]">Areas to Improve</h3>
                  </div>
                  <ul className="space-y-1.5">
                    {weaknesses.length > 0 ? (
                      weaknesses.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-[12px] text-[#A1A1AA]">
                          <span className="text-[#F59E0B] mt-0.5 flex-shrink-0">•</span>
                          <span>{item}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-[12px] text-[#71717A]">No major weak areas detected.</li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Question Breakdown */}
              {questions.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[#71717A]">
                    Question Analysis
                  </h3>
                  <div className="space-y-3">
                    {questions.map((q, i) => (
                      <ReportQuestionCard key={i} questionData={q} index={i} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReportTab;

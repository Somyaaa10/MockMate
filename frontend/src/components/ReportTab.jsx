import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Award,
  CheckCircle,
  Clock,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config/config";
import ReportQuestionCard from "./ReportQuestionCard";
import { Alert, Card, CardHeader, Skeleton } from "./dashboard/DashboardPrimitives";
import { cx } from "./dashboard/cx";
import EmptyReports from "./dashboard/EmptyReports";

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const capitalize = (str) => (str ? str.charAt(0).toUpperCase() + str.slice(1) : "");

const scoreTone = (score) => {
  if (score == null) return "var(--status-warning)";
  if (score >= 80) return "var(--status-success)";
  if (score >= 60) return "var(--accent-orange)";
  return "var(--status-warning)";
};

/* ------------------------------------------------------------------
   Score metric with a gradient meter
   ------------------------------------------------------------------ */
function ScoreMetric({ label, value }) {
  const pct = typeof value === "number" ? Math.max(0, Math.min(100, value)) : null;

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-[12px] font-medium text-[var(--mm-text-2)]">{label}</span>
        <span
          className="font-mono text-[13px] font-bold"
          style={{ color: scoreTone(pct) }}
        >
          {pct !== null ? `${Math.round(pct)}%` : "N/A"}
        </span>
      </div>
      <div className="mm-meter mt-2">
        {pct !== null && (
          <div
            className="mm-meter-fill"
            style={{
              width: `${pct}%`,
              backgroundImage:
                pct >= 60
                  ? "var(--mm-grad)"
                  : "linear-gradient(90deg,#F59E0B,#EA580C)",
            }}
          />
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------
   Interview list card
   ------------------------------------------------------------------ */
function ReportListCard({ interview, selected, onSelect }) {
  const score = interview.overallScore ?? null;
  const role = capitalize(interview.targetRole || interview.role || "Interview");
  const type = capitalize(interview.interviewType || "Interview");

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cx(
        "mm-card mm-card-hover flex w-full flex-col p-4 text-left",
        selected && "!border-[rgba(168,85,247,0.45)]"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className="mm-icon-tile h-9 w-9 shrink-0"
            style={{
              color: "var(--mm-purple)",
              backgroundColor: "rgba(168,85,247,0.12)",
              borderColor: "rgba(168,85,247,0.28)",
            }}
            aria-hidden="true"
          >
            <Award className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-bold text-[var(--mm-text)]">{role}</p>
            <p className="mt-0.5 truncate text-[11px] text-[var(--mm-text-3)]">
              {type} · {formatDate(interview.createdAt)}
            </p>
          </div>
        </div>

        <span
          className="shrink-0 font-display text-[18px] font-bold leading-none"
          style={{ color: scoreTone(score) }}
        >
          {score != null ? `${Math.round(score)}%` : "—"}
        </span>
      </div>

      {selected && (
        <p className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-[#C084FC]">
          <TrendingUp className="h-3 w-3" aria-hidden="true" />
          Viewing this report
        </p>
      )}
    </button>
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
        const completed = all.filter(
          (i) =>
            i.status === "completed" ||
            (i.questions && i.questions.some((q) => q.answer)) ||
            (i.conversationHistory && i.conversationHistory.length > 1)
        );
        setCompletedInterviews(completed);
        if (completed.length > 0) setSelectedReportId(completed[0]._id);
      } catch {
        setListError("Unable to load reports. Please try again.");
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
      } catch {
        setReportError("Failed to load report detail.");
      } finally {
        setLoadingReport(false);
      }
    };
    fetchDetail();
  }, [token, selectedReportId]);

  /* ---------------- Loading skeleton ---------------- */
  if (loadingList) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center gap-2.5">
                <Skeleton className="h-9 w-9 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </Card>
          ))}
        </div>
        <Card className="p-5">
          <Skeleton className="h-5 w-44" />
          <div className="mt-5 space-y-4">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </Card>
      </div>
    );
  }

  /* ---------------- Error ---------------- */
  if (listError) {
    return (
      <div className="mx-auto max-w-md">
        <Alert tone="error">{listError}</Alert>
      </div>
    );
  }

  /* ---------------- Empty state ---------------- */
  if (completedInterviews.length === 0) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <div>
          <h1 className="font-display text-[24px] font-bold tracking-tight text-[var(--mm-text)] sm:text-[28px]">
            Reports
          </h1>
          <p className="mt-1.5 text-[13.5px] text-[var(--mm-text-2)]">
            Track your interview performance and identify areas to improve.
          </p>
        </div>

        <EmptyReports onAction={() => navigate("/interview/new")} />
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-[24px] font-bold tracking-tight text-[var(--mm-text)] sm:text-[28px]">
            Reports
          </h1>
          <p className="mt-1.5 text-[13.5px] text-[var(--mm-text-2)]">
            Track your interview performance and identify areas to improve.
          </p>
        </div>
        <span className="mm-badge shrink-0">
          {completedInterviews.length}{" "}
          {completedInterviews.length === 1 ? "report" : "reports"}
        </span>
      </div>

      {/* ── Report cards ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {completedInterviews.map((item) => (
          <ReportListCard
            key={item._id}
            interview={item}
            selected={item._id === selectedReportId}
            onSelect={() => setSelectedReportId(item._id)}
          />
        ))}
      </div>

      {/* ── Report detail ── */}
      {loadingReport ? (
        <Card className="space-y-5 p-5 sm:p-6">
          <Skeleton className="h-5 w-52" />
          <Skeleton className="h-3 w-36" />
          <div className="space-y-4 border-t border-[var(--mm-border)] pt-5">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </Card>
      ) : reportError ? (
        <Alert tone="error">{reportError}</Alert>
      ) : (
        <div className="space-y-4">
          {/* Score header */}
          {selectedInterview && (
            <Card className="p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="font-display truncate text-[18px] font-bold tracking-tight text-[var(--mm-text)]">
                    {capitalize(
                      selectedInterview.targetRole ||
                        selectedInterview.role ||
                        "Interview"
                    )}
                  </p>
                  <p className="mt-1 flex flex-wrap items-center gap-x-2 text-[12px] text-[var(--mm-text-3)]">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      {formatDate(selectedInterview.createdAt)}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      {capitalize(selectedInterview.interviewType || "Interview")}
                    </span>
                    {selectedInterview.experienceLevel && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{capitalize(selectedInterview.experienceLevel)}</span>
                      </>
                    )}
                  </p>
                </div>

                {overallScore !== null && (
                  <div className="shrink-0 text-left sm:text-right">
                    <p
                      className="font-display text-[34px] font-bold leading-none tracking-tight"
                      style={{ color: scoreTone(overallScore) }}
                    >
                      {Math.round(overallScore)}%
                    </p>
                    <p className="mt-1.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[var(--mm-text-3)]">
                      Overall Score
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Performance breakdown */}
          <Card className="space-y-4 p-5 sm:p-6">
            <CardHeader
              icon={TrendingUp}
              title="Performance"
              subtitle="Score breakdown by competency"
            />
            <div className="space-y-4 pt-1">
              <ScoreMetric label="Technical Skills" value={technicalScore} />
              <ScoreMetric label="Communication" value={commScore} />
              <ScoreMetric label="Problem Solving" value={problemScore} />
            </div>
          </Card>

          {/* Strengths & weaknesses */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card className="p-5">
              <CardHeader
                icon={CheckCircle}
                accent="#34D399"
                title="Key Strengths"
                subtitle="What you did well"
              />
              <ul className="mt-4 space-y-2">
                {strengths.length > 0 ? (
                  strengths.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 text-[12.5px] leading-relaxed text-[var(--mm-text-2)]"
                    >
                      <span
                        className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: "#34D399" }}
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-[12.5px] text-[var(--mm-text-3)]">
                    Solid performance overall.
                  </li>
                )}
              </ul>
            </Card>

            <Card className="p-5">
              <CardHeader
                icon={AlertTriangle}
                accent="#FBBF24"
                title="Areas to Improve"
                subtitle="Where to focus next"
              />
              <ul className="mt-4 space-y-2">
                {weaknesses.length > 0 ? (
                  weaknesses.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 text-[12.5px] leading-relaxed text-[var(--mm-text-2)]"
                    >
                      <span
                        className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: "#FBBF24" }}
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-[12.5px] text-[var(--mm-text-3)]">
                    No major weak areas detected.
                  </li>
                )}
              </ul>
            </Card>
          </div>

          {/* Question breakdown */}
          {questions.length > 0 && (
            <div className="space-y-3">
              <p className="mm-eyebrow">Question Analysis</p>
              {questions.map((q, i) => (
                <ReportQuestionCard key={i} questionItem={q} questionData={q} index={i} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ReportTab;

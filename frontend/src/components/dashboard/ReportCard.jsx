import { Award } from "lucide-react";
import { Card, Skeleton } from "./DashboardPrimitives";
import { cx } from "./cx";

const capitalize = (str) => (str ? str.charAt(0).toUpperCase() + str.slice(1) : "");

const formatDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

const scoreTone = (score) => {
  if (score == null) return { color: "var(--mm-text-3)", ring: "var(--mm-border)" };
  if (score >= 80)
    return { color: "#34D399", ring: "rgba(16,185,129,0.30)", tint: "rgba(16,185,129,0.10)" };
  if (score >= 60)
    return { color: "#C084FC", ring: "rgba(168,85,247,0.30)", tint: "rgba(168,85,247,0.10)" };
  return { color: "#FBBF24", ring: "rgba(245,158,11,0.30)", tint: "rgba(245,158,11,0.10)" };
};

/* ------------------------------------------------------------------
   Score meter used inside report cards
   ------------------------------------------------------------------ */
function Metric({ label, value }) {
  const pct = typeof value === "number" ? Math.max(0, Math.min(100, value)) : null;
  const tone = scoreTone(pct);

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--mm-text-3)]">
          {label}
        </span>
        <span className="shrink-0 font-mono text-[12px] font-bold" style={{ color: tone.color }}>
          {pct !== null ? `${pct}%` : "—"}
        </span>
      </div>
      <div className="mm-meter mt-1.5">
        {pct !== null && (
          <div
            className="mm-meter-fill"
            style={{
              width: `${pct}%`,
              backgroundImage:
                pct >= 60 ? "var(--mm-grad)" : "linear-gradient(90deg,#F59E0B,#EA580C)",
            }}
          />
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------
   Report card — interview meta + score breakdown + view action
   ------------------------------------------------------------------ */
export function ReportCard({ interview, detail, loading = false, onView, selected = false }) {
  if (loading) {
    return (
      <Card className="p-5">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="mt-2 h-3 w-28" />
        <div className="mt-5 space-y-3">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </Card>
    );
  }

  const overall = detail?.overallScore ?? interview?.overallScore ?? null;
  const tone = scoreTone(overall);
  const role = capitalize(interview?.targetRole || interview?.role || "Interview");
  const type = capitalize(interview?.interviewType || "Interview");
  const level = capitalize(interview?.experienceLevel || interview?.level || "");

  return (
    <Card
      hover
      className={cx("p-5", selected && "!border-[rgba(168,85,247,0.45)]")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="mm-icon-tile h-10 w-10 shrink-0"
            style={{ color: tone.color, backgroundColor: tone.tint, borderColor: tone.ring }}
            aria-hidden="true"
          >
            <Award className="h-[18px] w-[18px]" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[14.5px] font-bold tracking-tight text-[var(--mm-text)]">
              {role}
            </p>
            <p className="truncate text-[11.5px] text-[var(--mm-text-3)]">
              {[type, level].filter(Boolean).join(" · ")} · {formatDate(interview?.createdAt)}
            </p>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <p className="font-display text-[22px] font-bold leading-none" style={{ color: tone.color }}>
            {overall != null ? `${Math.round(overall)}%` : "—"}
          </p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--mm-text-3)]">
            Overall
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Metric label="Technical" value={detail?.technicalScore} />
        <Metric label="Communication" value={detail?.communicationScore} />
        <Metric label="Confidence" value={detail?.problemSolvingScore} />
      </div>

      <button
        type="button"
        onClick={onView}
        className="mm-btn mm-btn-ghost mt-5 w-full px-4 py-2.5 text-[12.5px]"
      >
        View Report
      </button>
    </Card>
  );
}

/* ------------------------------------------------------------------
   Skeleton grid for the reports list
   ------------------------------------------------------------------ */
export function ReportCardSkeletonGrid({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <ReportCard key={i} loading interview={{}} />
      ))}
    </div>
  );
}

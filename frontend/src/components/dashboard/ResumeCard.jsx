import { useRef, useState } from "react";
import { CheckCircle2, FileText, Loader2, Sparkles, Trash2, Upload } from "lucide-react";
import { Card, Skeleton } from "./DashboardPrimitives";
import { cx } from "./cx";

const formatBytes = (bytes) => {
  if (!bytes && bytes !== 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

/* ------------------------------------------------------------------
   Resume card — dashed dropzone when empty, file detail + actions
   when a resume exists. Upload/validation rules are owned by the
   parent so the same behaviour is shared with the full Resume tab.
   ------------------------------------------------------------------ */
export default function ResumeCard({
  resume,
  loading = false,
  uploading = false,
  analyzing = false,
  analyzed = false,
  error = null,
  onSelectFile,
  onAnalyze,
  onViewAnalysis,
  onDelete,
}) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const hasResume = Boolean(resume);

  const openPicker = () => inputRef.current?.click();

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer?.files?.[0];
    if (file && onSelectFile) onSelectFile(file);
  };

  const fileName = resume?.originalName || resume?.fileName || "Resume.pdf";

  return (
    <Card className="flex h-full flex-col p-6 sm:p-7">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#10B981] text-white"
            aria-hidden="true"
          >
            <FileText className="h-5 w-5" />
          </span>
          <h3 className="font-display text-[18px] font-bold text-[var(--mm-text)]">
            Resume
          </h3>
        </div>
        {analyzed && (
          <span className="mm-badge shrink-0 !border-[rgba(16,185,129,0.30)] !bg-[rgba(16,185,129,0.10)] !text-[#10B981] dark:!text-[#34D399]">
            <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
            Analysed
          </span>
        )}
      </div>

      {/* Hidden input — shared by click and drag & drop */}
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        aria-label="Upload resume PDF"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && onSelectFile) onSelectFile(file);
          e.target.value = "";
        }}
      />

      {loading ? (
        <div className="mt-5 flex flex-1 flex-col gap-3">
          <Skeleton className="h-[132px] w-full rounded-2xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      ) : !hasResume ? (
        /* ---------- Empty: dashed dropzone ---------- */
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={cx(
            "mm-dropzone mt-5 flex flex-1 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--mm-border)] p-6 text-center transition-colors",
            dragging && "border-[#F97316] bg-[#F97316]/10"
          )}
        >
          {uploading ? (
            <Loader2 className="h-10 w-10 animate-spin text-[#F97316]" />
          ) : (
            <Upload className="h-10 w-10 text-[#F97316]" />
          )}

          <p className="mt-4 text-[14px] font-medium text-[var(--mm-text-2)]">
            {uploading ? "Uploading your resume…" : "Upload your resume to get started"}
          </p>

          <button
            type="button"
            onClick={openPicker}
            disabled={uploading}
            className="mm-btn mm-btn-primary mt-5 px-6 py-2.5 text-[13.5px]"
          >
            {uploading ? "Uploading…" : "Choose File"}
          </button>

          {error && <p className="mt-3 text-[12px] font-medium text-[#F87171]">{error}</p>}
        </div>
      ) : (
        /* ---------- Populated: file detail + actions ---------- */
        <div className="mt-5 flex flex-1 flex-col">
          <div className="flex items-start gap-3.5 rounded-2xl border border-[var(--mm-border)] bg-[var(--mm-bg)] p-4">
            <span
              className="mm-icon-tile h-11 w-11 shrink-0"
              style={{
                color: analyzed ? "var(--mm-green)" : "var(--mm-purple)",
                backgroundColor: analyzed ? "rgba(16,185,129,0.12)" : "rgba(249,115,22,0.12)",
                borderColor: analyzed ? "rgba(16,185,129,0.28)" : "rgba(249,115,22,0.28)",
              }}
              aria-hidden="true"
            >
              <FileText className="h-5 w-5" />
            </span>

            <div className="min-w-0 flex-1">
              <p className="truncate text-[13.5px] font-semibold text-[var(--mm-text)]">
                {fileName}
              </p>
              <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5">
                <div className="min-w-0">
                  <dt className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[var(--mm-text-3)]">
                    Uploaded
                  </dt>
                  <dd className="truncate text-[12px] text-[var(--mm-text-2)]">
                    {formatDate(resume.createdAt || resume.uploadedAt)}
                  </dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[var(--mm-text-3)]">
                    Size
                  </dt>
                  <dd className="truncate text-[12px] text-[var(--mm-text-2)]">
                    {formatBytes(resume.fileSize ?? resume.size)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {analyzed && resume?.atsScore != null && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                { label: "ATS", value: resume.atsScore },
                {
                  label: "Skills",
                  value: Array.isArray(resume.skills) ? resume.skills.length : 0,
                },
                {
                  label: "Projects",
                  value: Array.isArray(resume.projects) ? resume.projects.length : 0,
                },
              ].map((m) => (
                <div
                  key={m.label}
                  className="rounded-xl border border-[var(--mm-border)] bg-[var(--mm-bg)] px-2 py-2.5 text-center"
                >
                  <p className="font-display text-[15px] font-bold text-[var(--mm-text)]">
                    {m.value ?? "—"}
                  </p>
                  <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--mm-text-3)]">
                    {m.label}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {analyzed ? (
              <button
                type="button"
                onClick={onViewAnalysis}
                className="mm-btn mm-btn-primary flex-1 px-4 py-2.5 text-[12.5px]"
              >
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                View Analysis
              </button>
            ) : (
              <button
                type="button"
                onClick={onAnalyze}
                disabled={analyzing}
                className="mm-btn mm-btn-primary flex-1 px-4 py-2.5 text-[12.5px]"
              >
                {analyzing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                {analyzing ? "Analysing…" : "Analyse Resume"}
              </button>
            )}

            <button
              type="button"
              onClick={openPicker}
              disabled={uploading}
              className="mm-btn mm-btn-ghost px-4 py-2.5 text-[12.5px]"
            >
              {uploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <Upload className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              Replace
            </button>

            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                disabled={uploading}
                className="mm-btn mm-btn-ghost px-3.5 py-2.5 text-[12.5px] hover:!border-[rgba(239,68,68,0.45)] hover:!text-[#F87171]"
                aria-label={`Delete ${fileName}`}
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            )}
          </div>

          {error && <p className="mt-3 text-[12px] font-medium text-[#F87171]">{error}</p>}
        </div>
      )}
    </Card>
  );
}

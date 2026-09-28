import { FileText, ExternalLink, Trash2, Loader2, Sparkles, CheckCircle2 } from "lucide-react";

function ResumeList({ resumes = [], onDelete, onAnalyze, analyzingId, deletingId, loadingResumes }) {
  if (loadingResumes) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--text-primary-2)]" />
        <span className="ml-2 text-sm text-[var(--text-secondary-2)]">Loading resumes...</span>
      </div>
    );
  }

  if (!resumes || resumes.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--strong-line)] bg-[var(--bg-surface)] py-6 text-center">
        <p className="text-sm font-medium text-[var(--text-secondary-2)]">No resume uploaded</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {resumes.map((resume) => {
        const isDeleting = deletingId === resume._id;
        const isAnalyzing = analyzingId === resume._id;
        const isAnalyzed = Boolean(resume.analyzedAt);

        const uploadDate = resume.createdAt
          ? new Date(resume.createdAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : "Uploaded";

        return (
          <div
            key={resume._id}
            className="flex flex-col gap-2 rounded-xl border border-[var(--strong-line)] bg-[var(--bg-surface)] p-3.5 backdrop-blur-md transition duration-200 hover:border-[var(--strong-line-2)] hover:bg-[var(--card-bg-2)] sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-3 min-w-0 pr-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--chip-bg)] border border-[var(--strong-line)] text-[var(--text-primary-2)]">
                <FileText className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium text-[var(--text-primary-3)]" title={resume.fileName}>
                    {resume.fileName}
                  </p>
                  {isAnalyzed && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" />
                      ATS {resume.atsScore ? `${resume.atsScore}/100` : "Analyzed"}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--text-muted-2)]">{uploadDate}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Analyze Action */}
              <button
                type="button"
                disabled={isAnalyzing}
                onClick={() => onAnalyze && onAnalyze(resume._id)}
                className="inline-flex items-center gap-1 rounded-lg border border-[var(--inv-bg)]/20 bg-[var(--inv-bg)] px-3 py-1.5 text-xs font-bold text-[var(--inv-text)] transition hover:bg-[var(--inv-hover-2)] disabled:opacity-50"
                title="AI Resume Analysis"
              >
                {isAnalyzing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                <span>{isAnalyzing ? "Analyzing..." : isAnalyzed ? "View Analysis" : "Analyze Resume"}</span>
              </button>

              {/* View Action */}
              <button
                type="button"
                onClick={() => window.open(resume.fileUrl, "_blank", "noopener,noreferrer")}
                className="inline-flex items-center gap-1 rounded-lg border border-[var(--strong-line)] bg-[var(--chip-bg)] px-2.5 py-1.5 text-xs font-semibold text-[var(--text-secondary-2)] transition hover:bg-[var(--strong-line)] hover:text-[var(--text-primary-2)]"
                title="View PDF"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>PDF</span>
              </button>

              {/* Delete Action */}
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => onDelete(resume._id)}
                className="inline-flex items-center gap-1 rounded-lg border border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.10)] px-2.5 py-1.5 text-xs font-semibold text-[#F87171] transition hover:bg-[#DC2626] hover:text-white disabled:opacity-50"
                title="Delete Resume"
              >
                {isDeleting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
                <span>{isDeleting ? "Deleting..." : "Delete"}</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ResumeList;


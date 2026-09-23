import { FileText, ExternalLink, Trash2, Loader2, Sparkles, CheckCircle2 } from "lucide-react";

function ResumeList({ resumes = [], onDelete, onAnalyze, analyzingId, deletingId, loadingResumes }) {
  if (loadingResumes) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-[#FFFFFF]" />
        <span className="ml-2 text-sm text-[#A1A1A1]">Loading resumes...</span>
      </div>
    );
  }

  if (!resumes || resumes.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[#262626] bg-[#0A0A0A] py-6 text-center">
        <p className="text-sm font-medium text-[#A1A1A1]">No resume uploaded</p>
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
            className="flex flex-col gap-2 rounded-xl border border-[#262626] bg-[#0A0A0A] p-3.5 backdrop-blur-md transition duration-200 hover:border-[#404040] hover:bg-[#111111] sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-3 min-w-0 pr-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#171717] border border-[#262626] text-[#FFFFFF]">
                <FileText className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium text-[#FAFAFA]" title={resume.fileName}>
                    {resume.fileName}
                  </p>
                  {isAnalyzed && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" />
                      ATS {resume.atsScore ? `${resume.atsScore}/100` : "Analyzed"}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#737373]">{uploadDate}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Analyze Action */}
              <button
                type="button"
                disabled={isAnalyzing}
                onClick={() => onAnalyze && onAnalyze(resume._id)}
                className="inline-flex items-center gap-1 rounded-lg border border-[#FFFFFF]/20 bg-[#FFFFFF] px-3 py-1.5 text-xs font-bold text-[#000000] transition hover:bg-[#E5E5E5] disabled:opacity-50"
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
                className="inline-flex items-center gap-1 rounded-lg border border-[#262626] bg-[#171717] px-2.5 py-1.5 text-xs font-semibold text-[#A1A1A1] transition hover:bg-[#262626] hover:text-[#FFFFFF]"
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
                className="inline-flex items-center gap-1 rounded-lg border border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.10)] px-2.5 py-1.5 text-xs font-semibold text-[#F87171] transition hover:bg-[#DC2626] hover:text-[#FFFFFF] disabled:opacity-50"
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


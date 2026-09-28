import { useNavigate } from "react-router-dom";
import {
  X,
  Award,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Code2,
  Briefcase,
  GraduationCap,
  Lightbulb,
  FileText,
  ArrowRight,
  TrendingUp,
  Layers,
  Wrench,
  Check,
} from "lucide-react";

function ResumeAnalysisModal({ resume, onClose }) {
  const navigate = useNavigate();

  if (!resume) return null;

  const atsScore = resume.atsScore ?? 75;

  const getScoreColor = (score) => {
    if (score >= 80)
      return {
        badge: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
        ring: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
        bar: "bg-emerald-500",
      };
    if (score >= 60)
      return {
        badge: "text-amber-400 border-amber-500/30 bg-amber-500/10",
        ring: "border-amber-500/40 bg-amber-500/10 text-amber-400",
        bar: "bg-amber-500",
      };
    return {
      badge: "text-rose-400 border-rose-500/30 bg-rose-500/10",
      ring: "border-rose-500/40 bg-rose-500/10 text-rose-400",
      bar: "bg-rose-500",
    };
  };

  const scoreTheme = getScoreColor(atsScore);

  const handleStartInterview = () => {
    if (onClose) onClose();
    navigate("/interview/new", {
      state: {
        selectedResumeId: resume._id,
        resumeId: resume._id,
      },
    });
  };

  // Safely format recommended difficulty (strip " Level" if present)
  const formattedDifficulty = (resume.recommendedDifficulty || "Medium")
    .replace(/ level/i, "")
    .trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.85)] p-4 backdrop-blur-md overflow-y-auto">
      <div className="my-8 w-full max-w-4xl overflow-hidden rounded-2xl border border-[var(--strong-line)] bg-[var(--card-bg-2)] text-[var(--text-primary-2)] shadow-2xl space-y-6 max-h-[90vh] flex flex-col justify-between">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[var(--strong-line)] p-6 bg-[var(--bg-surface)] sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500/20 to-pink-500/20 border border-orange-500/30 text-orange-400 shadow-sm">
              <Sparkles className="h-5 w-5 fill-current" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary-2)] tracking-tight">
                AI Resume Analysis
              </h2>
              <p className="text-xs text-[var(--text-secondary-2)] flex items-center gap-1.5 mt-0.5">
                <FileText className="h-3.5 w-3.5 text-orange-400 shrink-0" />
                <span>{resume.fileName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleStartInterview}
              className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-[var(--inv-bg)] px-4 py-2 text-xs font-bold text-[var(--inv-text)] shadow-sm transition hover:bg-[var(--inv-hover)]"
            >
              <span>Start AI Interview</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-[var(--text-muted-2)] hover:bg-[var(--hover-bg)] hover:text-[var(--text-primary-2)] transition"
              aria-label="Close Analysis"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          
          {/* Section 1: Prominent ATS Score & Quick Insights Bar */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            
            {/* Prominent ATS Score Card */}
            <div className="rounded-2xl border border-orange-500/30 bg-gradient-to-br from-orange-500/10 via-[var(--bg-surface)] to-pink-500/10 p-5 flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-orange-400">
                  ATS READINESS
                </span>
                <Award className="h-5 w-5 text-orange-400" />
              </div>
              <div className="my-3">
                <div className="text-4xl font-extrabold text-[var(--text-primary-2)] tracking-tight">
                  {atsScore} <span className="text-lg font-bold text-[var(--text-muted-2)]">/ 100</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--strong-line)]">
                  <div
                    className={`h-full transition-all duration-500 ${scoreTheme.bar}`}
                    style={{ width: `${Math.min(Math.max(atsScore, 5), 100)}%` }}
                  />
                </div>
              </div>
              <p className="text-[11px] text-[var(--text-secondary-2)]">
                {atsScore >= 80
                  ? "Strong ATS compatibility for tech roles."
                  : atsScore >= 60
                  ? "Good ATS format, some gaps to optimize."
                  : "Requires formatting & skill updates."}
              </p>
            </div>

            {/* Quick Insights Cards (Derived from backend arrays) */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-2xl border border-[var(--strong-line)] bg-[var(--card-bg-2)] p-4 flex flex-col justify-between">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary-2)]">
                  <Code2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Skills Detected</span>
                </div>
                <div className="mt-2 text-2xl font-extrabold text-emerald-400">
                  {resume.skills?.length || 0}
                </div>
                <p className="mt-1 text-[10px] text-[var(--text-muted-2)]">
                  Extracted from resume
                </p>
              </div>

              <div className="rounded-2xl border border-[var(--strong-line)] bg-[var(--card-bg-2)] p-4 flex flex-col justify-between">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary-2)]">
                  <Layers className="h-4 w-4 text-[#3B82F6] shrink-0" />
                  <span>Projects Detected</span>
                </div>
                <div className="mt-2 text-2xl font-extrabold text-[#3B82F6]">
                  {resume.projects?.length || 0}
                </div>
                <p className="mt-1 text-[10px] text-[var(--text-muted-2)]">
                  Used for technical questions
                </p>
              </div>

              <div className="rounded-2xl border border-[var(--strong-line)] bg-[var(--card-bg-2)] p-4 flex flex-col justify-between">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary-2)]">
                  <TrendingUp className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>Skills to Improve</span>
                </div>
                <div className="mt-2 text-2xl font-extrabold text-amber-400">
                  {resume.missingSkills?.length || 0}
                </div>
                <p className="mt-1 text-[10px] text-[var(--text-muted-2)]">
                  Suggested focus areas
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Recommended Topics & Recommended Difficulty */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            
            {/* Recommended Topics */}
            <div className="md:col-span-2 rounded-2xl border border-[var(--strong-line)] bg-[var(--card-bg-2)] p-5">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary-2)] flex items-center gap-2 mb-3">
                <Lightbulb className="h-4 w-4 text-[#FBBF24]" />
                Recommended Topics
              </span>
              <div className="flex flex-wrap gap-2">
                {resume.recommendedTopics && resume.recommendedTopics.length > 0 ? (
                  resume.recommendedTopics.map((topic, i) => (
                    <span
                      key={i}
                      className="rounded-xl border border-[var(--strong-line)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--text-primary-2)] shadow-xs"
                    >
                      {topic}
                    </span>
                  ))
                ) : (
                  <span className="rounded-xl border border-[var(--strong-line)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--text-primary-2)]">
                    Full Stack Web Development
                  </span>
                )}
              </div>
            </div>

            {/* Recommended Interview Difficulty */}
            <div className="rounded-2xl border border-[var(--strong-line)] bg-[var(--card-bg-2)] p-5 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary-2)] flex items-center gap-1.5 mb-2">
                  <Code2 className="h-4 w-4 text-orange-400" />
                  RECOMMENDED INTERVIEW DIFFICULTY
                </span>
                <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-orange-500/40 bg-orange-500/10 px-4 py-1 text-sm font-extrabold text-orange-400 uppercase">
                  {formattedDifficulty}
                </div>
              </div>
              <p className="mt-3 text-[11px] text-[var(--text-muted-2)] leading-relaxed">
                Based on candidate experience and project complexity.
              </p>
            </div>
          </div>

          {/* Section 3: Detected Technical Skills & Suggested Skills to Improve */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            
            {/* Detected Technical Skills */}
            <div className="rounded-2xl border border-[var(--strong-line)] bg-[var(--card-bg-2)] p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary-2)] mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                Detected Technical Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {resume.skills && resume.skills.length > 0 ? (
                  resume.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs italic text-[var(--text-muted-2)]">
                    No skills explicitly detected
                  </span>
                )}
              </div>
            </div>

            {/* Suggested Skills to Improve */}
            <div className="rounded-2xl border border-[var(--strong-line)] bg-[var(--card-bg-2)] p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary-2)] mb-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
                Suggested Skills to Improve
              </h3>
              <div className="flex flex-wrap gap-2">
                {resume.missingSkills && resume.missingSkills.length > 0 ? (
                  resume.missingSkills.map((skill, i) => (
                    <span
                      key={i}
                      className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-400"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs italic text-[var(--text-muted-2)]">
                    No major skill gaps detected
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Projects Used for AI Questions */}
          {resume.projects && resume.projects.length > 0 && (
            <div className="rounded-2xl border border-[var(--strong-line)] bg-[var(--card-bg-2)] p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary-2)] flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-[#3B82F6] shrink-0" />
                Projects Used for AI Questions
              </h3>
              <div className="grid grid-cols-1 gap-3.5">
                {resume.projects.map((proj, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-[var(--strong-line)] bg-[var(--bg-surface)] p-4 text-xs space-y-2"
                  >
                    <p className="font-bold text-sm text-[var(--text-primary-2)]">{proj.title}</p>
                    {proj.technologies && proj.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {proj.technologies.map((tech, tIdx) => (
                          <span
                            key={tIdx}
                            className="rounded-md border border-[var(--strong-line)] bg-[var(--card-bg-2)] px-2 py-0.5 text-[11px] font-medium text-orange-400"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                    {proj.description && (
                      <p className="text-[var(--text-secondary-2)] leading-relaxed text-xs">
                        {proj.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 5: Resume Strengths & Actionable AI Suggestions */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            
            {/* Resume Strengths */}
            <div className="rounded-2xl border border-[var(--strong-line)] bg-[var(--card-bg-2)] p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-400" />
                Resume Strengths
              </h3>
              <ul className="space-y-2 text-xs text-[var(--text-secondary-2)]">
                {resume.strengths && resume.strengths.length > 0 ? (
                  resume.strengths.map((str, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="text-emerald-400 font-bold text-sm leading-none shrink-0">✓</span>
                      <span className="leading-relaxed">{str}</span>
                    </li>
                  ))
                ) : (
                  <li className="italic text-[var(--text-muted-2)]">No specific strengths listed</li>
                )}
              </ul>
            </div>

            {/* Actionable Suggestions */}
            <div className="rounded-2xl border border-[var(--strong-line)] bg-[var(--card-bg-2)] p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-orange-400 mb-3 flex items-center gap-2">
                <Wrench className="h-4 w-4 text-orange-400" />
                Actionable Suggestions
              </h3>
              <ol className="space-y-2.5 text-xs text-[var(--text-secondary-2)]">
                {resume.suggestions && resume.suggestions.length > 0 ? (
                  resume.suggestions.map((sug, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-orange-500/20 text-[10px] font-bold text-orange-400 shrink-0">
                        {i + 1}
                      </span>
                      <span className="leading-relaxed">{sug}</span>
                    </li>
                  ))
                ) : (
                  <li className="italic text-[var(--text-muted-2)]">No suggestions available</li>
                )}
              </ol>
            </div>
          </div>

          {/* Section 6: Start AI Interview CTA Card */}
          <div className="rounded-2xl border border-orange-500/30 bg-gradient-to-r from-orange-500/10 via-[var(--bg-surface)] to-pink-500/10 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div>
              <h4 className="text-sm font-extrabold uppercase tracking-wider text-orange-400">
                READY TO PRACTICE?
              </h4>
              <p className="mt-1 text-xs text-[var(--text-secondary-2)] max-w-lg">
                Your resume has been analyzed. Start a personalized interview using your resume, skills and projects.
              </p>
            </div>
            <button
              type="button"
              onClick={handleStartInterview}
              className="shrink-0 flex items-center gap-2 rounded-xl bg-[var(--inv-bg)] px-6 py-3 text-xs font-bold text-[var(--inv-text)] shadow-md transition hover:bg-[var(--inv-hover)]"
            >
              <span>Start AI Interview</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end border-t border-[var(--strong-line)] p-4 bg-[var(--bg-surface)] sticky bottom-0 z-20">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[var(--strong-line)] bg-[var(--bg-surface)] px-5 py-2 text-xs font-semibold text-[var(--text-secondary-2)] hover:bg-[var(--hover-bg)] hover:text-[var(--text-primary-2)] transition"
          >
            Close Analysis
          </button>
        </div>

      </div>
    </div>
  );
}

export default ResumeAnalysisModal;

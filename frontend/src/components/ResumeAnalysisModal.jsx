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
} from "lucide-react";

function ResumeAnalysisModal({ resume, onClose }) {
  if (!resume) return null;

  const atsScore = resume.atsScore ?? 75;

  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
    if (score >= 60) return "text-amber-400 border-amber-500/30 bg-amber-500/10";
    return "text-rose-400 border-rose-500/30 bg-rose-500/10";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000]/80 p-4 backdrop-blur-md overflow-y-auto">
      <div className="my-8 w-full max-w-4xl overflow-hidden rounded-2xl border border-[#262626] bg-[#0A0A0A] p-6 text-[#FFFFFF] shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#262626] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#171717] border border-[#262626] text-[#FFFFFF]">
              <Sparkles className="h-5 w-5 text-[#FFFFFF]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#FFFFFF]">AI Resume Analysis & Candidate Context</h2>
              <p className="text-xs text-[#A1A1A1]">{resume.fileName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#737373] hover:bg-[#1A1A1A] hover:text-[#FFFFFF]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ATS Score & Overview Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* ATS Score */}
          <div className={`flex flex-col items-center justify-center rounded-xl border p-5 text-center ${getScoreColor(atsScore)}`}>
            <Award className="h-8 w-8 mb-2" />
            <span className="text-xs font-bold uppercase tracking-wider">ATS Readiness Score</span>
            <span className="mt-1 text-4xl font-extrabold">{atsScore} / 100</span>
          </div>

          {/* Recommended Topics */}
          <div className="rounded-xl border border-[#262626] bg-[#111111] p-5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#A1A1A1] flex items-center gap-1.5 mb-2">
              <Lightbulb className="h-4 w-4 text-[#FBBF24]" />
              Recommended Topics
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(resume.recommendedTopics && resume.recommendedTopics.length > 0) ? (
                resume.recommendedTopics.map((topic, i) => (
                  <span key={i} className="rounded-md border border-[#262626] bg-[#0A0A0A] px-2 py-1 text-[11px] font-semibold text-[#FAFAFA]">
                    {topic}
                  </span>
                ))
              ) : (
                <span className="text-xs italic text-[#737373]">Full Stack Development</span>
              )}
            </div>
          </div>

          {/* Recommended Difficulty */}
          <div className="rounded-xl border border-[#262626] bg-[#111111] p-5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#A1A1A1] flex items-center gap-1.5 mb-2">
              <Code2 className="h-4 w-4 text-[#3B82F6]" />
              Suggested Difficulty
            </span>
            <span className="inline-block rounded-full border border-[#3B82F6]/30 bg-[#3B82F6]/10 px-3 py-1 text-xs font-bold uppercase text-[#3B82F6]">
              {resume.recommendedDifficulty || "Medium"} Level
            </span>
            <p className="mt-2 text-[11px] text-[#A1A1A1]">
              Based on candidate experience & project complexity
            </p>
          </div>
        </div>

        {/* Skills & Missing Skills */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Extracted Skills */}
          <div className="rounded-xl border border-[#262626] bg-[#111111] p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#FFFFFF] mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              Detected Technical Skills
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {(resume.skills && resume.skills.length > 0) ? (
                resume.skills.map((skill, i) => (
                  <span key={i} className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-xs text-[#737373]">No skills explicitly found</span>
              )}
            </div>
          </div>

          {/* Missing Skills */}
          <div className="rounded-xl border border-[#262626] bg-[#111111] p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#FFFFFF] mb-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-400" />
              Suggested Missing Skills
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {(resume.missingSkills && resume.missingSkills.length > 0) ? (
                resume.missingSkills.map((skill, i) => (
                  <span key={i} className="rounded-md border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-300">
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-xs text-[#737373]">No major gaps detected</span>
              )}
            </div>
          </div>
        </div>

        {/* Projects & Work Experience */}
        {((resume.projects && resume.projects.length > 0) || (resume.experience && resume.experience.length > 0)) && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Projects */}
            {resume.projects && resume.projects.length > 0 && (
              <div className="rounded-xl border border-[#262626] bg-[#111111] p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#FFFFFF] mb-3 flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-[#3B82F6]" />
                  Candidate Projects (Used for AI Questions)
                </h3>
                <div className="space-y-3">
                  {resume.projects.map((proj, i) => (
                    <div key={i} className="rounded-lg border border-[#262626] bg-[#0A0A0A] p-3 text-xs">
                      <p className="font-bold text-[#FFFFFF]">{proj.title}</p>
                      {proj.description && <p className="mt-1 text-[#A1A1A1] leading-relaxed">{proj.description}</p>}
                      {proj.technologies && proj.technologies.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {proj.technologies.map((tech, tIdx) => (
                            <span key={tIdx} className="rounded bg-[#171717] px-1.5 py-0.5 text-[10px] text-[#A1A1A1]">
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Experience */}
            {resume.experience && resume.experience.length > 0 && (
              <div className="rounded-xl border border-[#262626] bg-[#111111] p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#FFFFFF] mb-3 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-[#FBBF24]" />
                  Work Experience
                </h3>
                <div className="space-y-3">
                  {resume.experience.map((exp, i) => (
                    <div key={i} className="rounded-lg border border-[#262626] bg-[#0A0A0A] p-3 text-xs">
                      <div className="flex justify-between font-bold text-[#FFFFFF]">
                        <span>{exp.role}</span>
                        <span className="text-[10px] text-[#737373]">{exp.duration}</span>
                      </div>
                      {exp.company && <p className="text-emerald-400 font-semibold">{exp.company}</p>}
                      {exp.description && <p className="mt-1 text-[#A1A1A1] leading-relaxed">{exp.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Strengths & Actionable Suggestions */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Strengths */}
          <div className="rounded-xl border border-[#262626] bg-[#111111] p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3">
              Resume Strengths
            </h3>
            <ul className="space-y-2 text-xs text-[#A1A1A1]">
              {(resume.strengths && resume.strengths.length > 0) ? (
                resume.strengths.map((str, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>{str}</span>
                  </li>
                ))
              ) : (
                <li className="italic text-[#737373]">No specific strengths listed</li>
              )}
            </ul>
          </div>

          {/* Actionable Suggestions */}
          <div className="rounded-xl border border-[#262626] bg-[#111111] p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#3B82F6] mb-3">
              Actionable AI Suggestions
            </h3>
            <ul className="space-y-2 text-xs text-[#A1A1A1]">
              {(resume.suggestions && resume.suggestions.length > 0) ? (
                resume.suggestions.map((sug, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#3B82F6] font-bold">•</span>
                    <span>{sug}</span>
                  </li>
                ))
              ) : (
                <li className="italic text-[#737373]">No suggestions available</li>
              )}
            </ul>
          </div>
        </div>

        {/* Footer Button */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[#FFFFFF] px-6 py-2.5 text-xs font-bold text-[#000000] hover:bg-[#E5E5E5]"
          >
            Close Analysis
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResumeAnalysisModal;

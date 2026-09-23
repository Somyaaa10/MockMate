import { useEffect, useState, useRef } from "react";
import {
  FileText,
  Upload,
  Trash2,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle2,
  CheckCheck,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config/config";
import ResumeAnalysisModal from "./ResumeAnalysisModal";

function ResumeTab() {
  const { token } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [analyzingId, setAnalyzingId] = useState(null);
  const [activeAnalysisResume, setActiveAnalysisResume] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [actionMsg, setActionMsg] = useState({ type: "", text: "" });
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!token) return;
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/resumes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setResumes(Array.isArray(res.data?.data) ? res.data.data : []);
      } catch (err) {
        console.error("Resume fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [token]);

  const handleUpload = async (file) => {
    if (!file || !token) return;
    setUploadError(null);
    setUploadSuccess(null);
    setActionMsg({ type: "", text: "" });

    if (!(file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf"))) {
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
      setUploadError(err.response?.data?.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFileInput = (e) => handleUpload(e.target.files?.[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  const handleDelete = async (resumeId) => {
    if (!window.confirm("Are you sure you want to delete this resume?")) return;
    setDeletingId(resumeId);
    setActionMsg({ type: "", text: "" });
    try {
      await axios.delete(`${API_BASE_URL}/resumes/${resumeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResumes((prev) => prev.filter((r) => r._id !== resumeId));
      setActionMsg({ type: "success", text: "Resume deleted." });
    } catch (err) {
      setActionMsg({
        type: "error",
        text: err.response?.data?.message || "Failed to delete resume.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleAnalyze = async (resumeId) => {
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
      setActionMsg({
        type: "error",
        text: err.response?.data?.message || "Analysis failed. Please try again.",
      });
    } finally {
      setAnalyzingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-[#8B5CF6]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#F5F5F5]">Resume</h1>
        <p className="text-[13px] text-[#A1A1AA] mt-0.5">
          Upload your resume to get personalized AI interview questions.
        </p>
      </div>

      {/* Messages */}
      {uploadSuccess && (
        <div className="flex items-center gap-2 rounded-xl border border-[#22C55E]/20 bg-[#22C55E]/08 px-4 py-3 text-[13px] text-[#22C55E]">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          <span>{uploadSuccess}</span>
        </div>
      )}
      {uploadError && (
        <div className="flex items-center gap-2 rounded-xl border border-[#EF4444]/20 bg-[#EF4444]/08 px-4 py-3 text-[13px] text-[#EF4444]">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}
      {actionMsg.text && (
        <div
          className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-[13px] ${
            actionMsg.type === "success"
              ? "border-[#22C55E]/20 bg-[#22C55E]/08 text-[#22C55E]"
              : "border-[#EF4444]/20 bg-[#EF4444]/08 text-[#EF4444]"
          }`}
        >
          {actionMsg.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
          )}
          <span>{actionMsg.text}</span>
        </div>
      )}

      {/* Upload Area */}
      <div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInput}
          accept=".pdf,application/pdf"
          className="hidden"
          aria-label="Upload resume file"
        />
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`saas-card rounded-2xl border-dashed p-8 text-center cursor-pointer transition-all duration-150 ${
            isDragging
              ? "border-[rgba(139,92,246,0.45)] bg-[rgba(139,92,246,0.06)]"
              : "hover:border-[rgba(255,255,255,0.15)]"
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-[#8B5CF6]" />
              <p className="text-[13px] text-[#A1A1AA]">Uploading resume...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#151515]">
                <Upload className="h-5 w-5 text-[#8B5CF6]" />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-[#F5F5F5]">
                  Drag and drop your PDF here
                </p>
                <p className="text-[12px] text-[#71717A] mt-0.5">or click to choose a file</p>
              </div>
              <p className="text-[11px] text-[#71717A]">PDF · Max 5 MB</p>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                className="btn-secondary rounded-lg px-4 py-2 text-[12px] font-medium"
              >
                Choose File
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Resume List */}
      {resumes.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-[#71717A]">
            Uploaded Resumes
          </h2>
          <div className="saas-card rounded-2xl divide-y divide-[rgba(255,255,255,0.06)]">
            {resumes.map((resume) => (
              <div
                key={resume._id}
                className="flex items-center justify-between px-5 py-4 gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[rgba(139,92,246,0.10)]">
                    <FileText className="h-4 w-4 text-[#8B5CF6]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-[#F5F5F5] truncate">
                      {resume.originalName || resume.fileName || "Resume.pdf"}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-[#71717A]">
                        Uploaded {new Date(resume.createdAt).toLocaleDateString()}
                      </span>
                      {resume.analyzedAt && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#22C55E]">
                          <CheckCheck className="h-3 w-3" />
                          Analyzed
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleAnalyze(resume._id)}
                    disabled={analyzingId === resume._id}
                    className="btn-secondary inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium disabled:opacity-50"
                    title={resume.analyzedAt ? "View analysis" : "Analyze resume"}
                  >
                    {analyzingId === resume._id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5 text-[#8B5CF6]" />
                    )}
                    <span>{analyzingId === resume._id ? "Analyzing..." : resume.analyzedAt ? "View Analysis" : "Analyze"}</span>
                  </button>
                  <button
                    onClick={() => handleDelete(resume._id)}
                    disabled={deletingId === resume._id}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#151515] text-[#71717A] hover:bg-[rgba(239,68,68,0.08)] hover:text-[#EF4444] hover:border-[rgba(239,68,68,0.20)] transition-colors disabled:opacity-50"
                    title="Delete resume"
                  >
                    {deletingId === resume._id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analysis Modal */}
      {activeAnalysisResume && (
        <ResumeAnalysisModal
          resume={activeAnalysisResume}
          onClose={() => setActiveAnalysisResume(null)}
        />
      )}
    </div>
  );
}

export default ResumeTab;

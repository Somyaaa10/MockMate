import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Edit2,
  X,
  Check,
  MessageSquare,
  CheckCircle2,
  Copy,
  Loader2,
  AlertCircle,
  Clock,
  Camera,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config/config";
import FaceEnrollmentPanel from "./interview/FaceEnrollmentPanel";

/* ------------------------------------------------------------------
   Info Row — view mode
   ------------------------------------------------------------------ */
function InfoRow({ label, value, icon: Icon }) {
  return (
    <div className="flex items-start gap-3 py-3.5 border-b border-[rgba(255,255,255,0.06)] last:border-0">
      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-[#151515] mt-0.5">
        <Icon className="h-3.5 w-3.5 text-[#71717A]" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium text-[#71717A] mb-0.5">{label}</p>
        <p className="text-[13px] font-medium text-[#F5F5F5]">
          {value || <span className="text-[#71717A] font-normal">Not provided</span>}
        </p>
      </div>
    </div>
  );
}

function ProfileTab() {
  const { user, token, updateProfile, refreshUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    mobile: user?.mobile || "",
    designation: user?.designation || "",
    bio: user?.bio || "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Profile photo state
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoMessage, setPhotoMessage] = useState({ type: "", text: "" });
  const [showEnrollment, setShowEnrollment] = useState(false);

  // WhatsApp
  const [isWaModalOpen, setIsWaModalOpen] = useState(false);
  const [waCode, setWaCode] = useState("");
  const [waExpiresIn, setWaExpiresIn] = useState(600);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [checkingConnection, setCheckingConnection] = useState(false);
  const [copied, setCopied] = useState(false);
  const [waError, setWaError] = useState(null);
  const [waSuccess, setWaSuccess] = useState(null);

  // Countdown timer
  useEffect(() => {
    let timer;
    if (isWaModalOpen && waExpiresIn > 0) {
      timer = setInterval(() => {
        setWaExpiresIn((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isWaModalOpen, waExpiresIn]);

  const formatTimer = (s) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const handleGenerateWaCode = async () => {
    if (!token) return;
    setGeneratingCode(true);
    setWaError(null);
    setWaSuccess(null);
    setCopied(false);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/whatsapp/link`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.code) {
        setWaCode(res.data.code);
        setWaExpiresIn(res.data.expiresIn || 600);
        setIsWaModalOpen(true);
      }
    } catch (err) {
      setWaError(err.response?.data?.message || "Failed to generate WhatsApp linking code.");
    } finally {
      setGeneratingCode(false);
    }
  };

  const handleCopyCode = () => {
    if (!waCode) return;
    navigator.clipboard.writeText(waCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCheckConnection = async () => {
    setCheckingConnection(true);
    setWaError(null);
    try {
      const updated = await refreshUser();
      if (updated?.whatsappPhone) {
        setWaSuccess("WhatsApp connected successfully!");
        setTimeout(() => { setIsWaModalOpen(false); setWaSuccess(null); }, 1500);
      } else {
        setWaError("Not connected yet. Send the code on WhatsApp and try again.");
      }
    } catch {
      setWaError("Failed to verify connection. Please try again.");
    } finally {
      setCheckingConnection(false);
    }
  };

  const handleEditClick = () => {
    setFormData({
      fullName: user?.fullName || "",
      mobile: user?.mobile || "",
      designation: user?.designation || "",
      bio: user?.bio || "",
    });
    setMessage({ type: "", text: "" });
    setIsEditing(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });
    try {
      await updateProfile({
        fullName: formData.fullName,
        mobile: formData.mobile,
        designation: formData.designation,
      });
      setMessage({ type: "success", text: "Profile updated successfully!" });
      setTimeout(() => { setIsEditing(false); setMessage({ type: "", text: "" }); }, 1200);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to update profile",
      });
    } finally {
      setSaving(false);
    }
  };

  const userInitials = (user?.fullName || "Candidate")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  // Handle profile photo enrollment
  const handleEnroll = async (file, descriptorArray) => {
    if (!token) return;
    setPhotoUploading(true);
    setPhotoMessage({ type: "", text: "" });
    try {
      const formData = new FormData();
      formData.append("profilePhoto", file);
      formData.append("faceDescriptor", JSON.stringify(descriptorArray));

      await axios.post(`${API_BASE_URL}/auth/profile/photo`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      await refreshUser();
      setShowEnrollment(false);
      setPhotoMessage({ type: "success", text: "Profile photo enrolled successfully. You can now start AI interviews." });
      setTimeout(() => setPhotoMessage({ type: "", text: "" }), 4000);
    } catch (err) {
      setPhotoMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to upload profile photo. Please try again.",
      });
    } finally {
      setPhotoUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#F5F5F5]">Profile</h1>
        <p className="text-[13px] text-[#A1A1AA] mt-0.5">Manage your personal information.</p>
      </div>

      {/* ── PROFILE PHOTO CARD ── */}
      <div className="saas-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[14px] font-semibold text-[#F5F5F5] flex items-center gap-2">
              <Camera className="h-4 w-4 text-[#8B5CF6]" />
              Profile Photo
            </h3>
            <p className="text-[11px] text-[#71717A] mt-0.5">
              Required for AI Interview &bull; Used for session identity verification
            </p>
          </div>
          {user?.hasFaceDescriptor && !showEnrollment && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#22C55E]/25 bg-[#22C55E]/08 px-3 py-1.5 text-[11px] font-semibold text-[#22C55E]">
              <ShieldCheck className="h-3.5 w-3.5" />
              Enrolled
            </span>
          )}
          {!user?.hasFaceDescriptor && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#F59E0B]/25 bg-[#F59E0B]/08 px-3 py-1.5 text-[11px] font-semibold text-[#F59E0B]">
              <ShieldAlert className="h-3.5 w-3.5" />
              Required
            </span>
          )}
        </div>

        {/* Photo message */}
        {photoMessage.text && (
          <div className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-[12px] font-medium ${
            photoMessage.type === "success"
              ? "border-[#22C55E]/20 bg-[#22C55E]/08 text-[#22C55E]"
              : "border-[#EF4444]/20 bg-[#EF4444]/08 text-[#EF4444]"
          }`}>
            {photoMessage.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
            )}
            {photoMessage.text}
          </div>
        )}

        {/* Enrolled state: show photo + re-enroll option */}
        {user?.profileImage && !showEnrollment && (
          <div className="flex items-center gap-4">
            <img
              src={user.profileImage}
              alt="Profile photo"
              className="h-20 w-20 rounded-xl object-cover border border-[rgba(255,255,255,0.08)] flex-shrink-0"
            />
            <div className="space-y-2">
              <p className="text-[12px] text-[#A1A1AA]">
                {user.hasFaceDescriptor
                  ? "✓ Face enrolled for interview verification."
                  : "Photo uploaded but face not enrolled. Please re-upload."}
              </p>
              {user.faceEnrolledAt && (
                <p className="text-[10px] text-[#71717A]">
                  Enrolled {new Date(user.faceEnrolledAt).toLocaleDateString()}
                </p>
              )}
              <button
                type="button"
                onClick={() => setShowEnrollment(true)}
                className="btn-secondary inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-medium"
              >
                <Camera className="h-3.5 w-3.5 text-[#8B5CF6]" />
                Change Photo
              </button>
            </div>
          </div>
        )}

        {/* No photo or re-enrolling: show enrollment panel */}
        {(!user?.profileImage || showEnrollment) && (
          <>
            {showEnrollment && (
              <button
                type="button"
                onClick={() => setShowEnrollment(false)}
                className="text-[11px] text-[#71717A] hover:text-[#A1A1AA] transition flex items-center gap-1"
              >
                ← Keep current photo
              </button>
            )}
            <FaceEnrollmentPanel
              onEnroll={handleEnroll}
              isUploading={photoUploading}
            />
          </>
        )}
      </div>

      {/* ── PROFILE CARD ── */}
      <div className="saas-card rounded-2xl p-6 space-y-6">
        {/* Avatar + Name Row */}
        <div className="flex items-center justify-between gap-4 pb-5 border-b border-[rgba(255,255,255,0.07)]">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#6366F1] text-xl font-bold text-white shadow-lg shadow-purple-900/20">
              {userInitials}
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-[#F5F5F5]">
                {user?.fullName || "Candidate"}
              </h2>
              <p className="text-[12px] text-[#71717A]">{user?.email}</p>
            </div>
          </div>
          {!isEditing && (
            <button
              type="button"
              onClick={handleEditClick}
              className="btn-secondary inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[12px] font-medium"
            >
              <Edit2 className="h-3.5 w-3.5 text-[#8B5CF6]" />
              Edit Profile
            </button>
          )}
        </div>

        {/* Status Message */}
        {message.text && (
          <div
            className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-[13px] font-medium ${
              message.type === "success"
                ? "border-[#22C55E]/20 bg-[#22C55E]/08 text-[#22C55E]"
                : "border-[#EF4444]/20 bg-[#EF4444]/08 text-[#EF4444]"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
            )}
            {message.text}
          </div>
        )}

        {/* View Mode */}
        {!isEditing ? (
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[#71717A] mb-3">
              Personal Information
            </h3>
            <InfoRow label="Full Name" value={user?.fullName} icon={User} />
            <InfoRow label="Email Address" value={user?.email} icon={Mail} />
            <InfoRow label="Mobile Number" value={user?.mobile} icon={Phone} />
            <InfoRow label="Designation / Role" value={user?.designation} icon={Briefcase} />
            {/* Bio */}
            <div className="pt-3.5">
              <p className="text-[11px] font-medium text-[#71717A] mb-1.5">Bio</p>
              <p className="text-[13px] text-[#A1A1AA] leading-relaxed">
                {user?.bio || (
                  <span className="text-[#71717A]">
                    No bio provided. Click Edit Profile to add a summary.
                  </span>
                )}
              </p>
            </div>
          </div>
        ) : (
          /* Edit Mode */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-[12px] font-medium text-[#A1A1AA] mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData((p) => ({ ...p, fullName: e.target.value }))}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#A1A1AA] mb-1.5">
                  Email (read-only)
                </label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="input-field opacity-50 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#A1A1AA] mb-1.5">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={(e) => setFormData((p) => ({ ...p, mobile: e.target.value }))}
                  placeholder="+1 555-0199"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#A1A1AA] mb-1.5">
                  Designation / Role
                </label>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={(e) => setFormData((p) => ({ ...p, designation: e.target.value }))}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="input-field"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-semibold disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="btn-secondary inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-medium"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ── WHATSAPP ── */}
      <div className="saas-card rounded-2xl p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-[#22C55E]" />
              <h3 className="text-[14px] font-semibold text-[#F5F5F5]">WhatsApp Notifications</h3>
            </div>
            <p className="text-[12px] text-[#A1A1AA]">
              Receive interview reminders and score reports on WhatsApp.
            </p>
          </div>

          {user?.whatsappPhone ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#22C55E]/25 bg-[#22C55E]/08 px-3 py-1.5 text-[11px] font-semibold text-[#22C55E] flex-shrink-0">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Connected ({user.whatsappPhone})
            </span>
          ) : (
            <button
              onClick={handleGenerateWaCode}
              disabled={generatingCode}
              className="btn-primary inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[12px] font-semibold disabled:opacity-60 flex-shrink-0"
            >
              {generatingCode ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <MessageSquare className="h-3.5 w-3.5" />
              )}
              {generatingCode ? "Generating..." : "Connect WhatsApp"}
            </button>
          )}
        </div>
      </div>

      {/* ── WHATSAPP MODAL ── */}
      {isWaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-[rgba(255,255,255,0.10)] bg-[#0A0A0A] p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] pb-3">
              <h4 className="text-[14px] font-bold text-[#F5F5F5]">Connect WhatsApp</h4>
              <button
                onClick={() => setIsWaModalOpen(false)}
                className="text-[#71717A] hover:text-[#F5F5F5] transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-[12px] text-[#A1A1AA]">
                Send this code to the MockMate WhatsApp bot to verify your account.
              </p>

              <div className="flex items-center justify-between rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#151515] p-4">
                <span className="font-mono text-2xl font-bold tracking-widest text-[#8B5CF6]">
                  {waCode}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="btn-secondary inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-[#22C55E]" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#71717A]">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-[#8B5CF6]" />
                  Expires in:
                </div>
                <span className="font-mono font-bold text-[#F5F5F5]">
                  {formatTimer(waExpiresIn)}
                </span>
              </div>

              {waError && (
                <div className="rounded-xl border border-[#EF4444]/20 bg-[#EF4444]/08 p-3 text-[12px] text-[#EF4444]">
                  {waError}
                </div>
              )}
              {waSuccess && (
                <div className="rounded-xl border border-[#22C55E]/20 bg-[#22C55E]/08 p-3 text-[12px] text-[#22C55E]">
                  {waSuccess}
                </div>
              )}
            </div>

            <button
              onClick={handleCheckConnection}
              disabled={checkingConnection}
              className="btn-primary w-full rounded-xl py-2.5 text-[13px] font-semibold disabled:opacity-60"
            >
              {checkingConnection ? "Verifying..." : "Check Connection"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfileTab;

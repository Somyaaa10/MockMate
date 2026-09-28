import { useState, useEffect } from "react";
import {
  Briefcase,
  Camera,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Edit2,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  ShieldAlert,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config/config";
import FaceEnrollmentPanel from "./interview/FaceEnrollmentPanel";
import { Alert, Card, CardHeader } from "./dashboard/DashboardPrimitives";

/* ------------------------------------------------------------------
   Read-only value field matching Screenshot 3
   ------------------------------------------------------------------ */
function ReadonlyField({ label, value, placeholder }) {
  return (
    <div className="min-w-0">
      <label className="mb-2 block text-[13px] font-medium text-[var(--mm-text-3)]">
        {label}
      </label>
      <div className="flex min-h-[48px] items-center rounded-xl border border-[var(--mm-border)] bg-[var(--mm-bg)] px-4 py-3 text-[14px] font-medium text-[var(--mm-text)]">
        {value || placeholder || "Not provided"}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------
   Editable field
   ------------------------------------------------------------------ */
function EditField({ label, children, hint }) {
  return (
    <div className="min-w-0">
      <label className="mb-2 block text-[13px] font-medium text-[var(--mm-text-3)]">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-[11px] text-[var(--mm-text-3)]">{hint}</p>}
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
    } catch {
      setWaError("Failed to generate WhatsApp linking code.");
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
        setTimeout(() => {
          setIsWaModalOpen(false);
          setWaSuccess(null);
        }, 1500);
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

  const handleCancel = () => {
    setIsEditing(false);
    setMessage({ type: "", text: "" });
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
      setTimeout(() => {
        setIsEditing(false);
        setMessage({ type: "", text: "" });
      }, 1200);
    } catch {
      setMessage({ type: "error", text: "Failed to update profile." });
    } finally {
      setSaving(false);
    }
  };

  // Handle profile photo enrollment
  const handleEnroll = async (file, descriptorArray) => {
    if (!token) return;
    setPhotoUploading(true);
    setPhotoMessage({ type: "", text: "" });
    try {
      const fd = new FormData();
      fd.append("profilePhoto", file);
      fd.append("faceDescriptor", JSON.stringify(descriptorArray));

      await axios.post(`${API_BASE_URL}/auth/profile/photo`, fd, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      await refreshUser();
      setShowEnrollment(false);
      setPhotoMessage({
        type: "success",
        text: "Profile photo enrolled successfully. You can now start AI interviews.",
      });
      setTimeout(() => setPhotoMessage({ type: "", text: "" }), 4000);
    } catch {
      setPhotoMessage({
        type: "error",
        text: "Failed to upload profile photo. Please try again.",
      });
    } finally {
      setPhotoUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* ── PROFILE INFORMATION ── */}
      <Card className="overflow-hidden">
        {/* Card header matching Screenshot 3 */}
        <div className="flex flex-col gap-4 border-b border-[var(--mm-border)] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div className="flex min-w-0 items-center gap-4">
            <span
              className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[var(--mm-card-2)] text-[#EC4899]"
              aria-hidden="true"
            >
              <User className="h-7 w-7" />
            </span>
            <div className="min-w-0">
              <h1 className="font-display truncate text-[20px] font-bold text-[var(--mm-text)] sm:text-[22px]">
                Profile Information
              </h1>
              <p className="mt-1 truncate text-[13px] text-[var(--mm-text-2)]">
                Manage your personal details
              </p>
            </div>
          </div>

          {!isEditing && (
            <button
              type="button"
              onClick={handleEditClick}
              className="flex shrink-0 items-center gap-2 rounded-xl border border-[var(--mm-border)] bg-[var(--mm-card-2)] px-4 py-2.5 text-[13px] font-semibold text-[var(--mm-text)] transition-colors hover:bg-[var(--mm-card-3)]"
            >
              <Edit2 className="h-4 w-4" aria-hidden="true" />
              Edit Profile
            </button>
          )}
        </div>

        <div className="p-6 sm:p-7">
          {/* Status message */}
          {message.text && (
            <Alert
              tone={message.type === "success" ? "success" : "error"}
              onDismiss={() => setMessage({ type: "", text: "" })}
              className="mb-5"
            >
              {message.text}
            </Alert>
          )}

          {/* ---------- View mode ---------- */}
          {!isEditing ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <ReadonlyField label="Full Name" value={user?.fullName} />
              <ReadonlyField label="Email Address" value={user?.email} />
              <ReadonlyField label="Mobile Number" value={user?.mobile} />
              <ReadonlyField label="Designation" value={user?.designation} />
              <div className="min-w-0 sm:col-span-2">
                <ReadonlyField
                  label="Bio"
                  value={user?.bio}
                  placeholder="No bio provided"
                />
              </div>
            </div>
          ) : (
            /* ---------- Edit mode ---------- */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <EditField label="Full Name" icon={User}>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, fullName: e.target.value }))
                    }
                    className="input-field w-full px-3.5 py-2.5 text-[13.5px]"
                    required
                  />
                </EditField>

                <EditField label="Email Address" icon={Mail} hint="Email cannot be changed">
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="input-field w-full cursor-not-allowed px-3.5 py-2.5 text-[13.5px]"
                  />
                </EditField>

                <EditField label="Mobile Number" icon={Phone}>
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, mobile: e.target.value }))
                    }
                    placeholder="+1 555-0199"
                    className="input-field w-full px-3.5 py-2.5 text-[13.5px]"
                  />
                </EditField>

                <EditField label="Designation" icon={Briefcase}>
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, designation: e.target.value }))
                    }
                    placeholder="e.g. Senior Frontend Engineer"
                    className="input-field w-full px-3.5 py-2.5 text-[13.5px]"
                  />
                </EditField>
              </div>

              <div className="flex flex-col gap-2.5 border-t border-[var(--mm-border)] pt-5 sm:flex-row">
                <button
                  type="submit"
                  disabled={saving}
                  className="mm-btn mm-btn-primary px-5 py-2.5 text-[13px]"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  )}
                  {saving ? "Saving…" : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="mm-btn mm-btn-ghost px-4 py-2.5 text-[13px]"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </Card>

      {/* ── PROFILE PHOTO ── */}
      <Card className="p-5 sm:p-6">
        <CardHeader
          icon={Camera}
          title="Profile Photo"
          subtitle="Required for AI Interview & identity verification"
          action={
            user?.hasFaceDescriptor ? (
              <span className="mm-badge shrink-0 !border-[rgba(16,185,129,0.30)] !bg-[rgba(16,185,129,0.10)] !text-[#34D399]">
                <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                Enrolled
              </span>
            ) : (
              <span className="mm-badge shrink-0 !border-[rgba(245,158,11,0.30)] !bg-[rgba(245,158,11,0.10)] !text-[#FBBF24]">
                <ShieldAlert className="h-3 w-3" aria-hidden="true" />
                Required
              </span>
            )
          }
        />

        {photoMessage.text && (
          <Alert
            tone={photoMessage.type === "success" ? "success" : "error"}
            onDismiss={() => setPhotoMessage({ type: "", text: "" })}
            className="mt-4"
          >
            {photoMessage.text}
          </Alert>
        )}

        {user?.profileImage && !showEnrollment && (
          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center">
            <img
              src={user.profileImage}
              alt="Profile photo"
              className="h-20 w-20 shrink-0 rounded-2xl border border-[var(--mm-border)] object-cover"
            />
            <div className="min-w-0">
              <p className="text-[12.5px] leading-relaxed text-[var(--mm-text-2)]">
                {user.hasFaceDescriptor
                  ? "Face enrolled for interview verification."
                  : "Photo uploaded but face not enrolled. Please re-upload."}
              </p>
              {user.faceEnrolledAt && (
                <p className="mt-1 text-[11px] text-[var(--mm-text-3)]">
                  Enrolled{" "}
                  {new Date(user.faceEnrolledAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              )}
              <button
                type="button"
                onClick={() => setShowEnrollment(true)}
                className="mm-btn mm-btn-ghost mt-3 px-3.5 py-2 text-[12px]"
              >
                <Camera className="h-3.5 w-3.5" aria-hidden="true" />
                Change Photo
              </button>
            </div>
          </div>
        )}

        {(!user?.profileImage || showEnrollment) && (
          <div className="mt-5">
            {showEnrollment && (
              <button
                type="button"
                onClick={() => setShowEnrollment(false)}
                className="mb-3 inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--mm-text-3)] transition-colors hover:text-[var(--mm-text-2)]"
              >
                ← Keep current photo
              </button>
            )}
            <FaceEnrollmentPanel
              onEnroll={handleEnroll}
              isUploading={photoUploading}
            />
          </div>
        )}
      </Card>

      {/* ── WHATSAPP ── */}
      <Card className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <CardHeader
              icon={MessageSquare}
              accent="#34D399"
              title="WhatsApp Notifications"
              subtitle="Receive interview reminders and score reports on WhatsApp"
            />
          </div>

          {user?.whatsappPhone ? (
            <span className="mm-badge shrink-0 !border-[rgba(16,185,129,0.30)] !bg-[rgba(16,185,129,0.10)] !text-[#34D399]">
              <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
              Connected ({user.whatsappPhone})
            </span>
          ) : (
            <button
              type="button"
              onClick={handleGenerateWaCode}
              disabled={generatingCode}
              className="mm-btn mm-btn-primary shrink-0 px-4 py-2.5 text-[12.5px]"
            >
              {generatingCode ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              {generatingCode ? "Generating…" : "Connect WhatsApp"}
            </button>
          )}
        </div>
      </Card>

      {/* ── WHATSAPP MODAL ── */}
      {isWaModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Connect WhatsApp"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsWaModalOpen(false);
          }}
        >
          <div className="mm-card w-full max-w-sm space-y-5 p-6 shadow-[0_40px_90px_-40px_rgba(0,0,0,0.95)]">
            <div className="flex items-center justify-between border-b border-[var(--mm-border)] pb-3.5">
              <h4 className="font-display text-[15px] font-bold text-[var(--mm-text)]">
                Connect WhatsApp
              </h4>
              <button
                type="button"
                onClick={() => setIsWaModalOpen(false)}
                className="text-[var(--mm-text-3)] transition-colors hover:text-[var(--mm-text)]"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-[12.5px] leading-relaxed text-[var(--mm-text-2)]">
                Send this code to the MockMate WhatsApp bot to verify your account.
              </p>

              <div className="flex items-center justify-between rounded-xl border border-[var(--mm-border)] bg-[var(--mm-bg)] p-4">
                <span className="font-mono text-2xl font-bold tracking-widest text-[var(--mm-text)]">
                  {waCode}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="mm-btn mm-btn-ghost px-3 py-1.5 text-[11.5px]"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>

              <div className="flex items-center justify-between text-[11.5px] text-[var(--mm-text-3)]">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  Expires in
                </span>
                <span className="font-mono font-bold text-[var(--mm-text)]">
                  {formatTimer(waExpiresIn)}
                </span>
              </div>

              {waError && <Alert tone="error">{waError}</Alert>}
              {waSuccess && <Alert tone="success">{waSuccess}</Alert>}
            </div>

            <button
              type="button"
              onClick={handleCheckConnection}
              disabled={checkingConnection}
              className="mm-btn mm-btn-primary w-full py-2.5 text-[13px]"
            >
              {checkingConnection ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              {checkingConnection ? "Verifying…" : "Check Connection"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfileTab;

import { AlertTriangle, Camera, Users, VideoOff, ShieldAlert, X } from "lucide-react";

const VIOLATION_CONFIG = {
  NO_PERSON: {
    icon: Camera,
    title: "Camera Check",
    color: "text-[#F59E0B]",
    border: "border-[#F59E0B]/30",
    bg: "bg-[#F59E0B]/08",
  },
  MULTIPLE_PEOPLE: {
    icon: Users,
    title: "Multiple People Detected",
    color: "text-[#F59E0B]",
    border: "border-[#F59E0B]/30",
    bg: "bg-[#F59E0B]/08",
  },
  CAMERA_DISABLED: {
    icon: VideoOff,
    title: "Camera Turned Off",
    color: "text-[#F59E0B]",
    border: "border-[#F59E0B]/30",
    bg: "bg-[#F59E0B]/08",
  },
  IDENTITY_MISMATCH: {
    icon: ShieldAlert,
    title: "Identity Check Failed",
    color: "text-[#F59E0B]",
    border: "border-[#F59E0B]/30",
    bg: "bg-[#F59E0B]/08",
  },
};

/**
 * CameraWarningBanner
 * Non-blocking amber banner displayed during an active integrity violation.
 * Does NOT cover the interview UI — rendered at top of the interview page.
 */
export default function CameraWarningBanner({
  violationType,
  message,
  warningCount,
  maxWarnings = 3,
  onCameraEnable,
}) {
  if (!violationType) return null;

  const config = VIOLATION_CONFIG[violationType] || VIOLATION_CONFIG.NO_PERSON;
  const Icon = config.icon;
  const isLastWarning = warningCount >= maxWarnings - 1;

  return (
    <div
      className={`
        flex items-start justify-between gap-3 rounded-xl border px-4 py-3
        text-sm transition-all duration-300 animate-slideDown
        ${isLastWarning ? "border-[#EF4444]/40 bg-[#EF4444]/10" : `${config.border} ${config.bg}`}
      `}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <Icon
          className={`h-4 w-4 mt-0.5 shrink-0 ${isLastWarning ? "text-[#EF4444]" : config.color}`}
        />
        <div className="min-w-0">
          <p className={`text-xs font-bold ${isLastWarning ? "text-[#EF4444]" : config.color}`}>
            ⚠ {config.title}
          </p>
          <p className="text-[11px] text-[#A1A1AA] mt-0.5 leading-relaxed">
            {message}
          </p>
          {violationType === "CAMERA_DISABLED" && onCameraEnable && (
            <button
              type="button"
              onClick={onCameraEnable}
              className="mt-1.5 text-[11px] font-semibold text-[#8B5CF6] hover:text-[#A78BFA] underline"
            >
              Turn Camera On
            </button>
          )}
        </div>
      </div>

      {/* Warning count badge */}
      <div
        className={`
          flex-shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold
          ${isLastWarning
            ? "border border-[#EF4444]/40 bg-[#EF4444]/20 text-[#EF4444]"
            : "border border-[#F59E0B]/40 bg-[#F59E0B]/15 text-[#F59E0B]"
          }
        `}
      >
        Warning {warningCount} / {maxWarnings}
      </div>
    </div>
  );
}

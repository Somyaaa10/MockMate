import { useState, useEffect, useRef, useCallback } from "react";
import {
  Camera,
  Mic,
  User,
  Shield,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  Video,
  VideoOff,
  ExternalLink,
  ShieldCheck,
  Eye,
} from "lucide-react";
import { detectFaces, matchDescriptor, loadModels } from "../../utils/faceApi";

/**
 * PreJoinCheck
 * 6-step verification before entering the AI interview room.
 *
 * Steps:
 *   1. Camera access
 *   2. Microphone access
 *   3. One person detected
 *   4. Liveness check (movement-based)
 *   5. Face verification vs enrolled descriptor
 *   6. Profile photo present
 *
 * Privacy disclosure is shown BEFORE checks begin.
 */

const CHECK_IDLE = "idle";
const CHECK_RUNNING = "running";
const CHECK_PASS = "pass";
const CHECK_FAIL = "fail";

const initialChecks = {
  camera: CHECK_IDLE,
  microphone: CHECK_IDLE,
  presence: CHECK_IDLE,
  liveness: CHECK_IDLE,
  identity: CHECK_IDLE,
  profile: CHECK_IDLE,
};

function CheckRow({ label, status, detail, icon: Icon }) {
  const statusConfig = {
    [CHECK_IDLE]: { dot: "bg-[#262626]", text: "text-[#71717A]", label: "Pending" },
    [CHECK_RUNNING]: { dot: "bg-[#8B5CF6] animate-pulse", text: "text-[#A1A1AA]", label: "Checking..." },
    [CHECK_PASS]: { dot: "bg-[#22C55E]", text: "text-[#22C55E]", label: "Ready" },
    [CHECK_FAIL]: { dot: "bg-[#EF4444]", text: "text-[#EF4444]", label: "Failed" },
  };
  const cfg = statusConfig[status] || statusConfig[CHECK_IDLE];

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-[rgba(255,255,255,0.06)] last:border-0">
      <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${cfg.dot}`} />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-[#F5F5F5]">{label}</p>
        {detail && (
          <p className={`text-[11px] mt-0.5 ${cfg.text}`}>{detail}</p>
        )}
      </div>
      <div className="shrink-0">
        {status === CHECK_RUNNING && <Loader2 className="h-4 w-4 animate-spin text-[#8B5CF6]" />}
        {status === CHECK_PASS && <CheckCircle2 className="h-4 w-4 text-[#22C55E]" />}
        {status === CHECK_FAIL && <XCircle className="h-4 w-4 text-[#EF4444]" />}
      </div>
    </div>
  );
}

export default function PreJoinCheck({
  enrolledDescriptor,
  hasProfilePhoto,
  onProceed,
  onCancel,
}) {
  const [disclosureAccepted, setDisclosureAccepted] = useState(false);
  const [checks, setChecks] = useState(initialChecks);
  const [checkDetails, setCheckDetails] = useState({});
  const [running, setRunning] = useState(false);
  const [allPassed, setAllPassed] = useState(false);
  const [stream, setStream] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const setCheck = useCallback((key, status, detail) => {
    if (!isMountedRef.current) return;
    setChecks(prev => ({ ...prev, [key]: status }));
    if (detail !== undefined) {
      setCheckDetails(prev => ({ ...prev, [key]: detail }));
    }
  }, []);

  const runChecks = useCallback(async () => {
    setRunning(true);
    setChecks(initialChecks);
    setCheckDetails({});
    setAllPassed(false);

    // Stop previous stream if any
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }

    // ── Step 1: Camera ──────────────────────────────────────────────
    setCheck("camera", CHECK_RUNNING, "Requesting camera access...");
    let mediaStream;
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = mediaStream;

      const hasVideo = mediaStream.getVideoTracks().length > 0;
      const hasAudio = mediaStream.getAudioTracks().length > 0;

      setCheck("camera", hasVideo ? CHECK_PASS : CHECK_FAIL,
        hasVideo ? "Camera detected" : "No camera found");
      setCheck("microphone", hasAudio ? CHECK_PASS : CHECK_FAIL,
        hasAudio ? "Microphone detected" : "No microphone found");

      if (!hasVideo) {
        setRunning(false);
        return;
      }

      // Attach stream to video element
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await new Promise((resolve) => {
          videoRef.current.onloadedmetadata = resolve;
          setTimeout(resolve, 2000); // fallback
        });
      }
    } catch (err) {
      const msg = err.name === "NotAllowedError"
        ? "Permission denied. Allow camera in browser settings."
        : "Camera/mic not found.";
      setCheck("camera", CHECK_FAIL, msg);
      setCheck("microphone", CHECK_FAIL, "");
      setRunning(false);
      return;
    }

    // ── Step 2: Mic (done above) ────────────────────────────────────

    // ── Step 3: Load models + presence ─────────────────────────────
    setCheck("presence", CHECK_RUNNING, "Loading face detection models...");
    try {
      await loadModels();
    } catch {
      setCheck("presence", CHECK_FAIL, "Failed to load face detection models.");
      setRunning(false);
      return;
    }

    // Wait for video to be ready
    await new Promise(r => setTimeout(r, 1500));

    setCheck("presence", CHECK_RUNNING, "Detecting faces...");
    let presenceFaces = [];
    try {
      if (videoRef.current) {
        presenceFaces = await detectFaces(videoRef.current);
      }
    } catch (err) {
      setCheck("presence", CHECK_FAIL, "Face detection error.");
      setRunning(false);
      return;
    }

    if (presenceFaces.length === 0) {
      setCheck("presence", CHECK_FAIL, "No person detected. Sit in front of your camera.");
      setRunning(false);
      return;
    }
    if (presenceFaces.length > 1) {
      setCheck("presence", CHECK_FAIL, `${presenceFaces.length} people detected. Only you should be visible.`);
      setRunning(false);
      return;
    }
    setCheck("presence", CHECK_PASS, "One person detected ✓");

    // ── Step 4: Liveness (movement check) ──────────────────────────
    setCheck("liveness", CHECK_RUNNING, "Please nod your head slightly…");

    let livenessOk = false;
    try {
      // Sample face landmarks at t=0 and t=2500ms, check nose-tip movement
      const snap1 = await detectFaces(videoRef.current);
      await new Promise(r => setTimeout(r, 2500));
      const snap2 = await detectFaces(videoRef.current);

      if (snap1.length === 1 && snap2.length === 1) {
        const nose1 = snap1[0].landmarks.getNose()[3]; // nose tip
        const nose2 = snap2[0].landmarks.getNose()[3];
        const delta = Math.abs(nose1.y - nose2.y) + Math.abs(nose1.x - nose2.x);
        livenessOk = delta > 2; // at least 2px movement detected
      }
    } catch {
      livenessOk = true; // fail-open for liveness (don't block user on detection error)
    }

    setCheck("liveness", livenessOk ? CHECK_PASS : CHECK_FAIL,
      livenessOk ? "Liveness confirmed ✓" : "No movement detected. Please nod your head.");

    if (!livenessOk) {
      setRunning(false);
      return;
    }

    // ── Step 5: Face verification ───────────────────────────────────
    if (enrolledDescriptor && Array.isArray(enrolledDescriptor) && enrolledDescriptor.length === 128) {
      setCheck("identity", CHECK_RUNNING, "Verifying your identity...");
      try {
        const snapshot = await detectFaces(videoRef.current);
        if (snapshot.length === 1) {
          const { matched, distance } = matchDescriptor(
            snapshot[0].descriptor,
            enrolledDescriptor,
            0.55
          );
          setCheck(
            "identity",
            matched ? CHECK_PASS : CHECK_FAIL,
            matched
              ? `Identity verified ✓ (confidence: ${((1 - distance) * 100).toFixed(0)}%)`
              : `Verification failed (distance: ${distance}). Ensure good lighting and face the camera directly.`
          );
          if (!matched) {
            setRunning(false);
            return;
          }
        } else {
          setCheck("identity", CHECK_FAIL, "Could not get a clear face for verification. Try again.");
          setRunning(false);
          return;
        }
      } catch {
        setCheck("identity", CHECK_FAIL, "Verification error. Please try again.");
        setRunning(false);
        return;
      }
    } else {
      setCheck("identity", CHECK_FAIL, "No enrolled face. Please add a profile photo first.");
      setRunning(false);
      return;
    }

    // ── Step 6: Profile photo ───────────────────────────────────────
    setCheck("profile", hasProfilePhoto ? CHECK_PASS : CHECK_FAIL,
      hasProfilePhoto ? "Profile photo available ✓" : "Profile photo required");

    if (!hasProfilePhoto) {
      setRunning(false);
      return;
    }

    // ── All passed ──────────────────────────────────────────────────
    setAllPassed(true);
    setRunning(false);
  }, [enrolledDescriptor, hasProfilePhoto, setCheck]);

  const handleProceed = useCallback(() => {
    // Keep stream alive — pass it to parent so interview can reuse it
    onProceed({ stream: streamRef.current });
    streamRef.current = null; // Prevent cleanup from stopping it
  }, [onProceed]);

  if (!disclosureAccepted) {
    return (
      <div className="space-y-5">
        {/* Privacy disclosure */}
        <div className="rounded-xl border border-[rgba(139,92,246,0.25)] bg-[rgba(139,92,246,0.05)] p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-[#8B5CF6]" />
            <h4 className="text-[13px] font-bold text-[#F5F5F5]">Camera Monitoring Notice</h4>
          </div>
          <div className="space-y-2 text-[12px] text-[#A1A1AA] leading-relaxed">
            <p>MockMate uses camera monitoring during this interview session to verify:</p>
            <ul className="list-disc list-inside space-y-1 pl-1">
              <li>You are present and visible in the camera frame</li>
              <li>Only one person is visible at any time</li>
              <li>The person visible is consistent with your enrolled profile</li>
            </ul>
            <p className="pt-1">
              <span className="font-semibold text-[#F5F5F5]">Your camera feed is processed locally</span> in
              your browser — no video is uploaded to our servers. Three confirmed violations
              will flag this session for <span className="font-semibold text-[#F5F5F5]">manual review only</span>,
              not automatic disqualification.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#101010] py-2.5 text-xs font-semibold text-[#A1A1AA] hover:bg-[#151515] hover:text-[#F5F5F5] transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => { setDisclosureAccepted(true); runChecks(); }}
            className="flex-1 btn-primary rounded-xl py-2.5 text-xs font-bold"
          >
            <ShieldCheck className="h-4 w-4 inline mr-1.5" />
            I Understand — Start Check
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Live camera preview */}
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-[#000000] border border-[rgba(255,255,255,0.08)]">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="h-full w-full object-cover"
        />
        {checks.camera !== CHECK_PASS && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0A0A0A]/90">
            {running ? (
              <Loader2 className="h-8 w-8 animate-spin text-[#8B5CF6] mb-2" />
            ) : (
              <VideoOff className="h-8 w-8 text-[#71717A] mb-2" />
            )}
            <p className="text-xs text-[#71717A]">
              {running ? "Starting camera..." : "Camera not available"}
            </p>
          </div>
        )}
        <div className="absolute bottom-2 left-2 rounded-md border border-[rgba(255,255,255,0.08)] bg-[#000000]/80 px-2 py-1 text-[10px] font-semibold text-[#A1A1AA]">
          Verification Preview
        </div>
      </div>

      {/* Check list */}
      <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#101010] px-4 py-2 divide-y divide-[rgba(255,255,255,0.06)]">
        <CheckRow label="Camera" status={checks.camera} detail={checkDetails.camera} />
        <CheckRow label="Microphone" status={checks.microphone} detail={checkDetails.microphone} />
        <CheckRow label="One person detected" status={checks.presence} detail={checkDetails.presence} />
        <CheckRow label="Liveness check" status={checks.liveness} detail={checkDetails.liveness} />
        <CheckRow label="Identity verification" status={checks.identity} detail={checkDetails.identity} />
        <CheckRow label="Profile photo" status={checks.profile} detail={checkDetails.profile} />
      </div>

      {/* Error details (if any fail) */}
      {!running && !allPassed && Object.values(checks).some(v => v === CHECK_FAIL) && (
        <div className="flex items-start gap-2 rounded-xl border border-[#EF4444]/25 bg-[#EF4444]/08 p-3 text-xs text-[#EF4444]">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>Some checks failed. Fix the issues above and try again.</span>
        </div>
      )}

      {/* Settings link */}
      <a
        href="chrome://settings/content/camera"
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-1.5 text-[11px] text-[#71717A] hover:text-[#A1A1AA] transition"
        onClick={(e) => e.preventDefault() || window.open("chrome://settings/content/camera")}
      >
        <ExternalLink className="h-3 w-3" />
        Camera &amp; Microphone Settings
      </a>

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#101010] py-2.5 text-xs font-semibold text-[#A1A1AA] hover:bg-[#151515] hover:text-[#F5F5F5] transition"
        >
          Cancel
        </button>

        {!allPassed && !running && (
          <button
            type="button"
            onClick={runChecks}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#151515] py-2.5 text-xs font-bold text-[#F5F5F5] hover:bg-[#1A1A1A] transition"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry Checks
          </button>
        )}

        {allPassed && (
          <button
            type="button"
            onClick={handleProceed}
            className="flex-1 flex items-center justify-center gap-2 btn-primary rounded-xl py-2.5 text-xs font-bold"
          >
            <Shield className="h-3.5 w-3.5" />
            Continue to Interview
          </button>
        )}

        {running && (
          <button
            type="button"
            disabled
            className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#101010] py-2.5 text-xs font-bold text-[#71717A] opacity-70 cursor-not-allowed"
          >
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Running Checks...
          </button>
        )}
      </div>
    </div>
  );
}

// Missing import fix
function RefreshCw({ className }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
      <path d="M21 3v5h-5"/>
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
      <path d="M8 16H3v5"/>
    </svg>
  );
}

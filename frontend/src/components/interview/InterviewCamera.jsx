import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Video, VideoOff, AlertCircle } from "lucide-react";

/**
 * InterviewCamera
 * Renders the candidate's camera preview during the interview.
 *
 * Props:
 *  - videoRef: optional external ref to the <video> element (for face monitoring)
 *  - onStreamAcquired(stream): called when media stream is ready
 *  - onCamStatusChange(enabled): called when camera is toggled
 *  - cameraStatus: "ok" | "warning" | null — controls status dot
 */
export default function InterviewCamera({
  videoRef: externalVideoRef,
  onStreamAcquired,
  onCamStatusChange,
  cameraStatus,
}) {
  const internalVideoRef = useRef(null);
  const streamRef = useRef(null);
  const [micEnabled, setMicEnabled] = useState(true);
  const [camEnabled, setCamEnabled] = useState(true);
  const [error, setError] = useState(null);

  // Use external ref if provided (for monitoring), otherwise use internal
  const videoRef = externalVideoRef || internalVideoRef;

  useEffect(() => {
    let isMounted = true;

    const startCamera = async () => {
      try {
        setError(null);
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("INSECURE_OR_UNSUPPORTED");
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        if (onStreamAcquired) {
          onStreamAcquired(stream);
        }
      } catch (err) {
        console.warn("Interview camera initialization error:", err.name, err.message);
        let userMsg = "Camera/microphone access is required for mock interview.";
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          userMsg = "Camera/microphone permission was denied. Please enable in browser settings.";
        } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
          userMsg = "No camera or microphone device found.";
        } else if (err.name === "NotReadableError") {
          userMsg = "Camera/microphone is already in use by another application.";
        }
        if (isMounted) setError(userMsg);
      }
    };

    startCamera();

    return () => {
      isMounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const toggleMic = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !micEnabled;
      });
      setMicEnabled(!micEnabled);
    }
  };

  const enableCamera = () => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = true;
      });
      setCamEnabled(true);
      if (onCamStatusChange) onCamStatusChange(true);
    }
  };

  const toggleCam = () => {
    if (streamRef.current) {
      const newEnabled = !camEnabled;
      streamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = newEnabled;
      });
      setCamEnabled(newEnabled);
      if (onCamStatusChange) onCamStatusChange(newEnabled);
    }
  };

  // Status indicator config
  const statusDot = cameraStatus === "ok"
    ? { color: "bg-[#22C55E]", label: "Camera OK", pulse: false }
    : cameraStatus === "warning"
    ? { color: "bg-[#F59E0B]", label: "Check camera", pulse: true }
    : null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#262626] bg-[#0A0A0A] shadow-2xl">
      {/* Video Container */}
      <div className="relative aspect-video w-full overflow-hidden bg-[#000000]">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`h-full w-full object-cover transition-opacity duration-300 ${
            camEnabled && !error ? "opacity-100" : "opacity-0"
          }`}
        />

        {(!camEnabled || error) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0A0A0A] p-4 text-center">
            {error ? (
              <>
                <AlertCircle className="h-8 w-8 text-[#FBBF24] mb-2" />
                <p className="text-xs font-semibold text-[#FBBF24] max-w-xs">{error}</p>
              </>
            ) : (
              <>
                <VideoOff className="h-8 w-8 text-[#737373] mb-2" />
                <p className="text-xs text-[#A1A1A1] mb-3">Camera Turned Off</p>
                <button
                  type="button"
                  onClick={enableCamera}
                  className="flex items-center gap-1.5 rounded-lg border border-[rgba(139,92,246,0.35)] bg-[rgba(139,92,246,0.1)] px-3 py-1.5 text-xs font-semibold text-[#8B5CF6] hover:bg-[rgba(139,92,246,0.2)] transition"
                >
                  <Video className="h-3.5 w-3.5" />
                  Turn Camera On
                </button>
              </>
            )}
          </div>
        )}

        {/* Candidate label */}
        <div className="absolute bottom-3 left-3 rounded-md border border-[#262626] bg-[#000000]/80 px-2.5 py-1 text-[10px] font-semibold text-[#A1A1A1] backdrop-blur-md">
          You
        </div>

        {/* Camera status dot */}
        {statusDot && (
          <div className="absolute top-2 left-2 flex items-center gap-1.5 rounded-full border border-[rgba(255,255,255,0.08)] bg-[#000000]/75 px-2 py-1 backdrop-blur-sm">
            <span className={`h-1.5 w-1.5 rounded-full ${statusDot.color} ${statusDot.pulse ? "animate-pulse" : ""}`} />
            <span className="text-[9px] font-semibold text-[#A1A1A1]">{statusDot.label}</span>
          </div>
        )}

        {/* Mic & Cam Toggle Controls */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <button
            type="button"
            onClick={toggleMic}
            className={`flex h-8 w-8 items-center justify-center rounded-lg border backdrop-blur-md transition ${
              micEnabled
                ? "border-[#262626] bg-[#000000]/80 text-[#FFFFFF] hover:bg-[#111111]"
                : "border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.10)] text-[#F87171]"
            }`}
            title={micEnabled ? "Mute Microphone" : "Unmute Microphone"}
          >
            {micEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={toggleCam}
            className={`flex h-8 w-8 items-center justify-center rounded-lg border backdrop-blur-md transition ${
              camEnabled
                ? "border-[#262626] bg-[#000000]/80 text-[#FFFFFF] hover:bg-[#111111]"
                : "border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.10)] text-[#F87171]"
            }`}
            title={camEnabled ? "Turn Off Camera" : "Turn On Camera"}
          >
            {camEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}

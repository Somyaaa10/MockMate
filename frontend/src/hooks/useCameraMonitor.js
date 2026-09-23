/**
 * useCameraMonitor — React hook for interview integrity monitoring
 *
 * Monitors the camera video stream continuously during an AI interview.
 * Detects:
 *   - No person visible
 *   - Multiple people visible
 *   - Camera disabled
 *   - Identity mismatch (live face vs enrolled descriptor)
 *
 * Violations:
 *   - 7-second grace period before confirming a violation
 *   - 15-second cooldown between warnings
 *   - 3 confirmed warnings → INTERVIEW_ENDED state
 *
 * Privacy:
 *   - All processing is LOCAL in the browser
 *   - No frames are sent to the server
 *   - Descriptors are used in-memory only
 *
 * Usage:
 *   const { monitorState, warningCount, activeViolation } = useCameraMonitor({
 *     videoRef,
 *     isActive,
 *     enrolledDescriptor,
 *     camEnabled,
 *     onViolationConfirmed,
 *     onInterviewEnded,
 *   });
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { detectFaces, matchDescriptor } from "../utils/faceApi";

// Monitor states
export const MONITOR_STATE = {
  IDLE: "IDLE",
  CAMERA_READY: "CAMERA_READY",
  PERSON_DETECTED: "PERSON_DETECTED",
  NO_PERSON: "NO_PERSON",
  MULTIPLE_PEOPLE: "MULTIPLE_PEOPLE",
  CAMERA_DISABLED: "CAMERA_DISABLED",
  IDENTITY_MISMATCH: "IDENTITY_MISMATCH",
  WARNING: "WARNING",
  INTERVIEW_ENDED: "INTERVIEW_ENDED",
};

const DETECTION_INTERVAL_MS = 15000;  // Run detection every 15 seconds
const GRACE_PERIOD_MS = 7000;         // Violation must persist 7s before counting
const WARNING_COOLDOWN_MS = 15000;    // 15s between confirmed warnings
const MAX_WARNINGS = 3;
const MATCH_THRESHOLD = 0.55;         // Euclidean distance threshold

export default function useCameraMonitor({
  videoRef,
  isActive,
  enrolledDescriptor,
  camEnabled,
  onViolationConfirmed,
  onInterviewEnded,
}) {
  const [monitorState, setMonitorState] = useState(MONITOR_STATE.IDLE);
  const [warningCount, setWarningCount] = useState(0);
  const [activeViolation, setActiveViolation] = useState(null); // { type, message }

  // Internal refs (not state — avoid re-render on every tick)
  const violationStartRef = useRef(null);     // when a violation was first detected
  const lastWarningTimeRef = useRef(0);       // timestamp of last confirmed warning
  const currentViolationTypeRef = useRef(null);
  const warningCountRef = useRef(0);          // mirror of warningCount for closure access
  const intervalRef = useRef(null);
  const isEndedRef = useRef(false);

  // Keep warningCountRef in sync
  useEffect(() => {
    warningCountRef.current = warningCount;
  }, [warningCount]);

  const handleViolationDetected = useCallback((violationType, message) => {
    if (isEndedRef.current) return;

    const now = Date.now();

    // If this is a NEW type of violation, reset the grace period timer
    if (currentViolationTypeRef.current !== violationType) {
      currentViolationTypeRef.current = violationType;
      violationStartRef.current = now;
      setMonitorState(MONITOR_STATE.WARNING);
      setActiveViolation({ type: violationType, message });
      return;
    }

    // Same violation type — check if grace period has elapsed
    if (violationStartRef.current && (now - violationStartRef.current) >= GRACE_PERIOD_MS) {
      // Check cooldown
      if ((now - lastWarningTimeRef.current) < WARNING_COOLDOWN_MS) {
        return; // Still in cooldown, don't count another warning
      }

      // Confirmed violation — increment warning count
      const newCount = warningCountRef.current + 1;
      warningCountRef.current = newCount;
      setWarningCount(newCount);
      lastWarningTimeRef.current = now;
      violationStartRef.current = now; // reset grace for subsequent violations of same type

      if (onViolationConfirmed) {
        onViolationConfirmed({ type: violationType, message, count: newCount });
      }

      if (newCount >= MAX_WARNINGS) {
        isEndedRef.current = true;
        setMonitorState(MONITOR_STATE.INTERVIEW_ENDED);
        setActiveViolation({ type: violationType, message });
        if (onInterviewEnded) {
          onInterviewEnded({ reason: violationType, message, warningCount: newCount });
        }
      }
    }
  }, [onViolationConfirmed, onInterviewEnded]);

  const clearViolation = useCallback(() => {
    if (isEndedRef.current) return;
    currentViolationTypeRef.current = null;
    violationStartRef.current = null;
    setActiveViolation(null);
  }, []);

  const runDetection = useCallback(async () => {
    if (isEndedRef.current || !isActive) return;

    const video = videoRef?.current;

    // Camera disabled check
    if (!camEnabled) {
      handleViolationDetected(
        "CAMERA_DISABLED",
        "Camera is turned off. Please turn your camera back on."
      );
      setMonitorState(MONITOR_STATE.CAMERA_DISABLED);
      return;
    }

    // Video element not ready
    if (!video || video.readyState < 2 || video.paused) {
      return;
    }

    try {
      const detections = await detectFaces(video);
      const faceCount = detections.length;

      if (faceCount === 0) {
        handleViolationDetected(
          "NO_PERSON",
          "We can't see you clearly. Please stay in front of your camera."
        );
        setMonitorState(MONITOR_STATE.NO_PERSON);
        return;
      }

      if (faceCount > 1) {
        handleViolationDetected(
          "MULTIPLE_PEOPLE",
          "Multiple people detected. Only the interview participant should be visible."
        );
        setMonitorState(MONITOR_STATE.MULTIPLE_PEOPLE);
        return;
      }

      // Exactly 1 face — check identity if enrolled descriptor exists
      if (enrolledDescriptor && Array.isArray(enrolledDescriptor) && enrolledDescriptor.length === 128) {
        const liveDescriptor = detections[0].descriptor;
        const { matched, distance } = matchDescriptor(liveDescriptor, enrolledDescriptor, MATCH_THRESHOLD);

        if (!matched) {
          handleViolationDetected(
            "IDENTITY_MISMATCH",
            `Camera shows a different person (distance: ${distance}). Please ensure it is you in front of the camera.`
          );
          setMonitorState(MONITOR_STATE.IDENTITY_MISMATCH);
          return;
        }
      }

      // All checks passed — clear any active violation
      clearViolation();
      setMonitorState(MONITOR_STATE.PERSON_DETECTED);
    } catch (err) {
      // Detection errors are non-critical — don't penalize the user
      console.warn("[CameraMonitor] Detection error (non-critical):", err.message);
    }
  }, [isActive, camEnabled, videoRef, enrolledDescriptor, handleViolationDetected, clearViolation]);

  // Start / stop monitoring loop
  useEffect(() => {
    if (!isActive || isEndedRef.current) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    setMonitorState(MONITOR_STATE.CAMERA_READY);

    // Initial detection after a short delay
    const initialTimeout = setTimeout(() => {
      runDetection();
    }, 3000);

    intervalRef.current = setInterval(runDetection, DETECTION_INTERVAL_MS);

    return () => {
      clearTimeout(initialTimeout);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, runDetection]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isEndedRef.current = true;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    monitorState,
    warningCount,
    activeViolation,
    isEnded: monitorState === MONITOR_STATE.INTERVIEW_ENDED,
  };
}

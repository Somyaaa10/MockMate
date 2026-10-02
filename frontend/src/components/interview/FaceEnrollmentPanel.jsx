import { useState, useRef, useCallback } from "react";
import {
  Camera,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Users,
} from "lucide-react";

/**
 * FaceEnrollmentPanel
 * Used inside ProfileTab for profile photo upload + face enrollment.
 *
 * Flow:
 *   1. User selects an image file
 *   2. Face recognition library is loaded dynamically
 *   3. Image is analyzed locally in the browser
 *   4. Exactly one face must be detected
 *   5. User clicks "Save Profile Photo"
 *   6. Parent receives the file + face descriptor
 *
 * Privacy:
 *   Face detection runs locally in the browser.
 *   Image data is not uploaded until the user clicks Save.
 */
export default function FaceEnrollmentPanel({ onEnroll, isUploading }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [detecting, setDetecting] = useState(false);
  const [detectionResult, setDetectionResult] = useState(null);

  const fileInputRef = useRef(null);
  const imgRef = useRef(null);
  const canvasRef = useRef(null);

  const handleFileSelect = useCallback(
    async (e) => {
      const file = e.target.files?.[0];

      if (!file) return;

      // Revoke previous preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      const url = URL.createObjectURL(file);

      setSelectedFile(file);
      setPreviewUrl(url);
      setDetectionResult(null);
      setDetecting(true);

      try {
        /*
         * IMPORTANT:
         * Load face-api only when the user actually selects
         * a profile image.
         *
         * This keeps the 1.3 MB+ face recognition dependency
         * out of the initial ProfileTab bundle.
         */
        const { computeDescriptor, loadModels } = await import(
          "../../utils/faceApi"
        );

        // Load face detection models
        await loadModels();

        // Wait for image to load
        await new Promise((resolve, reject) => {
          const img = new Image();

          img.onload = resolve;
          img.onerror = reject;
          img.src = url;

          imgRef.current = img;
        });

        const img = imgRef.current;

        // Analyze the image
        const { faceCount, descriptor } = await computeDescriptor(img);

        if (faceCount === 0) {
          setDetectionResult({
            faceCount: 0,
            descriptor: null,
            error:
              "No face detected in this image. Please use a clear, well-lit photo of your face.",
          });
        } else if (faceCount > 1) {
          setDetectionResult({
            faceCount,
            descriptor: null,
            error: `${faceCount} faces detected. Please use a photo with only you visible.`,
          });
        } else {
          setDetectionResult({
            faceCount: 1,
            descriptor,
            error: null,
          });
        }
      } catch (err) {
        console.error("Face detection error:", err);

        setDetectionResult({
          faceCount: 0,
          descriptor: null,
          error:
            "Face detection failed. Please try a different image.",
        });
      } finally {
        setDetecting(false);
      }
    },
    [previewUrl],
  );

  const handleSave = useCallback(() => {
    if (!selectedFile || !detectionResult?.descriptor) {
      return;
    }

    const descriptorArray = Array.from(
      detectionResult.descriptor,
    );

    onEnroll(selectedFile, descriptorArray);
  }, [selectedFile, detectionResult, onEnroll]);

  const handleReset = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(null);
    setPreviewUrl(null);
    setDetectionResult(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [previewUrl]);

  const isValid =
    detectionResult?.faceCount === 1 &&
    !detectionResult?.error;

  const canSave =
    isValid &&
    !isUploading &&
    !detecting;

  return (
    <div className="space-y-4">
      {/* Hidden canvas for processing */}
      <canvas
        ref={canvasRef}
        className="hidden"
      />

      {/* File Drop / Select Area */}
      {!previewUrl ? (
        <button
          type="button"
          onClick={() =>
            fileInputRef.current?.click()
          }
          className="flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-[rgba(249,115,22,0.3)] bg-[var(--bg-surface)] p-8 text-center transition hover:border-[rgba(249,115,22,0.5)] hover:bg-[var(--card-bg-2)]"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--card-elevated)]">
            <Camera className="h-6 w-6 text-[#F97316]" />
          </div>

          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              Upload profile photo
            </p>

            <p className="mt-1 text-xs text-[var(--text-muted)]">
              JPEG, PNG, or WebP · Max 5MB · Clear face required
            </p>
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-lg border border-[rgba(249,115,22,0.35)] bg-[rgba(249,115,22,0.1)] px-3 py-1.5 text-xs font-semibold text-[#F97316]">
            <Upload className="h-3.5 w-3.5" />
            Choose Photo
          </span>
        </button>
      ) : (
        <div className="space-y-3">
          {/* Preview */}
          <div className="relative overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
            <img
              src={previewUrl}
              alt="Profile photo preview"
              className="mx-auto block max-h-48 w-full object-contain"
            />

            {detecting && (
              <div className="absolute inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.60)] backdrop-blur-sm">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-[#F97316]" />

                  <p className="text-xs font-medium text-[var(--text-secondary)]">
                    Analyzing face...
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Detection Result */}
          {!detecting && detectionResult && (
            <div
              className={`flex items-start gap-2.5 rounded-xl border p-3 text-xs ${isValid
                  ? "border-[#22C55E]/25 bg-[#22C55E]/08 text-[#22C55E]"
                  : "border-[#EF4444]/25 bg-[#EF4444]/08 text-[#EF4444]"
                }`}
            >
              {isValid ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              ) : detectionResult.faceCount > 1 ? (
                <Users className="mt-0.5 h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              )}

              <span className="font-medium">
                {isValid
                  ? "✓ One face detected — ready to enroll"
                  : detectionResult.error}
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--card-bg)] px-3 py-2 text-xs font-medium text-[var(--text-secondary)] transition hover:bg-[var(--card-elevated)] hover:text-[var(--text-primary)]"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Change Photo
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave}
              className="btn-primary flex flex-1 items-center justify-center gap-2 py-2 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Save Profile Photo
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Upload profile photo"
      />

      {/* Privacy note */}
      <p className="text-[10px] leading-relaxed text-[var(--text-muted)]">
        🔒 Face detection runs locally in your browser. No image
        data is uploaded until you click "Save". A mathematical
        representation (not a photo) is stored to verify your
        identity during AI interviews.
      </p>
    </div>
  );
}
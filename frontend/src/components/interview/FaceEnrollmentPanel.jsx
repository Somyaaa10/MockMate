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
import { computeDescriptor, loadModels } from "../../utils/faceApi";

/**
 * FaceEnrollmentPanel
 * Used inside ProfileTab for profile photo upload + face enrollment.
 *
 * Flow:
 *   1. User selects an image file
 *   2. We render it on a hidden canvas
 *   3. We run face detection to confirm exactly 1 face
 *   4. If valid, user clicks "Save Profile Photo"
 *   5. We call onEnroll(file, descriptorArray) — parent handles API upload
 *
 * Privacy: No image data leaves the browser during detection.
 */
export default function FaceEnrollmentPanel({ onEnroll, isUploading }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [detecting, setDetecting] = useState(false);
  const [detectionResult, setDetectionResult] = useState(null);
  // { faceCount, descriptor, error }

  const fileInputRef = useRef(null);
  const imgRef = useRef(null);
  const canvasRef = useRef(null);

  const handleFileSelect = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Revoke old URL
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    const url = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(url);
    setDetectionResult(null);
    setDetecting(true);

    try {
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
      const { faceCount, descriptor } = await computeDescriptor(img);

      if (faceCount === 0) {
        setDetectionResult({ faceCount: 0, descriptor: null, error: "No face detected in this image. Please use a clear, well-lit photo of your face." });
      } else if (faceCount > 1) {
        setDetectionResult({ faceCount, descriptor: null, error: `${faceCount} faces detected. Please use a photo with only you visible.` });
      } else {
        setDetectionResult({ faceCount: 1, descriptor, error: null });
      }
    } catch (err) {
      console.error("Face detection error:", err);
      setDetectionResult({ faceCount: 0, descriptor: null, error: "Face detection failed. Please try a different image." });
    } finally {
      setDetecting(false);
    }
  }, [previewUrl]);

  const handleSave = useCallback(() => {
    if (!selectedFile || !detectionResult?.descriptor) return;
    const descriptorArray = Array.from(detectionResult.descriptor);
    onEnroll(selectedFile, descriptorArray);
  }, [selectedFile, detectionResult, onEnroll]);

  const handleReset = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    setDetectionResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [previewUrl]);

  const isValid = detectionResult?.faceCount === 1 && !detectionResult?.error;
  const canSave = isValid && !isUploading && !detecting;

  return (
    <div className="space-y-4">
      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* File Drop / Select Area */}
      {!previewUrl ? (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-[rgba(139,92,246,0.3)] bg-[#0A0A0A] p-8 text-center transition hover:border-[rgba(139,92,246,0.5)] hover:bg-[#111111] cursor-pointer"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#151515]">
            <Camera className="h-6 w-6 text-[#8B5CF6]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#F5F5F5]">Upload profile photo</p>
            <p className="text-xs text-[#71717A] mt-1">
              JPEG, PNG, or WebP · Max 5MB · Clear face required
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-[rgba(139,92,246,0.35)] bg-[rgba(139,92,246,0.1)] px-3 py-1.5 text-xs font-semibold text-[#8B5CF6]">
            <Upload className="h-3.5 w-3.5" />
            Choose Photo
          </span>
        </button>
      ) : (
        <div className="space-y-3">
          {/* Preview */}
          <div className="relative overflow-hidden rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#0A0A0A]">
            <img
              src={previewUrl}
              alt="Profile photo preview"
              className="mx-auto block max-h-48 w-full object-contain"
            />
            {detecting && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#000000]/60 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-[#8B5CF6]" />
                  <p className="text-xs font-medium text-[#A1A1AA]">Analyzing face...</p>
                </div>
              </div>
            )}
          </div>

          {/* Detection Result */}
          {!detecting && detectionResult && (
            <div
              className={`flex items-start gap-2.5 rounded-xl border p-3 text-xs ${
                isValid
                  ? "border-[#22C55E]/25 bg-[#22C55E]/08 text-[#22C55E]"
                  : "border-[#EF4444]/25 bg-[#EF4444]/08 text-[#EF4444]"
              }`}
            >
              {isValid ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              ) : detectionResult.faceCount > 1 ? (
                <Users className="h-4 w-4 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
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
              className="flex items-center gap-1.5 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#101010] px-3 py-2 text-xs font-medium text-[#A1A1AA] transition hover:bg-[#151515] hover:text-[#F5F5F5]"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Change Photo
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg btn-primary py-2 text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed"
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

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Upload profile photo"
      />

      {/* Privacy note */}
      <p className="text-[10px] text-[#71717A] leading-relaxed">
        🔒 Face detection runs locally in your browser. No image data is uploaded until you click "Save".
        A mathematical representation (not a photo) is stored to verify your identity during AI interviews.
      </p>
    </div>
  );
}

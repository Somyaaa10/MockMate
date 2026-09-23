/**
 * faceApi.js — Singleton wrapper for @vladmandic/face-api
 *
 * Provides:
 *   loadModels()           — load all 3 models once, cached
 *   detectFaces(input)     — returns array of detections with descriptors
 *   computeDescriptor(input) — returns Float32Array[128] for single face
 *   matchDescriptor(live, enrolled, threshold) — Euclidean distance check
 *
 * All processing is LOCAL in the browser — no frames sent to server.
 * Models are served from /models/ (frontend/public/models/).
 */

import * as faceapi from "@vladmandic/face-api";

let modelsLoaded = false;
let loadingPromise = null;

const MODEL_URL = "/models";

/**
 * Load all required models exactly once.
 * Subsequent calls return immediately (cached).
 */
export async function loadModels() {
  if (modelsLoaded) return;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
    modelsLoaded = true;
  })();

  return loadingPromise;
}

/**
 * Detect all faces in a video/canvas element.
 * Returns array of { detection, landmarks, descriptor }
 *
 * @param {HTMLVideoElement|HTMLCanvasElement|HTMLImageElement} input
 * @returns {Promise<Array>}
 */
export async function detectFaces(input) {
  await loadModels();
  const options = new faceapi.TinyFaceDetectorOptions({
    inputSize: 320,
    scoreThreshold: 0.5,
  });
  const detections = await faceapi
    .detectAllFaces(input, options)
    .withFaceLandmarks()
    .withFaceDescriptors();
  return detections;
}

/**
 * Detect exactly one face and compute its 128-float descriptor.
 * Returns null if 0 or 2+ faces found.
 *
 * @param {HTMLVideoElement|HTMLCanvasElement|HTMLImageElement} input
 * @returns {Promise<{ descriptor: Float32Array, faceCount: number } | null>}
 */
export async function computeDescriptor(input) {
  await loadModels();
  const options = new faceapi.TinyFaceDetectorOptions({
    inputSize: 320,
    scoreThreshold: 0.5,
  });
  const detections = await faceapi
    .detectAllFaces(input, options)
    .withFaceLandmarks()
    .withFaceDescriptors();

  return {
    faceCount: detections.length,
    descriptor: detections.length === 1 ? detections[0].descriptor : null,
  };
}

/**
 * Match a live face descriptor against an enrolled descriptor.
 * Uses Euclidean distance — lower is more similar.
 * Standard threshold: 0.55 (reasonably strict, lighting-tolerant)
 *
 * @param {Float32Array|Array<number>} liveDescriptor
 * @param {Array<number>} enrolledDescriptor
 * @param {number} threshold — default 0.55
 * @returns {{ matched: boolean, distance: number }}
 */
export function matchDescriptor(liveDescriptor, enrolledDescriptor, threshold = 0.55) {
  if (!liveDescriptor || !enrolledDescriptor || enrolledDescriptor.length !== 128) {
    return { matched: false, distance: 999 };
  }

  const live = liveDescriptor instanceof Float32Array
    ? liveDescriptor
    : new Float32Array(liveDescriptor);

  const enrolled = new Float32Array(enrolledDescriptor);

  // Euclidean distance
  const distance = faceapi.euclideanDistance(live, enrolled);

  return {
    matched: distance < threshold,
    distance: parseFloat(distance.toFixed(4)),
  };
}

/**
 * Check if models are currently loaded.
 * @returns {boolean}
 */
export function areModelsLoaded() {
  return modelsLoaded;
}

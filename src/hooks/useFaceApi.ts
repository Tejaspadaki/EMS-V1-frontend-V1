import { useState, useEffect } from 'react';
import * as faceapi from 'face-api.js';

let globalModelsLoaded = false;
let globalModelsLoadingPromise: Promise<void> | null = null;

// Eager model loading for sub-second startup
const preloadModels = () => {
  if (globalModelsLoaded || globalModelsLoadingPromise) return;
  const MODEL_URL = './models';
  globalModelsLoadingPromise = Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
  ])
    .then(() => {
      globalModelsLoaded = true;
    })
    .catch((err) => {
      console.error('Eager model preload failed', err);
      globalModelsLoadingPromise = null;
    });
};

// Trigger model loading immediately upon file import
preloadModels();

export interface FaceDetectionResult {
  descriptor: number[];
  pose: 'front' | 'left' | 'right';
  score: number;
  box: { x: number; y: number; width: number; height: number };
}

export const useFaceApi = () => {
  const [isLoaded, setIsLoaded] = useState(globalModelsLoaded);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (globalModelsLoaded) {
      setIsLoaded(true);
      return;
    }

    let isMounted = true;
    const loadModels = async () => {
      try {
        preloadModels();
        if (globalModelsLoadingPromise) {
          await globalModelsLoadingPromise;
        }
        if (isMounted) {
          setIsLoaded(true);
        }
      } catch (err) {
        console.error('Failed to load face-api models', err);
        if (isMounted) {
          setLoadError('Failed to initialize facial recognition engine. Please try refreshing.');
        }
      }
    };

    loadModels();
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute head pose (front, left, right) from landmark coordinates
  const estimatePose = (landmarks: faceapi.FaceLandmarks68): 'front' | 'left' | 'right' => {
    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();
    const nose = landmarks.getNose();

    const leftEyeCenter = leftEye.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
    leftEyeCenter.x /= leftEye.length;
    
    const rightEyeCenter = rightEye.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
    rightEyeCenter.x /= rightEye.length;

    const eyeDistance = Math.abs(rightEyeCenter.x - leftEyeCenter.x);
    const eyesCenterX = (leftEyeCenter.x + rightEyeCenter.x) / 2;
    const noseTipX = nose[3] ? nose[3].x : nose[0].x;

    const yawRatio = (noseTipX - eyesCenterX) / (eyeDistance || 1);

    // Note: Video is mirrored horizontally in UI
    if (yawRatio < -0.15) {
      return 'right'; 
    } else if (yawRatio > 0.15) {
      return 'left';
    }
    return 'front';
  };

  const detectFaceFull = async (videoElement: HTMLVideoElement): Promise<FaceDetectionResult | null> => {
    if (!isLoaded || !videoElement || videoElement.paused || videoElement.ended) return null;

    try {
      const detection = await faceapi
        .detectSingleFace(
          videoElement,
          new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 })
        )
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) return null;

      const pose = estimatePose(detection.landmarks);
      const descriptor = Array.from(detection.descriptor);
      const box = {
        x: detection.detection.box.x,
        y: detection.detection.box.y,
        width: detection.detection.box.width,
        height: detection.detection.box.height,
      };

      return {
        descriptor,
        pose,
        score: detection.detection.score,
        box,
      };
    } catch (err) {
      console.warn('Face detection error:', err);
      return null;
    }
  };

  const detectFaceAndGetDescriptor = async (videoElement: HTMLVideoElement): Promise<number[] | null> => {
    const res = await detectFaceFull(videoElement);
    return res ? res.descriptor : null;
  };

  // High performance JPEG capture (50% quality, resized max 320px for minimal payload size < 25KB)
  const captureFrameAsJpeg = (videoElement: HTMLVideoElement, quality = 0.5, maxDim = 320): string | null => {
    try {
      if (!videoElement || !videoElement.videoWidth) return null;
      let width = videoElement.videoWidth;
      let height = videoElement.videoHeight;

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg', quality);
      }
    } catch (e) {
      console.error('Failed to capture frame', e);
    }
    return null;
  };

  const captureFrameAsBase64 = (videoElement: HTMLVideoElement): string | null => {
    return captureFrameAsJpeg(videoElement, 0.5, 320);
  };

  return {
    isLoaded,
    loadError,
    detectFaceFull,
    detectFaceAndGetDescriptor,
    captureFrameAsJpeg,
    captureFrameAsBase64,
  };
};

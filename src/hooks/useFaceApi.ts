import { useState, useEffect } from 'react';
import * as faceapi from 'face-api.js';

let globalModelsLoaded = false;
let globalModelsLoadingPromise: Promise<void> | null = null;

export const useFaceApi = () => {
  const [isLoaded, setIsLoaded] = useState(globalModelsLoaded);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (globalModelsLoaded) {
      setIsLoaded(true);
      return;
    }

    const loadModels = async () => {
      try {
        if (!globalModelsLoadingPromise) {
          // Use a relative path so it works in both web and Electron (file:///)
          const MODEL_URL = './models';
          globalModelsLoadingPromise = Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
          ]).then(() => {});
        }
        await globalModelsLoadingPromise;
        globalModelsLoaded = true;
        setIsLoaded(true);
      } catch (err) {
        console.error('Failed to load face-api models', err);
        setLoadError('Failed to initialize facial recognition engine. Please try refreshing.');
        globalModelsLoadingPromise = null;
      }
    };

    loadModels();
  }, []);

  const detectFaceAndGetDescriptor = async (videoElement: HTMLVideoElement): Promise<number[] | null> => {
    if (!isLoaded) return null;

    const detection = await faceapi
      .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (detection) {
      // faceapi returns a Float32Array, convert it to a standard array for JSON transport
      return Array.from(detection.descriptor);
    }
    return null;
  };

  const captureFrameAsBase64 = (videoElement: HTMLVideoElement): string | null => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw the video frame to the canvas (also mirror it back so it looks right)
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/png');
      }
    } catch (e) {
      console.error('Failed to capture frame', e);
    }
    return null;
  };

  const calculateEAR = (eye: faceapi.Point[]) => {
    const d = (p1: faceapi.Point, p2: faceapi.Point) => Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    const v1 = d(eye[1], eye[5]);
    const v2 = d(eye[2], eye[4]);
    const h = d(eye[0], eye[3]);
    return (v1 + v2) / (2.0 * h);
  };

  const detectBlink = async (videoElement: HTMLVideoElement): Promise<{ isBlinking: boolean, descriptor?: number[] }> => {
    if (!isLoaded) return { isBlinking: false };

    const detection = await faceapi
      .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (detection) {
      const leftEye = detection.landmarks.getLeftEye();
      const rightEye = detection.landmarks.getRightEye();
      
      const leftEAR = calculateEAR(leftEye);
      const rightEAR = calculateEAR(rightEye);
      const avgEAR = (leftEAR + rightEAR) / 2.0;

      const isBlinking = avgEAR < 0.25;
      
      return { 
        isBlinking, 
        descriptor: Array.from(detection.descriptor) 
      };
    }
    return { isBlinking: false };
  };

  return { isLoaded, loadError, detectFaceAndGetDescriptor, captureFrameAsBase64, detectBlink };
};

import { useEffect, useRef } from 'react';

export interface UseWebcamOptions {
  onSnapshot?: (blob: Blob) => void;
  captureInterval?: number; // milliseconds
  enabled?: boolean;
}

export const useWebcam = (options: UseWebcamOptions = {}) => {
  const {
    onSnapshot,
    captureInterval = 3000,
    enabled = true
  } = options;

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initialize webcam
  useEffect(() => {
    if (!enabled) return;

    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user'
          },
          audio: false
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
        }
      } catch (error) {
        console.error('Error accessing webcam:', error);
        alert('Cannot access webcam. Please grant camera permissions.');
      }
    };

    startWebcam();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [enabled]);

  // Auto capture snapshots
  useEffect(() => {
    if (!enabled || !onSnapshot) return;

    const captureSnapshot = () => {
      if (!videoRef.current) return;

      // Create canvas if not exists
      if (!canvasRef.current) {
        canvasRef.current = document.createElement('canvas');
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;

      // Set canvas size to video dimensions
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      // Draw current video frame to canvas
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            onSnapshot(blob);
          }
        },
        'image/jpeg',
        0.8 // Quality 80%
      );
    };

    // Start interval
    intervalRef.current = setInterval(captureSnapshot, captureInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, onSnapshot, captureInterval]);

  return {
    videoRef
  };
};

import React, { useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';
import { toastBus } from '../ui/toastBus';

interface WebcamCaptureProps {
  sessionId: string;
  intervalMs?: number;
}

export const WebcamCapture: React.FC<WebcamCaptureProps> = ({ 
  sessionId, 
  intervalMs = 5000 // Default: capture every 5 seconds
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [lastCapture, setLastCapture] = useState<string>('');

  useEffect(() => {
    // Start webcam
    const startWebcam = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 640, height: 480 } 
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        toastBus.error('Failed to access webcam');
        console.error('Webcam error:', err);
      }
    };

    startWebcam();

    return () => {
      // Cleanup: stop webcam
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (!stream || !capturing) return;

    const captureAndSend = async () => {
      if (!videoRef.current || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;

      // Draw video frame to canvas
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to base64
      const imageBase64 = canvas.toDataURL('image/jpeg', 0.8);

      try {
        const ts = Date.now();
        await api.post('/ingest/snapshots/upload', {
          items: [{
            sessionId,
            ts,
            imageBase64,
            faceCount: 1, // Would be detected by backend
            idempotencyKey: `snap-${sessionId}-${ts}`
          }]
        });
        setLastCapture(new Date().toLocaleTimeString());
      } catch (err) {
        console.error('Failed to upload snapshot:', err);
      }
    };

    // Capture immediately
    captureAndSend();

    // Then capture at intervals
    const interval = setInterval(captureAndSend, intervalMs);

    return () => clearInterval(interval);
  }, [sessionId, stream, capturing, intervalMs]);

  useEffect(() => {
    // Auto-start capturing when component mounts
    setCapturing(true);
  }, []);

  return (
    <div style={{ 
      background: '#fff', 
      padding: 20, 
      borderRadius: 8,
      border: '1px solid #e0e0e0'
    }}>
      <h3>Webcam Monitoring</h3>
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
        <div>
          <video
            ref={videoRef}
            autoPlay
            muted
            style={{ 
              width: 320, 
              height: 240, 
              background: '#000',
              borderRadius: 4
            }}
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ margin: '0 0 10px 0' }}>
            Status: <strong style={{ color: capturing ? '#28a745' : '#dc3545' }}>
              {capturing ? 'Active' : 'Inactive'}
            </strong>
          </p>
          <p style={{ margin: '0 0 10px 0', fontSize: 14, color: '#666' }}>
            Last capture: {lastCapture || 'Not yet captured'}
          </p>
          <p style={{ margin: 0, fontSize: 12, color: '#999' }}>
            Capturing every {intervalMs / 1000} seconds
          </p>
        </div>
      </div>
    </div>
  );
};

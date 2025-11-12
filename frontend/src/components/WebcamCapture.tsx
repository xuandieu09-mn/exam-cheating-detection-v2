import React, { useEffect, useRef, useState } from 'react';
import { uploadSnapshots } from '../api/client';
import type { UUID } from '../api/types';
import { emitToast } from '../ui/toastBus';

type Props = {
  sessionId: UUID;
  intervalSec?: number; // default 10s
};

const WebcamCapture: React.FC<Props> = ({ sessionId, intervalSec = 10 }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [active, setActive] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setActive(true);
        }
      } catch (e: any) {
        emitToast('Không thể truy cập webcam: ' + (e?.message || e), 'error');
      }
    };
    start();
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!active) return;
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(captureAndSend, intervalSec * 1000) as unknown as number;
    return () => { if (timerRef.current) window.clearInterval(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, intervalSec, sessionId]);

  const captureAndSend = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const w = video.videoWidth || 640;
    const h = video.videoHeight || 480;
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, w, h);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    const ts = Date.now();
    try {
      await uploadSnapshots({ items: [{ sessionId, ts, imageBase64: dataUrl, idempotencyKey: `${sessionId}-${ts}-snapshot` }] });
    } catch (e) {
      // interceptor will toast error
    }
  };

  return (
    <div>
      <video ref={videoRef} muted playsInline style={{ width: 320, height: 240, background: '#000', borderRadius: 8 }} />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <div style={{ fontSize: 12, color: '#666', marginTop: 6 }}>Webcam đang hoạt động. Ảnh sẽ được tải lên mỗi {intervalSec}s.</div>
    </div>
  );
};

export default WebcamCapture;

import { useEffect, useRef } from 'react';
import { ingestEvents } from '../api/client';
import type { EventIngestItem, EventType, UUID } from '../api/types';

// Capture browser-level exam telemetry and batch-send to backend.
export default function useExamTelemetry(sessionId: UUID | null) {
  const bufferRef = useRef<EventIngestItem[]>([]);
  const timerRef = useRef<number | null>(null);
  const seqRef = useRef(0);

  useEffect(() => {
    if (!sessionId) return;

    const push = (eventType: EventType, details?: any) => {
      const ts = Date.now();
      const idempotencyKey = `${sessionId}-${ts}-${eventType}-${seqRef.current++}`;
      bufferRef.current.push({
        sessionId,
        ts,
        eventType,
        details: details ? JSON.stringify(details) : undefined,
        idempotencyKey,
      });
      if (bufferRef.current.length >= 10) {
        void flush();
      }
    };

    const onVisibility = () => {
      if (document.hidden) push('BLUR', { reason: 'document.hidden' });
      else push('FOCUS', { reason: 'document.visible' });
    };
    const onFocus = () => push('FOCUS', { reason: 'window.focus' });
    const onBlur = () => push('BLUR', { reason: 'window.blur' });
    const onPaste = (e: ClipboardEvent) => push('PASTE', { types: e.clipboardData?.types });
    const onVisibilityChange = () => onVisibility();

    window.addEventListener('focus', onFocus);
    window.addEventListener('blur', onBlur);
    document.addEventListener('visibilitychange', onVisibilityChange);
    document.addEventListener('paste', onPaste as any);

    // initial visibility snapshot
    onVisibility();

    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => { void flush(); }, 5000) as unknown as number;

    async function flush() {
      if (!sessionId) return;
      const batch = bufferRef.current;
      if (batch.length === 0) return;
      bufferRef.current = [];
      try { await ingestEvents({ items: batch }); } catch (e) { /* interceptor handles errors */ }
    }

    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      document.removeEventListener('paste', onPaste as any);
      if (timerRef.current) window.clearInterval(timerRef.current);
      // best-effort final flush
      if (bufferRef.current.length) void ingestEvents({ items: bufferRef.current });
      bufferRef.current = [];
    };
  }, [sessionId]);
}

import { useEffect, useRef } from 'react';
import { api } from '../lib/api';

interface TelemetryOptions {
  sessionId: string;
  enabled?: boolean;
}

export const useExamTelemetry = ({ sessionId, enabled = true }: TelemetryOptions) => {
  const lastEventRef = useRef<{ type: string; timestamp: number } | null>(null);

  useEffect(() => {
    if (!enabled || !sessionId) return;

    const sendEvent = async (eventType: string, details: any = {}) => {
      const now = Date.now();
      
      // Debounce: Don't send the same event type within 1 second
      if (lastEventRef.current?.type === eventType && 
          now - lastEventRef.current.timestamp < 1000) {
        return;
      }

      lastEventRef.current = { type: eventType, timestamp: now };

      try {
        await api.post('/ingest/events', {
          items: [{
            sessionId,
            ts: now,
            eventType,
            details: JSON.stringify(details),
            idempotencyKey: `evt-${sessionId}-${eventType}-${now}`
          }]
        });
      } catch (err) {
        console.error('Failed to send telemetry event:', err);
      }
    };

    // Track window focus/blur
    const handleFocus = () => sendEvent('FOCUS');
    const handleBlur = () => sendEvent('BLUR');

    // Track visibility changes (tab switch)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        sendEvent('TAB_SWITCH', { hidden: true });
      } else {
        sendEvent('TAB_VISIBLE', { hidden: false });
      }
    };

    // Track paste events
    const handlePaste = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      const pastedText = e.clipboardData?.getData('text') || '';
      
      sendEvent('PASTE', {
        targetTag: target.tagName,
        targetId: (target as HTMLInputElement).id || '',
        textLength: pastedText.length,
        preview: pastedText.substring(0, 50) // First 50 chars only
      });
    };

    // Track copy events
    const handleCopy = (e: ClipboardEvent) => {
      const selection = window.getSelection()?.toString() || '';
      
      sendEvent('COPY', {
        textLength: selection.length
      });
    };

    // Track full screen exit
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        sendEvent('FULLSCREEN_EXIT');
      }
    };

    // Add event listeners
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    // Send initial focus event
    if (document.hasFocus()) {
      sendEvent('FOCUS');
    }

    // Cleanup
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [sessionId, enabled]);

  return {
    // Could expose methods to manually track events if needed
  };
};

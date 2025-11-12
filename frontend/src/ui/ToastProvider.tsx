import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { onToast, Toast } from './toastBus';

type ToastCtx = { toasts: Toast[]; remove: (id: number) => void };
const Ctx = createContext<ToastCtx | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const unsub = onToast(t => {
      setToasts(list => [...list, t]);
      // auto dismiss after 4s
      setTimeout(() => setToasts(list => list.filter(x => x.id !== t.id)), 4000);
    });
    return () => { unsub(); };
  }, []);

  const value = useMemo<ToastCtx>(() => ({ toasts, remove: id => setToasts(list => list.filter(x => x.id !== id)) }), [toasts]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <div style={{ position: 'fixed', right: 16, bottom: 16, display: 'flex', flexDirection: 'column', gap: 8, zIndex: 9999 }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            minWidth: 240,
            maxWidth: 400,
            padding: '10px 14px',
            borderRadius: 8,
            color: '#112',
            background: t.type === 'error' ? '#fdecea' : t.type === 'success' ? '#edf7ed' : '#eef2ff',
            border: `1px solid ${t.type === 'error' ? '#f4c7c3' : t.type === 'success' ? '#cde7cd' : '#dfe3ff'}`
          }}>
            {t.message}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
};

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

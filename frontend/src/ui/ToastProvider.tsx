import React, { useEffect, useState } from 'react';
import { toastBus, Toast } from './toastBus';

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const unsubscribe = toastBus.subscribe(setToasts);
    return unsubscribe;
  }, []);

  const getColor = (type: Toast['type']) => {
    switch (type) {
      case 'success': return '#28a745';
      case 'error': return '#dc3545';
      case 'warning': return '#ffc107';
      case 'info': return '#17a2b8';
      default: return '#6c757d';
    }
  };

  return (
    <>
      {children}
      <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999 }}>
        {toasts.map(toast => (
          <div
            key={toast.id}
            style={{
              background: getColor(toast.type),
              color: '#fff',
              padding: '12px 20px',
              borderRadius: 4,
              marginBottom: 10,
              minWidth: 250,
              maxWidth: 400,
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
            onClick={() => toastBus.remove(toast.id)}
          >
            <span>{toast.message}</span>
            <button
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: 18,
                cursor: 'pointer',
                marginLeft: 10
              }}
              onClick={() => toastBus.remove(toast.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </>
  );
};

import React from 'react';

const LoadingSpinner: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <div style={{ display: 'inline-block', width: size, height: size, border: '2px solid #e5e7eb', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
);

export default LoadingSpinner;

// Simple CSS-in-JS keyframes (vite injects a style tag is not trivial here). Rely on Tailwind-like spin? We'll inject style once.
if (typeof document !== 'undefined') {
  const id = 'app-spinner-style';
  if (!document.getElementById(id)) {
    const style = document.createElement('style');
    style.id = id;
    style.innerHTML = '@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }';
    document.head.appendChild(style);
  }
}

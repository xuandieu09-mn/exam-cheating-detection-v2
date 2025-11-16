import React from 'react';

export const LoadingSpinner: React.FC<{ size?: number }> = ({ size = 24 }) => {
  return (
    <div style={{ 
      display: 'inline-block',
      width: size,
      height: size,
      border: '3px solid rgba(0,0,0,0.1)',
      borderTopColor: '#3498db',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }}>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

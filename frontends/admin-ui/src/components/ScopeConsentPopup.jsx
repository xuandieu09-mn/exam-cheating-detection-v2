import { useEffect, useState } from 'react';

const ScopeConsentPopup = ({ session, onClose }) => {
  const [understood, setUnderstood] = useState(false);

  // Auto-close after 10 seconds if user doesn't interact
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 10000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!session || !session.user) return null;

  // Extract scopes from session - they might be in different places depending on OAuth provider
  const scopes = session.scope?.split(' ') || ['openid', 'profile'];

  const scopeDescriptions = {
    openid: '🔑 Basic authentication - allows you to log in',
    profile: '👤 Access your profile information (name, email)',
    'exam.read': '📖 Read access to exam data',
    'exam.write': '✏️ Create and modify exams',
    offline_access: '🔄 Keep you logged in (refresh token)'
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        animation: 'fadeIn 0.3s ease-in'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          borderRadius: 12,
          padding: '2rem',
          maxWidth: 500,
          width: '90%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          animation: 'slideUp 0.3s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🍪</div>
          <h2 style={{ margin: 0, color: '#1a1a1a' }}>Authorization Granted</h2>
          <p style={{ color: '#666', fontSize: '0.9rem', margin: '0.5rem 0 0 0' }}>
            You have successfully authorized the application
          </p>
        </div>

        <div
          style={{
            background: '#f8f9fa',
            borderRadius: 8,
            padding: '1rem',
            marginBottom: '1.5rem'
          }}
        >
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#333' }}>
            Granted Permissions:
          </h3>
          <ul style={{ margin: 0, padding: '0 0 0 1.2rem', listStyle: 'none' }}>
            {scopes.map((scope) => (
              <li
                key={scope}
                style={{
                  marginBottom: '0.5rem',
                  color: '#555',
                  fontSize: '0.9rem',
                  lineHeight: 1.5
                }}
              >
                {scopeDescriptions[scope] || `🔐 ${scope}`}
              </li>
            ))}
          </ul>
        </div>

        <div
          style={{
            background: '#e3f2fd',
            borderRadius: 8,
            padding: '1rem',
            marginBottom: '1.5rem',
            fontSize: '0.85rem',
            color: '#1565c0'
          }}
        >
          <strong>🔒 Your data is secure:</strong> All access tokens are stored server-side
          in the BFF Gateway. Your browser only receives a secure HTTPOnly session cookie.
        </div>

        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '1rem',
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <input
            type="checkbox"
            checked={understood}
            onChange={(e) => setUnderstood(e.target.checked)}
            style={{ marginRight: '0.5rem', cursor: 'pointer' }}
          />
          <span style={{ fontSize: '0.9rem', color: '#333' }}>
            I understand the permissions I've granted
          </span>
        </label>

        <button
          onClick={onClose}
          disabled={!understood}
          style={{
            width: '100%',
            padding: '0.75rem',
            background: understood ? '#2196F3' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontSize: '1rem',
            fontWeight: 600,
            cursor: understood ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s',
            opacity: understood ? 1 : 0.6
          }}
          onMouseEnter={(e) => {
            if (understood) e.target.style.background = '#1976D2';
          }}
          onMouseLeave={(e) => {
            if (understood) e.target.style.background = '#2196F3';
          }}
        >
          Continue to Dashboard
        </button>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default ScopeConsentPopup;

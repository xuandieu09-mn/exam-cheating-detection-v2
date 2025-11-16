import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '../auth/AuthContext';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (role: UserRole) => {
    login(role);
    navigate('/dashboard');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'system-ui'
    }}>
      <div style={{
        background: 'white',
        borderRadius: 16,
        padding: 48,
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        maxWidth: 450,
        width: '100%'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1a202c', marginBottom: 8 }}>
            🎓 Hệ Thống Thi Trực Tuyến
          </h1>
          <p style={{ color: '#718096', fontSize: 14 }}>
            Phát hiện gian lận tự động
          </p>
        </div>

        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 14, color: '#4a5568', marginBottom: 12, fontWeight: 500 }}>
            Chọn vai trò đăng nhập:
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            onClick={() => handleLogin('CANDIDATE')}
            style={{
              padding: '14px 24px',
              background: '#3182ce',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#2c5aa0'}
            onMouseOut={(e) => e.currentTarget.style.background = '#3182ce'}
          >
            <span>👨‍🎓</span> Đăng nhập Thí sinh
          </button>

          <button
            onClick={() => handleLogin('PROCTOR')}
            style={{
              padding: '14px 24px',
              background: '#38a169',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#2f855a'}
            onMouseOut={(e) => e.currentTarget.style.background = '#38a169'}
          >
            <span>👨‍🏫</span> Đăng nhập Giám thị
          </button>

          <button
            onClick={() => handleLogin('ADMIN')}
            style={{
              padding: '14px 24px',
              background: '#e53e3e',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#c53030'}
            onMouseOut={(e) => e.currentTarget.style.background = '#e53e3e'}
          >
            <span>👑</span> Đăng nhập Admin
          </button>
        </div>

        <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: '#a0aec0' }}>
            Demo Version - Không cần mật khẩu
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
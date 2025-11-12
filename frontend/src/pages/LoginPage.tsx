import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Role, useAuth } from '../auth/AuthContext';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [role, setRole] = useState<Role>('STUDENT');
  const [token, setToken] = useState<string>('');
  const { loginAs } = useAuth();
  const navigate = useNavigate();

  const onLogin = () => {
    // UI-only: save role and navigate to respective home
    loginAs(role, username || 'Người dùng', token || null);
    if (role === 'STUDENT') navigate('/student/start');
    if (role === 'PROCTOR') navigate('/proctor/review');
    if (role === 'ADMIN') navigate('/admin/exams');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f6fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px #0001', padding: 32, minWidth: 350, maxWidth: 380 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 16 }}>
          <img src="https://i.imgur.com/1Q9Z1Zm.png" alt="logo" style={{ width: 80, height: 80, marginBottom: 8 }} />
          <div style={{ fontWeight: 500, fontSize: 18, color: '#1976d2', marginBottom: 8, textAlign: 'center' }}>
            Chào mừng đến với Hệ thống Giám sát Thi cử
          </div>
        </div>
        <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 16, textAlign: 'center' }}>Đăng nhập</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="text"
            placeholder="Tên đăng nhập / Mã Giáo viên"
            value={username}
            onChange={e => setUsername(e.target.value)}
            style={{ padding: 10, borderRadius: 6, border: '1px solid #ccc', fontSize: 15 }}
          />
          <input
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ padding: 10, borderRadius: 6, border: '1px solid #ccc', fontSize: 15 }}
          />
          <select value={role} onChange={e => setRole(e.target.value as Role)} style={{ padding: 10, borderRadius: 6, border: '1px solid #ccc', fontSize: 15 }}>
            <option value="STUDENT">Sinh viên</option>
            <option value="PROCTOR">Giám thị</option>
            <option value="ADMIN">Admin</option>
          </select>
          <textarea
            placeholder="JWT token (tùy chọn) – dán vào để dùng cùng Resource Server"
            value={token}
            onChange={e => setToken(e.target.value)}
            rows={3}
            style={{ padding: 10, borderRadius: 6, border: '1px solid #ccc', fontSize: 13, fontFamily: 'monospace' }}
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 14 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
              Ghi nhớ đăng nhập
            </label>
            <a href="#" style={{ color: '#1976d2', textDecoration: 'none' }}>Quên mật khẩu?</a>
          </div>
          <button onClick={onLogin}
            style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 0', fontWeight: 600, fontSize: 16, marginTop: 8, cursor: 'pointer' }}
            type="button"
          >
            Đăng nhập
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

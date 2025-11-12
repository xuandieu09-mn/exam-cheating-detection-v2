import React from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../auth/AuthContext';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state } = useAuth();
  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{ height: 56, borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', padding: '0 20px', background: '#fff', gap: 16 }}>
          <div style={{ fontWeight: 600 }}>Exam Cheating Detection</div>
          <div style={{ fontSize: 14, color: '#555' }}>Vai trò: {state.role ?? 'Chưa đăng nhập'}</div>
        </header>
        <main style={{ padding: 20, background: '#f5f6fa', flex: 1, overflow: 'auto' }}>{children}</main>
      </div>
    </div>
  );
};

export default AppLayout;

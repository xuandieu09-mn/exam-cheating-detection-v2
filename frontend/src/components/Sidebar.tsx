import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

interface NavItem { label: string; to: string; roles: ('STUDENT'|'PROCTOR'|'ADMIN')[]; }

const items: NavItem[] = [
  { label: 'Bắt đầu thi', to: '/student/start', roles: ['STUDENT'] },
  { label: 'Incidents đã duyệt', to: '/student/incidents', roles: ['STUDENT'] },
  { label: 'Duyệt incidents', to: '/proctor/review', roles: ['PROCTOR'] },
  { label: 'Tạo kỳ thi', to: '/admin/exams', roles: ['ADMIN'] },
  { label: 'Quản lý incidents', to: '/admin/incidents', roles: ['ADMIN'] },
];

const Sidebar: React.FC = () => {
  const { state, logout } = useAuth();
  const loc = useLocation();
  return (
    <aside style={{ width: 200, background: '#fafbfc', borderRight: '1px solid #eee', display: 'flex', flexDirection: 'column', padding: 12 }}>
      <div style={{ fontWeight: 600, marginBottom: 16 }}>Menu</div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {items.filter(i => state.role && i.roles.includes(state.role)).map(i => {
          const active = loc.pathname === i.to;
          return (
            <Link
              key={i.to}
              to={i.to}
              style={{
                padding: '8px 10px',
                borderRadius: 6,
                textDecoration: 'none',
                background: active ? '#e3f2fd' : 'transparent',
                color: '#333',
                fontSize: 14,
                border: active ? '1px solid #90caf9' : '1px solid transparent'
              }}
            >{i.label}</Link>
          );
        })}
      </div>
      <button onClick={logout} style={{ marginTop: 12, padding: '8px 10px', borderRadius: 6, border: '1px solid #ccc', background: '#fff', cursor: 'pointer' }}>Đăng xuất</button>
    </aside>
  );
};

export default Sidebar;

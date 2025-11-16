import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const linkStyle = (path: string) => ({
    display: 'block',
    padding: '12px 20px',
    color: isActive(path) ? '#007bff' : '#333',
    background: isActive(path) ? '#e7f3ff' : 'transparent',
    textDecoration: 'none',
    borderLeft: isActive(path) ? '3px solid #007bff' : '3px solid transparent',
    fontSize: 14
  });

  const getMenuItems = () => {
    if (user?.role === 'ADMIN') {
      return [
        { path: '/admin/incidents', label: 'All Incidents' },
        { path: '/admin/create-exam', label: 'Create Exam' },
        { path: '/admin/stats', label: 'Statistics' },
      ];
    } else if (user?.role === 'PROCTOR' || user?.role === 'REVIEWER') {
      return [
        { path: '/proctor/review', label: 'Review Incidents' },
        { path: '/proctor/stats', label: 'My Reviews' },
      ];
    } else if (user?.role === 'CANDIDATE') {
      return [
        { path: '/student/exam', label: 'Start Exam' },
        { path: '/student/incidents', label: 'My Incidents' },
      ];
    }
    return [];
  };

  return (
    <aside style={{ 
      width: 250, 
      background: '#fff', 
      borderRight: '1px solid #e0e0e0',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ padding: 20, borderBottom: '1px solid #e0e0e0' }}>
        <h2 style={{ margin: 0, fontSize: 16, color: '#666' }}>Navigation</h2>
      </div>
      <nav style={{ flex: 1, padding: '10px 0' }}>
        {getMenuItems().map(item => (
          <Link key={item.path} to={item.path} style={linkStyle(item.path)}>
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

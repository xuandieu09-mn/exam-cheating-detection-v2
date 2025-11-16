import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { toastBus } from '../ui/toastBus';
import { LoadingSpinner } from '../ui/LoadingSpinner';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toastBus.error('Please enter username and password');
      return;
    }

    setLoading(true);
    
    // For MVP, simulate login with mock JWT
    // In production, call /auth/login API
    setTimeout(() => {
      // Mock JWT token (in production, get this from backend)
      const mockToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNTE2MjM5MDIyfQ.example';
      
      // Determine role based on username for demo
      let role: 'ADMIN' | 'PROCTOR' | 'REVIEWER' | 'CANDIDATE' = 'CANDIDATE';
      if (username.toLowerCase().includes('admin')) role = 'ADMIN';
      else if (username.toLowerCase().includes('proctor')) role = 'PROCTOR';
      else if (username.toLowerCase().includes('reviewer')) role = 'REVIEWER';
      
      const user = {
        id: '22222222-2222-2222-2222-222222222222',
        username,
        role
      };
      
      login(mockToken, user);
      toastBus.success(`Welcome ${username}!`);
      setLoading(false);
      
      // Navigate based on role
      if (role === 'ADMIN') navigate('/admin/incidents');
      else if (role === 'PROCTOR' || role === 'REVIEWER') navigate('/proctor/review');
      else navigate('/student/exam');
    }, 500);
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: '#f5f5f5'
    }}>
      <div style={{ 
        background: '#fff', 
        padding: 40, 
        borderRadius: 8, 
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: 400
      }}>
        <h1 style={{ marginBottom: 30, textAlign: 'center' }}>Exam Detection System</h1>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8 }}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username (e.g., admin, proctor, student)"
              style={{ 
                width: '100%', 
                padding: 10, 
                fontSize: 14,
                border: '1px solid #ddd',
                borderRadius: 4
              }}
            />
          </div>
          <div style={{ marginBottom: 30 }}>
            <label style={{ display: 'block', marginBottom: 8 }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              style={{ 
                width: '100%', 
                padding: 10, 
                fontSize: 14,
                border: '1px solid #ddd',
                borderRadius: 4
              }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: 12, 
              fontSize: 16,
              background: loading ? '#ccc' : '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 10
            }}
          >
            {loading && <LoadingSpinner size={20} />}
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p style={{ marginTop: 20, fontSize: 12, color: '#666', textAlign: 'center' }}>
          Tip: Use 'admin', 'proctor', 'reviewer', or 'student' in username for different roles
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

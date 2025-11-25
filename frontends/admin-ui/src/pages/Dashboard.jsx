import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BFF_URL = import.meta.env.VITE_BFF_URL ?? 'http://localhost:8080';

const Dashboard = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    try {
      const response = await fetch(`${BFF_URL}/api/session`, {
        credentials: 'include'
      });
      
      if (!response.ok || response.status === 401) {
        // Not authenticated, redirect to home
        navigate('/', { replace: true });
        return;
      }

      const data = await response.json();
      if (!data.user) {
        navigate('/', { replace: true });
      } else {
        setSession(data);
      }
    } catch (err) {
      console.error('Failed to load session:', err);
      navigate('/', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    const timestamp = Date.now();
    window.location.href = `${BFF_URL}/api/logout?t=${timestamp}`;
  };

  if (loading) {
    return (
      <main style={{ 
        fontFamily: 'Inter, sans-serif', 
        padding: '2rem',
        textAlign: 'center'
      }}>
        <p>Loading...</p>
      </main>
    );
  }

  if (!session || !session.user) {
    return null; // Will redirect
  }

  return (
    <main style={{ 
      fontFamily: 'Inter, sans-serif', 
      padding: '2rem',
      maxWidth: 800,
      margin: '0 auto'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '3rem',
        borderRadius: 12,
        color: 'white',
        textAlign: 'center',
        marginBottom: '2rem',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ fontSize: '3rem', margin: 0, marginBottom: '1rem' }}>
          Hello World! 🎉
        </h1>
        <p style={{ fontSize: '1.2rem', margin: 0 }}>
          Welcome, {session.user?.name || session.user?.email || 'User'}!
        </p>
      </div>

      <section style={{ 
        background: '#f6f8fa', 
        padding: '1.5rem', 
        borderRadius: 8,
        marginBottom: '2rem'
      }}>
        <h2 style={{ marginTop: 0 }}>User Information</h2>
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          <div>
            <strong>Name:</strong> {session.user?.name || 'N/A'}
          </div>
          <div>
            <strong>Email:</strong> {session.user?.email || 'N/A'}
          </div>
          <div>
            <strong>Session Expires:</strong> {session.expires ? new Date(session.expires).toLocaleString() : 'N/A'}
          </div>
        </div>
      </section>

      <section style={{ 
        background: '#fff3cd', 
        padding: '1.5rem', 
        borderRadius: 8,
        marginBottom: '2rem',
        border: '1px solid #ffc107'
      }}>
        <h2 style={{ marginTop: 0, color: '#856404' }}>🔒 Security Benefits</h2>
        <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#856404' }}>
          <li>Access tokens are stored server-side in BFF</li>
          <li>No tokens exposed to browser JavaScript</li>
          <li>Protected against XSS attacks</li>
          <li>Session managed via HTTPOnly cookies</li>
        </ul>
      </section>

      <div style={{ textAlign: 'center' }}>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            background: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            marginRight: '1rem'
          }}
        >
          Back to Home
        </button>
        <button
          onClick={logout}
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            background: '#d32f2f',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>
    </main>
  );
};

export default Dashboard;

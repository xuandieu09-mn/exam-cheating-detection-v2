import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ScopeConsentPopup from './components/ScopeConsentPopup';

const BFF_URL = import.meta.env.VITE_BFF_URL ?? 'http://localhost:8080';

const App = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showConsentPopup, setShowConsentPopup] = useState(false);
  const [justLoggedIn, setJustLoggedIn] = useState(false);

  useEffect(() => {
    loadSession();
  }, []);

  useEffect(() => {
    // Show consent popup if user just logged in
    if (session && session.user && justLoggedIn) {
      const hasSeenConsent = sessionStorage.getItem('consentShown');
      if (!hasSeenConsent) {
        setShowConsentPopup(true);
        sessionStorage.setItem('consentShown', 'true');
      }
      setJustLoggedIn(false);
    }
  }, [session, justLoggedIn]);

  const loadSession = async () => {
    try {
      const response = await fetch(`${BFF_URL}/api/session`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        const wasLoggedOut = !session;
        setSession(data);
        // Mark as just logged in if we went from no session to having one
        if (wasLoggedOut && data && data.user) {
          setJustLoggedIn(true);
        }
      } else {
        setSession(null);
      }
    } catch (err) {
      console.error('Failed to load session:', err);
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  const login = () => {
    // Redirect to BFF login endpoint with callbackUrl
    const callbackUrl = encodeURIComponent(window.location.origin);
    window.location.href = `${BFF_URL}/api/auth/signin?callbackUrl=${callbackUrl}`;
  };

  const logout = () => {
    // Clear consent shown flag
    sessionStorage.removeItem('consentShown');
    
    // Clear local state immediately
    setSession(null);
    
    // Redirect to custom logout endpoint with timestamp to bypass cache
    const timestamp = Date.now();
    window.location.href = `${BFF_URL}/api/logout?t=${timestamp}`;
  };

  const handleConsentClose = () => {
    setShowConsentPopup(false);
  };

  const goToDashboard = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <main style={{ fontFamily: 'Inter, sans-serif', padding: '2rem', maxWidth: 640, margin: '0 auto' }}>
        <p>Loading...</p>
      </main>
    );
  }

  const isAuthenticated = session && session.user;

  return (
    <>
      {showConsentPopup && <ScopeConsentPopup session={session} onClose={handleConsentClose} />}
      <main style={{ fontFamily: 'Inter, sans-serif', padding: '2rem', maxWidth: 640, margin: '0 auto' }}>
        <h1>Exam Platform Auth Sandbox</h1>
      <p>This application uses BFF Gateway for authentication. All tokens are stored server-side for better security.</p>

      <section style={{ marginTop: '1.5rem' }}>
        {!isAuthenticated ? (
          <>
            <button onClick={login} style={{ marginRight: '1rem' }}>
              Login with BFF Gateway
            </button>
            <button 
              onClick={() => navigate('/register')} 
              style={{ 
                background: '#4caf50', 
                color: 'white', 
                border: 'none', 
                padding: '0.5rem 1rem', 
                borderRadius: 4, 
                cursor: 'pointer' 
              }}
            >
              Register New Account
            </button>
          </>
        ) : (
          <>
            <button onClick={goToDashboard} style={{ marginRight: '1rem' }}>
              Go to Dashboard
            </button>
            <button onClick={logout} style={{ marginRight: '1rem' }}>
              Logout
            </button>
            <button onClick={loadSession}>Refresh Session</button>
          </>
        )}
      </section>

      {error && (
        <div style={{ marginTop: '1rem', color: '#b00020' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <section style={{ marginTop: '2rem' }}>
        <h2>Session Snapshot</h2>
        {isAuthenticated ? (
          <pre style={{ background: '#f6f8fa', padding: '1rem', borderRadius: 4, overflow: 'auto' }}>
            {JSON.stringify(
              {
                user: session.user,
                expiresAt: session.expires,
                error: session.error
              },
              null,
              2
            )}
          </pre>
        ) : (
          <p>No user logged in yet.</p>
        )}
      </section>

      <section style={{ marginTop: '2rem', padding: '1rem', background: '#e3f2fd', borderRadius: 4 }}>
        <h3>ℹ️ BFF Mode Benefits:</h3>
        <ul>
          <li>✅ Access tokens stored server-side (not in browser)</li>
          <li>✅ Refresh tokens handled automatically by BFF</li>
          <li>✅ Better security - no token exposure to XSS</li>
          <li>✅ HTTPOnly cookies for session management</li>
        </ul>
      </section>
      </main>
    </>
  );
};

export default App;

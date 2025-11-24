import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BFF_URL = import.meta.env.VITE_BFF_URL ?? 'http://localhost:8080';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // BFF handles the OAuth callback automatically
    // This component just needs to verify session and redirect
    const verifyAndRedirect = async () => {
      try {
        const response = await fetch(`${BFF_URL}/api/session`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            navigate('/dashboard', { replace: true });
            return;
          }
        }
        
        // If no valid session, go to home
        navigate('/', { replace: true });
      } catch (err) {
        console.error('Auth callback error:', err);
        navigate('/', { replace: true });
      }
    };

    verifyAndRedirect();
  }, [navigate]);

  return (
    <div style={{ 
      fontFamily: 'Inter, sans-serif', 
      padding: '2rem', 
      textAlign: 'center' 
    }}>
      <p>Completing authentication...</p>
    </div>
  );
};

export default AuthCallback;

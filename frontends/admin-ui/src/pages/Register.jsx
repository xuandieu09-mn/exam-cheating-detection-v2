import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BFF_URL = import.meta.env.VITE_BFF_URL ?? 'http://localhost:8080';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${BFF_URL}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'Registration failed');
      }

      // Registration successful, navigate to home page to login
      alert('Registration successful! You can now login.');
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ 
      fontFamily: 'Inter, sans-serif', 
      padding: '2rem', 
      maxWidth: 480, 
      margin: '0 auto' 
    }}>
      <h1>Register New Account</h1>
      <p style={{ color: '#666' }}>
        Create an account to access the Exam Platform
      </p>

      <form onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="username" style={{ display: 'block', marginBottom: '0.5rem' }}>
            Username <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            id="username"
            name="username"
            type="text"
            required
            minLength={4}
            maxLength={50}
            value={formData.username}
            onChange={handleChange}
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.5rem',
              fontSize: '1rem',
              border: '1px solid #ccc',
              borderRadius: 4,
              boxSizing: 'border-box'
            }}
          />
          <small style={{ color: '#666' }}>Min 4 characters</small>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem' }}>
            Email <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.5rem',
              fontSize: '1rem',
              border: '1px solid #ccc',
              borderRadius: 4,
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem' }}>
            Password <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            maxLength={72}
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.5rem',
              fontSize: '1rem',
              border: '1px solid #ccc',
              borderRadius: 4,
              boxSizing: 'border-box'
            }}
          />
          <small style={{ color: '#666' }}>Min 8 characters</small>
        </div>

        {error && (
          <div style={{ 
            marginBottom: '1rem', 
            padding: '0.75rem', 
            background: '#fee', 
            color: '#b00020',
            borderRadius: 4
          }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.75rem',
            fontSize: '1rem',
            background: loading ? '#ccc' : '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>

      <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#1976d2',
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
        >
          Already have an account? Login here
        </button>
      </div>
    </main>
  );
};

export default Register;

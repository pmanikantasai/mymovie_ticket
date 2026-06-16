import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, AlertCircle, Film } from 'lucide-react';
import api from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('users/login/', formData);
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Redirect to home page
      navigate('/');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 70px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'radial-gradient(circle at center, #1b2336 0%, var(--bg-primary) 70%)'
    }}>
      <div className="glass" style={{
        width: '100%',
        maxWidth: '420px',
        padding: '2.5rem',
        borderRadius: '16px',
        boxShadow: 'var(--shadow-main)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center' }}>
          <span style={{
            color: 'var(--accent-pink)',
            fontSize: '2rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            marginBottom: '0.5rem'
          }}>
            <Film size={32} /> ShowTime
          </span>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Welcome back! Log in to book tickets</p>
        </div>

        {/* Demo Credentials Alert */}
        <div style={{
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '8px',
          padding: '0.6rem 0.8rem',
          fontSize: '0.8rem',
          color: '#93c5fd',
          lineHeight: '1.4'
        }}>
          <strong>Demo Accounts:</strong><br />
          Customer: <code>john_doe</code> / <code>user123</code><br />
          Admin: <code>admin</code> / <code>admin123</code>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#fca5a5',
            padding: '0.6rem 0.8rem',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            fontSize: '0.85rem'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', position: 'relative' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Username</label>
            <input
              type="text"
              name="username"
              required
              value={formData.username}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.7rem 1rem 0.7rem 2.5rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: 'rgba(255, 255, 255, 0.03)',
                outline: 'none',
                fontSize: '0.9rem'
              }}
            />
            <User size={16} style={{ position: 'absolute', bottom: '0.9rem', left: '1rem', color: 'var(--text-muted)' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', position: 'relative' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Password</label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.7rem 1rem 0.7rem 2.5rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: 'rgba(255, 255, 255, 0.03)',
                outline: 'none',
                fontSize: '0.9rem'
              }}
            />
            <Lock size={16} style={{ position: 'absolute', bottom: '0.9rem', left: '1rem', color: 'var(--text-muted)' }} />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="glow-btn"
            style={{
              width: '100%',
              padding: '0.8rem',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 700,
              marginTop: '0.5rem'
            }}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--accent-pink)', fontWeight: 600 }}>
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

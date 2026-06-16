import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, Mail, Phone, AlertCircle, Film } from 'lucide-react';
import api from '../services/api';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone_number: '',
    password: '',
    confirm_password: '',
    role: 'customer' // Defaults to customer
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match.');
      return;
    }
    
    setLoading(true);
    try {
      await api.post('users/register/', formData);
      // Success - redirect to login
      navigate('/login');
    } catch (err) {
      console.error(err);
      if (err.response?.data) {
        // Handle field specific error objects from django serializer validation
        const fieldErrors = err.response.data;
        if (typeof fieldErrors === 'object') {
          const firstKey = Object.keys(fieldErrors)[0];
          setError(`${firstKey}: ${fieldErrors[firstKey]}`);
        } else {
          setError('Registration failed. Please check inputs.');
        }
      } else {
        setError('Server error. Please try again later.');
      }
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
        maxWidth: '450px',
        padding: '2.5rem',
        borderRadius: '16px',
        boxShadow: 'var(--shadow-main)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
      }}>
        {/* Header */}
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
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Create an account to start booking movies</p>
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

        {/* Form */}
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
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Email</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
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
            <Mail size={16} style={{ position: 'absolute', bottom: '0.9rem', left: '1rem', color: 'var(--text-muted)' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', position: 'relative' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Phone Number</label>
            <input
              type="text"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="e.g. +91 9999988888"
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
            <Phone size={16} style={{ position: 'absolute', bottom: '0.9rem', left: '1rem', color: 'var(--text-muted)' }} />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem', position: 'relative' }}>
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

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem', position: 'relative' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Confirm Password</label>
              <input
                type="password"
                name="confirm_password"
                required
                value={formData.confirm_password}
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
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Register As</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="role"
                  value="customer"
                  checked={formData.role === 'customer'}
                  onChange={handleChange}
                  style={{ accentColor: 'var(--accent-pink)' }}
                />
                <span>Customer</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  checked={formData.role === 'admin'}
                  onChange={handleChange}
                  style={{ accentColor: 'var(--accent-pink)' }}
                />
                <span>Administrator</span>
              </label>
            </div>
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
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent-pink)', fontWeight: 600 }}>
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;

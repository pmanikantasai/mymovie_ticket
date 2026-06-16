import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, User, LogOut, ChevronDown, Film, Settings } from 'lucide-react';
import api from '../services/api';

const Navbar = ({ onSearch, selectedCity, onCityChange }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [location]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
    setShowDropdown(false);
    navigate('/login');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <nav className="glass" style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '0.8rem 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '1px solid var(--border-color)',
      height: '70px'
    }}>
      {/* Brand Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{
          color: 'var(--accent-pink)',
          fontSize: '1.8rem',
          fontWeight: 800,
          letterSpacing: '1px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.2rem'
        }}>
          <Film size={28} /> ShowTime
        </span>
      </Link>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} style={{
        flex: '0 1 500px',
        margin: '0 2rem',
        position: 'relative',
        display: 'flex',
        alignItems: 'center'
      }}>
        <input
          type="text"
          placeholder="Search for Movies, Series or Categories..."
          value={searchTerm}
          onChange={handleSearchChange}
          style={{
            width: '100%',
            padding: '0.6rem 1rem 0.6rem 2.8rem',
            borderRadius: '25px',
            border: '1px solid var(--border-color)',
            background: 'rgba(255, 255, 255, 0.05)',
            fontSize: '0.9rem',
            outline: 'none',
            transition: 'border-color 0.3s ease'
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--accent-pink)'}
          onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
        />
        <Search size={18} style={{
          position: 'absolute',
          left: '1rem',
          color: 'var(--text-muted)'
        }} />
      </form>

      {/* Actions (City + Auth) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        {/* City Select */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
          <select
            value={selectedCity}
            onChange={(e) => onCityChange(e.target.value)}
            style={{
              appearance: 'none',
              background: 'transparent',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              outline: 'none',
              paddingRight: '1.5rem',
              color: 'var(--text-primary)'
            }}
          >
            <option value="All Cities" style={{ background: 'var(--bg-primary)' }}>All Cities</option>
            <option value="New Delhi" style={{ background: 'var(--bg-primary)' }}>New Delhi</option>
            <option value="Bengaluru" style={{ background: 'var(--bg-primary)' }}>Bengaluru</option>
            <option value="Mumbai" style={{ background: 'var(--bg-primary)' }}>Mumbai</option>
            <option value="Gurgaon" style={{ background: 'var(--bg-primary)' }}>Gurgaon</option>
          </select>
          <ChevronDown size={14} style={{
            position: 'absolute',
            right: 0,
            pointerEvents: 'none',
            color: 'var(--text-secondary)'
          }} />
        </div>

        {/* User Account / Login */}
        {user ? (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-color)',
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '0.9rem'
              }}
            >
              <User size={16} />
              <span>Hi, {user.username}</span>
              <ChevronDown size={14} />
            </button>

            {/* Dropdown Card */}
            {showDropdown && (
              <div className="glass" style={{
                position: 'absolute',
                top: '120%',
                right: 0,
                width: '200px',
                borderRadius: '10px',
                padding: '0.5rem 0',
                boxShadow: 'var(--shadow-main)',
                zIndex: 10
              }}>
                <Link
                  to="/dashboard"
                  onClick={() => setShowDropdown(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.8rem',
                    padding: '0.6rem 1.2rem',
                    fontSize: '0.9rem',
                    transition: 'background 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.05)'}
                  onMouseLeave={(e) => e.target.style.background = 'transparent'}
                >
                  <User size={16} /> Booking History
                </Link>
                
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setShowDropdown(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.8rem',
                      padding: '0.6rem 1.2rem',
                      fontSize: '0.9rem',
                      color: 'var(--accent-pink)',
                      transition: 'background 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.05)'}
                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                  >
                    <Settings size={16} /> Admin Panel
                  </Link>
                )}
                
                <hr style={{ border: 'none', borderBottom: '1px solid var(--border-color)', margin: '0.4rem 0' }} />
                
                <button
                  onClick={handleLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.8rem',
                    padding: '0.6rem 1.2rem',
                    fontSize: '0.9rem',
                    width: '100%',
                    textAlign: 'left',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#ef4444',
                    transition: 'background 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.05)'}
                  onMouseLeave={(e) => e.target.style.background = 'transparent'}
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className="glow-btn" style={{
            padding: '0.5rem 1.2rem',
            borderRadius: '20px',
            fontSize: '0.9rem',
            textAlign: 'center',
            display: 'inline-block'
          }}>
            Login / Signup
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

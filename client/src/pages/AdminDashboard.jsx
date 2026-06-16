import React, { useState, useEffect } from 'react';
import { Film, Calendar, Plus, Users, MapPin, Database, Award, DollarSign, AlertCircle, CheckCircle, TrendingUp, Settings } from 'lucide-react';
import api from '../services/api';
import { ChartSkeleton, TableSkeleton } from '../components/LoadingSkeleton';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');
  const [error, setError] = useState('');

  // Movie Form state
  const [movieForm, setMovieForm] = useState({
    title: '', description: '', duration_minutes: 120, rating: 'UA',
    user_rating: 8.0, poster_url: '', trailer_url: '', release_date: '',
    category: 'Action', language: 'English', is_trending: false, is_upcoming: false
  });
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const analyticsRes = await api.get('users/admin/analytics/');
      setAnalytics(analyticsRes.data);

      const usersRes = await api.get('users/admin/users/');
      setUsers(usersRes.data.results || usersRes.data);

      const moviesRes = await api.get('movies/list/');
      setMovies(moviesRes.data.results || moviesRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch admin dashboard metadata.');
    } finally {
      setLoading(false);
    }
  };

  const handleMovieSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    try {
      const castMock = [
        { name: 'Lead Actor', role: 'Main Character', image: '' },
        { name: 'Supporting Actor', role: 'Side Character', image: '' }
      ];
      await api.post('movies/list/', {
        ...movieForm,
        cast: castMock
      });
      setFormSuccess('Movie successfully created and scheduled!');
      setMovieForm({
        title: '', description: '', duration_minutes: 120, rating: 'UA',
        user_rating: 8.0, poster_url: '', trailer_url: '', release_date: '',
        category: 'Action', language: 'English', is_trending: false, is_upcoming: false
      });
      // Refresh
      fetchAdminData();
    } catch (err) {
      console.error(err);
      setFormError('Failed to create movie. Please verify form details.');
    }
  };

  const handleCheckboxChange = (e) => {
    setMovieForm({ ...movieForm, [e.target.name]: e.target.checked });
  };

  const handleInputChange = (e) => {
    setMovieForm({ ...movieForm, [e.target.name]: e.target.value });
  };

  // SVG Chart Helper: Monthly Revenue Trend Line
  const renderMonthlyChart = () => {
    if (!analytics || !analytics.monthly_analytics || analytics.monthly_analytics.length === 0) return null;
    const data = analytics.monthly_analytics;
    const maxVal = Math.max(...data.map(d => d.revenue)) || 1000;
    
    const width = 500;
    const height = 180;
    const padding = 25;
    
    const points = data.map((d, i) => {
      const x = padding + (i * (width - padding * 2) / (data.length - 1));
      const y = height - padding - (d.revenue * (height - padding * 2) / maxVal);
      return { x, y, label: d.month, value: d.revenue };
    });
    
    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaPath = points.length > 0 
      ? `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z` 
      : '';
      
    return (
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent-pink)" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="var(--accent-pink)" stopOpacity="0"/>
          </linearGradient>
        </defs>
        
        {/* Grid lines */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="var(--border-color)" strokeWidth="1" />
        <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="var(--border-color)" strokeDasharray="3" strokeWidth="1" />
        
        {/* Shaded Area */}
        <path d={areaPath} fill="url(#areaGrad)" />
        
        {/* Trend Line */}
        <path d={linePath} fill="none" stroke="var(--accent-pink)" strokeWidth="3" />
        
        {/* Points & Labels */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="5" fill="var(--accent-pink)" stroke="var(--bg-surface)" strokeWidth="2" />
            {/* Value tooltip label */}
            <text x={p.x} y={p.y - 10} textAnchor="middle" fill="var(--text-primary)" fontSize="8" fontWeight="bold">
              ₹{p.value.toFixed(0)}
            </text>
            {/* Axis Month label */}
            <text x={p.x} y={height - 8} textAnchor="middle" fill="var(--text-secondary)" fontSize="8">
              {p.label}
            </text>
          </g>
        ))}
      </svg>
    );
  };

  // SVG Chart Helper: Theater Performance Bars
  const renderTheaterChart = () => {
    if (!analytics || !analytics.theater_performance || analytics.theater_performance.length === 0) return null;
    const data = analytics.theater_performance;
    const maxVal = Math.max(...data.map(d => d.revenue)) || 1000;
    
    const width = 500;
    const height = 180;
    const padding = 30;
    
    const barWidth = 35;
    const spacing = (width - padding * 2) / data.length;
    
    return (
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
        {/* Grid lines */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="var(--border-color)" strokeWidth="1" />
        
        {data.map((d, i) => {
          const x = padding + (i * spacing) + (spacing - barWidth) / 2;
          const barHeight = (d.revenue * (height - padding * 2) / maxVal) || 5;
          const y = height - padding - barHeight;
          const shortName = d.name.length > 18 ? d.name.substring(0, 15) + '...' : d.name;
          
          return (
            <g key={i}>
              {/* Rounded Corner Bar */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx="4"
                fill="#3b82f6"
                style={{ transition: 'all 0.3s ease' }}
              />
              {/* Value Text */}
              <text x={x + barWidth / 2} y={y - 8} textAnchor="middle" fill="var(--text-primary)" fontSize="8" fontWeight="bold">
                ₹{d.revenue.toFixed(0)}
              </text>
              {/* Theater Label */}
              <text x={x + barWidth / 2} y={height - 10} textAnchor="middle" fill="var(--text-secondary)" fontSize="7">
                {shortName}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  if (loading) {
    return (
      <div style={{ width: '100%', maxWidth: '1200px', margin: '2rem auto', padding: '0 2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div className="skeleton" style={{ height: '80px', borderRadius: '12px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Admin Dashboard</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Real-time movie scheduling, ticket sales metrics, and account analytics</p>
        </div>
        <button onClick={fetchAdminData} className="glow-btn" style={{ padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.85rem' }}>
          Refresh Data
        </button>
      </div>

      {/* Navigation tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        {['Overview', 'Add Movie', 'Manage Movies', 'View Users'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '0.5rem 1.2rem',
              border: 'none',
              background: 'transparent',
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: 'pointer',
              color: activeTab === tab ? 'var(--accent-pink)' : 'var(--text-secondary)',
              borderBottom: activeTab === tab ? '2px solid var(--accent-pink)' : 'none',
              transition: 'all 0.3s ease'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* TAB CONTENTS */}

      {/* 1. OVERVIEW (CHARTS AND METRICS) */}
      {activeTab === 'Overview' && analytics && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Key metrics cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.5rem'
          }}>
            <div className="glass" style={{ padding: '1.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid var(--border-color)' }}>
              <div style={{ background: 'rgba(248, 68, 100, 0.1)', padding: '0.8rem', borderRadius: '10px' }}>
                <DollarSign size={24} color="var(--accent-pink)" />
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Revenue</span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>₹{analytics.stats.total_revenue.toLocaleString()}</h3>
              </div>
            </div>
            <div className="glass" style={{ padding: '1.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid var(--border-color)' }}>
              <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '0.8rem', borderRadius: '10px' }}>
                <Database size={24} color="#3b82f6" />
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Bookings</span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{analytics.stats.total_bookings}</h3>
              </div>
            </div>
            <div className="glass" style={{ padding: '1.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid var(--border-color)' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.8rem', borderRadius: '10px' }}>
                <Film size={24} color="#10b981" />
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Active Movies</span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{analytics.stats.total_movies}</h3>
              </div>
            </div>
            <div className="glass" style={{ padding: '1.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid var(--border-color)' }}>
              <div style={{ background: 'rgba(234, 179, 8, 0.1)', padding: '0.8rem', borderRadius: '10px' }}>
                <Users size={24} color="#eab308" />
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Registered Users</span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{analytics.stats.total_users}</h3>
              </div>
            </div>
          </div>

          {/* SVG Charts display */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '2rem'
          }}>
            <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <TrendingUp size={16} color="var(--accent-pink)" /> Monthly Revenue Trend (INR)
              </h4>
              <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {renderMonthlyChart()}
              </div>
            </div>

            <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MapPin size={16} color="#3b82f6" /> Theater Sales Distribution (INR)
              </h4>
              <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {renderTheaterChart()}
              </div>
            </div>
          </div>

          {/* Seat breakdown donut layout representation */}
          <div className="glass" style={{ padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, flex: '1 1 100%' }}>Seat Booking Category Metrics</h4>
            {analytics.category_breakdown.map((cat, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: '1 1 200px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: cat.color }} />
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>{cat.category} Class Bookings</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>{cat.count} Seats Booked</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. ADD MOVIE FORM */}
      {activeTab === 'Add Movie' && (
        <div className="glass" style={{ padding: '2.5rem', borderRadius: '16px', border: '1px solid var(--border-color)', maxWidth: '800px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Catalog New Movie</h3>
          
          {formSuccess && (
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#a7f3d0', padding: '0.8rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
              <CheckCircle size={16} />
              <span>{formSuccess}</span>
            </div>
          )}

          {formError && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', padding: '0.8rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
              <AlertCircle size={16} />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleMovieSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Movie Title</label>
                <input type="text" name="title" required value={movieForm.title} onChange={handleInputChange} style={{ padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.03)', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Category / Genre (Comma Separated)</label>
                <input type="text" name="category" placeholder="Sci-Fi, Action" required value={movieForm.category} onChange={handleInputChange} style={{ padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.03)', outline: 'none' }} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Description</label>
              <textarea name="description" rows="3" required value={movieForm.description} onChange={handleInputChange} style={{ padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.03)', outline: 'none', resize: 'vertical' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Duration (Minutes)</label>
                <input type="number" name="duration_minutes" required value={movieForm.duration_minutes} onChange={handleInputChange} style={{ padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.03)', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Language</label>
                <input type="text" name="language" required value={movieForm.language} onChange={handleInputChange} style={{ padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.03)', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Rating Grade</label>
                <select name="rating" value={movieForm.rating} onChange={handleInputChange} style={{ padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', outline: 'none' }}>
                  <option value="U">U</option>
                  <option value="UA">UA</option>
                  <option value="A">A</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Release Date</label>
                <input type="date" name="release_date" required value={movieForm.release_date} onChange={handleInputChange} style={{ padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.03)', outline: 'none' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Poster URL</label>
                <input type="url" name="poster_url" required value={movieForm.poster_url} onChange={handleInputChange} style={{ padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.03)', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Trailer Embed URL</label>
                <input type="url" name="trailer_url" value={movieForm.trailer_url} onChange={handleInputChange} placeholder="https://www.youtube.com/embed/XXXX" style={{ padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.03)', outline: 'none' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '2rem', margin: '0.5rem 0' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                <input type="checkbox" name="is_trending" checked={movieForm.is_trending} onChange={handleCheckboxChange} style={{ accentColor: 'var(--accent-pink)' }} />
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Mark as Trending</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                <input type="checkbox" name="is_upcoming" checked={movieForm.is_upcoming} onChange={handleCheckboxChange} style={{ accentColor: 'var(--accent-pink)' }} />
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Mark as Upcoming</span>
              </label>
            </div>

            <button type="submit" className="glow-btn" style={{ padding: '0.8rem', borderRadius: '8px', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
              <Plus size={18} /> Add Movie to Catalog
            </button>
          </form>
        </div>
      )}

      {/* 3. MANAGE MOVIES */}
      {activeTab === 'Manage Movies' && (
        <div className="glass" style={{ padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.8rem' }}>Movie Details</th>
                <th style={{ padding: '0.8rem' }}>Language</th>
                <th style={{ padding: '0.8rem' }}>Category</th>
                <th style={{ padding: '0.8rem' }}>Release Date</th>
                <th style={{ padding: '0.8rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {movies.map((m) => (
                <tr key={m.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.3s ease' }}>
                  <td style={{ padding: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <img src={m.poster_url} alt={m.title} style={{ width: '30px', height: '45px', objectFit: 'cover', borderRadius: '4px' }} />
                    <span style={{ fontWeight: 700 }}>{m.title}</span>
                  </td>
                  <td style={{ padding: '0.8rem' }}>{m.language}</td>
                  <td style={{ padding: '0.8rem' }}>{m.category}</td>
                  <td style={{ padding: '0.8rem' }}>{m.release_date}</td>
                  <td style={{ padding: '0.8rem' }}>
                    {m.is_trending && <span style={{ background: 'rgba(248, 68, 100, 0.1)', color: 'var(--accent-pink)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, marginRight: '0.4rem' }}>Trending</span>}
                    {m.is_upcoming && <span style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>Upcoming</span>}
                    {!m.is_trending && !m.is_upcoming && <span style={{ color: 'var(--text-muted)' }}>Standard</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 4. VIEW USERS */}
      {activeTab === 'View Users' && (
        <div className="glass" style={{ padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.8rem' }}>Username</th>
                <th style={{ padding: '0.8rem' }}>Email</th>
                <th style={{ padding: '0.8rem' }}>Role</th>
                <th style={{ padding: '0.8rem' }}>Phone Number</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.8rem', fontWeight: 700 }}>{u.username}</td>
                  <td style={{ padding: '0.8rem' }}>{u.email || 'N/A'}</td>
                  <td style={{ padding: '0.8rem' }}>
                    <span style={{
                      background: u.role === 'admin' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.05)',
                      color: u.role === 'admin' ? '#f87171' : 'var(--text-secondary)',
                      padding: '0.1rem 0.4rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase'
                    }}>{u.role}</span>
                  </td>
                  <td style={{ padding: '0.8rem' }}>{u.phone_number || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;

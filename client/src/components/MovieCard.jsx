import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

const MovieCard = ({ movie }) => {
  const { id, title, poster_url, user_rating, category, language, is_upcoming } = movie;

  return (
    <Link to={`/movie/${id}`} style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.6rem',
      width: '100%',
      maxWidth: '220px',
      textDecoration: 'none',
      cursor: 'pointer',
      group: 'true'
    }}>
      {/* Poster Image Container */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '320px',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-main)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-surface)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-8px)';
        e.currentTarget.style.borderColor = 'var(--accent-pink)';
        e.currentTarget.style.boxShadow = 'var(--shadow-glow)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'var(--border-color)';
        e.currentTarget.style.boxShadow = 'var(--shadow-main)';
      }}
      >
        {poster_url ? (
          <img
            src={poster_url}
            alt={title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
            onError={(e) => {
              // Fallback to title placeholder if URL fails
              e.target.style.display = 'none';
            }}
          />
        ) : null}

        {/* Overlay if image fails or missing */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.8) 20%, transparent 100%)',
          zIndex: 1
        }} />

        {/* Top Badges (Trending/Upcoming) */}
        {is_upcoming && (
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            background: '#3b82f6',
            color: 'white',
            padding: '0.2rem 0.6rem',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: 700,
            zIndex: 2,
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Upcoming
          </div>
        )}

        {/* Rating Panel (Standard BookMyShow style overlay at bottom of poster) */}
        {!is_upcoming && user_rating > 0 && (
          <div style={{
            position: 'absolute',
            bottom: '10px',
            left: '10px',
            right: '10px',
            background: 'rgba(11, 15, 25, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '0.4rem 0.8rem',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            zIndex: 2,
            backdropFilter: 'blur(4px)'
          }}>
            <Star size={16} fill="var(--accent-pink)" color="var(--accent-pink)" />
            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{Number(user_rating).toFixed(1)}/10</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: 'auto' }}>Ratings</span>
          </div>
        )}
      </div>

      {/* Meta Text */}
      <div style={{ padding: '0 0.2rem' }}>
        <h3 style={{
          fontSize: '1rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          marginBottom: '0.2rem'
        }}>
          {title}
        </h3>
        <p style={{
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <span>{language}</span>
          <span style={{
            maxWidth: '120px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>{category}</span>
        </p>
      </div>
    </Link>
  );
};

export default MovieCard;

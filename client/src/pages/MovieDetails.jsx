import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Clock, Calendar, Heart, Share2, Award, ChevronRight } from 'lucide-react';
import api from '../services/api';
import { MovieDetailSkeleton } from '../components/LoadingSkeleton';
import ShowTimeSelector from '../components/ShowTimeSelector';

const MovieDetails = ({ city }) => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMovieDetails();
  }, [id]);

  const fetchMovieDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get(`movies/list/${id}/`);
      setMovie(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch movie details. Check if the movie ID is correct.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <MovieDetailSkeleton />;

  if (error || !movie) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#fca5a5' }}>
        <h2>Error Loading Movie</h2>
        <p style={{ margin: '1rem 0' }}>{error || 'Movie not found.'}</p>
        <Link to="/" style={{ color: 'var(--accent-pink)', fontWeight: 600 }}>Back to Home</Link>
      </div>
    );
  }

  const hasTrailer = movie.trailer_url && movie.trailer_url !== 'https://www.youtube.com/embed/trailer';

  return (
    <div style={{ paddingBottom: '5rem' }}>
      
      {/* 1. Jumbotron Backdrop Banner */}
      <div style={{
        position: 'relative',
        minHeight: '380px',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        background: 'black',
        overflow: 'hidden'
      }}>
        {/* Blurry Backdrop */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${movie.poster_url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 15%',
          filter: 'blur(25px) brightness(0.2)',
          transform: 'scale(1.2)',
          zIndex: 0
        }} />

        {/* Content Box */}
        <div style={{
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '2rem',
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexWrap: 'wrap',
          gap: '2.5rem',
          alignItems: 'center'
        }}>
          {/* Main Poster */}
          <div style={{
            width: '220px',
            height: '330px',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 15px 35px rgba(0,0,0,0.6)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            flexShrink: 0,
            background: 'var(--bg-surface)'
          }}>
            <img src={movie.poster_url} alt={movie.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          {/* Core Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', flex: '1 1 500px' }}>
            <h1 style={{ fontSize: '2.8rem', fontWeight: 800, lineHeight: '1.1' }}>{movie.title}</h1>
            
            {/* Badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.8rem' }}>
              {!movie.is_upcoming && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  background: 'rgba(255, 255, 255, 0.08)',
                  padding: '0.3rem 0.8rem',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  fontWeight: 600
                }}>
                  <Star size={16} fill="var(--accent-pink)" color="var(--accent-pink)" />
                  <span>{Number(movie.user_rating).toFixed(1)}/10</span>
                </div>
              )}
              <div style={{
                background: 'rgba(255, 255, 255, 0.08)',
                padding: '0.3rem 0.8rem',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: 600
              }}>
                {movie.rating}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                {movie.language}
              </div>
            </div>

            {/* Icons row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Clock size={16} />
                <span>{movie.duration_minutes} Minutes</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Calendar size={16} />
                <span>Released {new Date(movie.release_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
              </div>
            </div>

            <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              <strong>Category:</strong> {movie.category}
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <a href="#show-selector" className="glow-btn" style={{
                padding: '0.8rem 2rem',
                borderRadius: '30px',
                fontSize: '1rem',
                display: 'inline-block',
                textAlign: 'center'
              }}>
                Book Tickets
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Shade */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '60px',
          background: 'linear-gradient(to top, var(--bg-primary), transparent)'
        }} />
      </div>

      {/* 2. Main Page Layout Grid (Split description + trailer / Show schedule) */}
      <div style={{
        width: '100%',
        maxWidth: '1200px',
        margin: '2rem auto 0 auto',
        padding: '0 2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '3rem'
      }}>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '3rem'
        }}>
          {/* Left Block: About & Cast */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>About the Movie</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                {movie.description}
              </p>
            </div>

            {/* Cast List */}
            {movie.cast && movie.cast.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Cast & Crew</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.2rem' }}>
                  {movie.cast.map((actor, idx) => (
                    <div key={idx} className="glass" style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.8rem',
                      padding: '0.6rem 1rem',
                      borderRadius: '10px',
                      flex: '1 1 180px',
                      boxShadow: 'var(--shadow-main)'
                    }}>
                      <div style={{
                        width: '45px',
                        height: '45px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        background: 'var(--bg-surface)',
                        flexShrink: 0
                      }}>
                        {actor.image ? (
                          <img src={actor.image} alt={actor.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>
                            {actor.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {actor.name}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          as {actor.role}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Block: Trailer Integration */}
          {hasTrailer && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Official Trailer</h2>
              <div style={{
                position: 'relative',
                width: '100%',
                paddingTop: '56.25%', /* 16:9 Aspect Ratio */
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-main)',
                border: '1px solid var(--border-color)',
                background: 'black'
              }}>
                <iframe
                  src={movie.trailer_url}
                  title={`${movie.title} Official Trailer`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%'
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* 3. Shows / Timing Selection Anchor */}
        <hr style={{ border: 'none', borderBottom: '1px solid var(--border-color)', margin: '1rem 0' }} />
        
        <div id="show-selector" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', scrollMarginTop: '80px' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Select Theater & Showtimes</h2>
          {!movie.is_upcoming ? (
            <ShowTimeSelector movieId={movie.id} city={city} />
          ) : (
            <div style={{
              padding: '3rem',
              textAlign: 'center',
              background: 'var(--bg-surface)',
              borderRadius: '12px',
              color: 'var(--text-secondary)'
            }}>
              <Award size={36} style={{ marginBottom: '0.8rem', opacity: 0.5 }} />
              <p style={{ fontWeight: 600 }}>This movie is upcoming!</p>
              <p style={{ fontSize: '0.9rem' }}>Show times will be scheduled closer to the release date: {new Date(movie.release_date).toLocaleDateString()}.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default MovieDetails;

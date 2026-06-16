import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Flame, Calendar, Sparkles, AlertCircle, ChevronRight, Play } from 'lucide-react';
import api from '../services/api';
import MovieCard from '../components/MovieCard';
import { MovieCardSkeleton } from '../components/LoadingSkeleton';

const Home = ({ city }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const searchQuery = searchParams.get('search') || '';

  const categories = ['All', 'Action', 'Sci-Fi', 'Comedy', 'Drama', 'Adventure', 'Animation'];

  useEffect(() => {
    fetchMovies();
  }, [searchQuery, selectedCategory]);

  const fetchMovies = async () => {
    setLoading(true);
    setError('');
    try {
      let url = 'movies/list/';
      const params = [];
      
      if (searchQuery) {
        params.push(`search=${encodeURIComponent(searchQuery)}`);
      }
      if (selectedCategory && selectedCategory !== 'All') {
        params.push(`category=${encodeURIComponent(selectedCategory)}`);
      }

      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }

      const response = await api.get(url);
      setMovies(response.data.results || response.data); // Handle both paginated and unpaginated responses
    } catch (err) {
      console.error(err);
      setError('Failed to fetch movies. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  const trendingMovies = movies.filter(m => m.is_trending && !m.is_upcoming);
  const upcomingMovies = movies.filter(m => m.is_upcoming);
  const otherMovies = movies.filter(m => !m.is_trending && !m.is_upcoming);
  const featuredMovie = trendingMovies[0] || movies[0];

  return (
    <div style={{ paddingBottom: '4rem', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      
      {/* Featured Jumbotron Header */}
      {featuredMovie && !searchQuery && (
        <div style={{
          position: 'relative',
          height: '420px',
          width: '100%',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          background: 'black'
        }}>
          {/* Backdrop Image with blurred borders */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${featuredMovie.poster_url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 20%',
            filter: 'brightness(0.35) blur(10px)',
            transform: 'scale(1.1)',
            zIndex: 0
          }} />

          {/* Core Content Container */}
          <div style={{
            width: '100%',
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 2rem',
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '3rem'
          }}>
            {/* Poster Card */}
            <div style={{
              width: '180px',
              height: '270px',
              borderRadius: '10px',
              overflow: 'hidden',
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.1)',
              flexShrink: 0,
              display: 'none', // Hidden on mobile/small widths
              background: 'var(--bg-surface)'
            }} className="md-show">
              <img src={featuredMovie.poster_url} alt={featuredMovie.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            {/* Movie Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '600px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{
                  background: 'var(--accent-pink)',
                  color: 'white',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase'
                }}>Featured</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{featuredMovie.language} • {featuredMovie.duration_minutes} mins</span>
              </div>
              
              <h1 style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.5px' }}>{featuredMovie.title}</h1>
              
              <p style={{
                color: 'var(--text-secondary)',
                fontSize: '0.95rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical'
              }}>{featuredMovie.description}</p>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button
                  onClick={() => navigate(`/movie/${featuredMovie.id}`)}
                  className="glow-btn"
                  style={{
                    padding: '0.8rem 1.8rem',
                    borderRadius: '30px',
                    fontSize: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Play size={16} fill="white" /> Book Tickets
                </button>
              </div>
            </div>
          </div>

          {/* Bottom fade overlap */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '80px',
            background: 'linear-gradient(to top, var(--bg-primary), transparent)',
            zIndex: 1
          }} />
        </div>
      )}

      {/* Main Grid Section */}
      <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        
        {/* Category Chips Selector */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', alignItems: 'center' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '0.5rem 1.2rem',
                borderRadius: '20px',
                border: '1px solid',
                borderColor: selectedCategory === cat ? 'var(--accent-pink)' : 'var(--border-color)',
                background: selectedCategory === cat ? 'var(--accent-pink)' : 'rgba(255, 255, 255, 0.02)',
                color: selectedCategory === cat ? 'white' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                if (selectedCategory !== cat) e.currentTarget.style.borderColor = 'var(--text-secondary)';
              }}
              onMouseLeave={(e) => {
                if (selectedCategory !== cat) e.currentTarget.style.borderColor = 'var(--border-color)';
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Loading / Error States */}
        {error && (
          <div className="glass" style={{
            padding: '2rem',
            borderRadius: '12px',
            color: '#fca5a5',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            border: '1px solid rgba(239, 68, 68, 0.2)'
          }}>
            <AlertCircle size={24} />
            <div>
              <h4 style={{ fontWeight: 700, marginBottom: '0.2rem' }}>Error Loading Content</h4>
              <p style={{ fontSize: '0.9rem' }}>{error}</p>
            </div>
          </div>
        )}

        {/* Movie Sections */}
        {loading ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.8rem' }}>
            {Array.from({ length: 5 }).map((_, idx) => (
              <MovieCardSkeleton key={idx} />
            ))}
          </div>
        ) : movies.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            background: 'var(--bg-surface)',
            borderRadius: '12px',
            color: 'var(--text-secondary)'
          }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Movies Found</h3>
            <p style={{ fontSize: '0.95rem' }}>We couldn't find any movies matching "{searchQuery || selectedCategory}". Try searching something else.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            
            {/* Trending Section */}
            {trendingMovies.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Flame size={22} color="var(--accent-pink)" fill="var(--accent-pink)" />
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Trending Movies</h2>
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                  gap: '2rem'
                }}>
                  {trendingMovies.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming Section */}
            {upcomingMovies.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={22} color="#3b82f6" />
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Upcoming Movies</h2>
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                  gap: '2rem'
                }}>
                  {upcomingMovies.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                  ))}
                </div>
              </div>
            )}

            {/* General Section */}
            {otherMovies.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles size={22} color="#10b981" />
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Now Showing</h2>
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                  gap: '2rem'
                }}>
                  {otherMovies.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
};

export default Home;

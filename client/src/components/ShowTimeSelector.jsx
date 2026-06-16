import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin } from 'lucide-react';
import api from '../services/api';

const ShowTimeSelector = ({ movieId, city }) => {
  const navigate = useNavigate();
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showsByTheater, setShowsByTheater] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const datesList = [];
    const today = new Date();
    for (let i = 0; i < 4; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      datesList.push(d);
    }
    setDates(datesList);
    setSelectedDate(datesList[0]);
  }, []);

  useEffect(() => {
    if (selectedDate && movieId) {
      fetchShows();
    }
  }, [selectedDate, movieId, city]);

  const formatDateStr = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const fetchShows = async () => {
    setLoading(true);
    try {
      const dateStr = formatDateStr(selectedDate);
      const url = `movies/shows/?movie=${movieId}&date=${dateStr}`;
      const response = await api.get(url);
      
      let filteredShows = response.data.results || response.data;
      if (city && city !== 'All Cities') {
        filteredShows = filteredShows.filter(show => 
          show.theater_location.toLowerCase() === city.toLowerCase()
        );
      }
      
      // Group by theater ID
      const grouped = {};
      filteredShows.forEach(show => {
        const tId = show.theater;
        if (!grouped[tId]) {
          grouped[tId] = {
            id: tId,
            name: show.theater_name,
            location: show.theater_location,
            showtimes: []
          };
        }
        grouped[tId].showtimes.push(show);
      });
      
      setShowsByTheater(Object.values(grouped));
    } catch (err) {
      console.error("Error fetching shows:", err);
    } finally {
      setLoading(false);
    }
  };

  const getDayName = (date) => {
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    return days[date.getDay()];
  };

  const getMonthName = (date) => {
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return months[date.getMonth()];
  };

  const formatShowTime = (dtStr) => {
    const dt = new Date(dtStr);
    let hours = dt.getHours();
    const minutes = String(dt.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {/* Date Selection Bar */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        overflowX: 'auto',
        padding: '0.5rem 0',
        borderBottom: '1px solid var(--border-color)'
      }}>
        {dates.map((date, index) => {
          const isSelected = selectedDate && selectedDate.toDateString() === date.toDateString();
          return (
            <button
              key={index}
              onClick={() => setSelectedDate(date)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.8rem 1.2rem',
                borderRadius: '10px',
                border: isSelected ? '1px solid var(--accent-pink)' : '1px solid var(--border-color)',
                background: isSelected ? 'var(--accent-pink)' : 'var(--bg-surface)',
                color: isSelected ? 'white' : 'var(--text-primary)',
                minWidth: '70px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              <span style={{ fontSize: '0.75rem', fontWeight: 600, opacity: isSelected ? 0.9 : 0.6 }}>
                {getDayName(date)}
              </span>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0.2rem 0' }}>
                {date.getDate()}
              </span>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, opacity: isSelected ? 0.9 : 0.6 }}>
                {getMonthName(date)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Theaters & Showtimes Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
        {loading ? (
          <div className="skeleton" style={{ height: '150px', borderRadius: '12px' }} />
        ) : showsByTheater.length > 0 ? (
          showsByTheater.map((theater) => (
            <div
              key={theater.id}
              className="glass"
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.5rem',
                borderRadius: '12px',
                gap: '1.5rem',
                boxShadow: 'var(--shadow-main)'
              }}
            >
              {/* Theater Information */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: '1 1 300px' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{theater.name}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <MapPin size={14} />
                  <span>{theater.location}</span>
                </div>
              </div>

              {/* Showtimes List */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', flex: '2 2 400px' }}>
                {theater.showtimes.map((show) => (
                  <button
                    key={show.id}
                    onClick={() => navigate(`/seat-selection/${show.id}`)}
                    style={{
                      padding: '0.6rem 1.2rem',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-color)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.2rem',
                      transition: 'all 0.3s ease',
                      minWidth: '100px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--accent-pink)';
                      e.currentTarget.style.background = 'rgba(248, 68, 100, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    }}
                  >
                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-pink)' }}>
                      {formatShowTime(show.show_time)}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Rs. {Number(show.base_price).toFixed(0)} (Base)
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div style={{
            padding: '3rem',
            textAlign: 'center',
            background: 'var(--bg-surface)',
            borderRadius: '12px',
            color: 'var(--text-muted)'
          }}>
            <Calendar size={36} style={{ marginBottom: '0.8rem', opacity: 0.5 }} />
            <p>No shows scheduled in this city for the selected date.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShowTimeSelector;

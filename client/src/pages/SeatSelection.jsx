import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AlertCircle, Armchair, ChevronRight, Info } from 'lucide-react';
import api from '../services/api';

const SeatSelection = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const [seats, setSeats] = useState([]);
  const [show, setShow] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchShowAndSeats();
  }, [showId]);

  const fetchShowAndSeats = async () => {
    setLoading(true);
    setError('');
    try {
      const showResponse = await api.get(`movies/shows/${showId}/`);
      setShow(showResponse.data);

      const seatsResponse = await api.get(`bookings/shows/${showId}/seats/`);
      setSeats(seatsResponse.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch show information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSeatSelection = (seat) => {
    if (seat.status !== 'AVAILABLE') return;
    
    const isSelected = selectedSeats.some(s => s.id === seat.id);
    if (isSelected) {
      setSelectedSeats(selectedSeats.filter(s => s.id !== seat.id));
    } else {
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const handleProceed = async () => {
    if (selectedSeats.length === 0) return;
    
    const user = localStorage.getItem('user');
    if (!user) {
      navigate(`/login?redirect=/seat-selection/${showId}`);
      return;
    }

    setActionLoading(true);
    setError('');
    try {
      const seatIds = selectedSeats.map(s => s.id);
      const response = await api.post('bookings/lock/', {
        show_id: showId,
        seat_ids: seatIds
      });
      
      const booking = response.data;
      navigate(`/checkout/${booking.booking_id}`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to lock seats. Please refresh and try again.');
      fetchShowAndSeats();
      setSelectedSeats([]);
    } finally {
      setActionLoading(false);
    }
  };

  // Group seats by row (A, B, C, etc.)
  const rows = {};
  seats.forEach(seat => {
    const rowChar = seat.seat_number.charAt(0);
    if (!rows[rowChar]) {
      rows[rowChar] = [];
    }
    rows[rowChar].push(seat);
  });

  const totalTicketPrice = selectedSeats.reduce((acc, s) => acc + Number(s.price), 0);

  if (loading) {
    return (
      <div style={{ padding: '4rem', display: 'flex', justifyContent: 'center' }}>
        <div className="skeleton" style={{ height: '400px', width: '100%', maxWidth: '800px', borderRadius: '15px' }} />
      </div>
    );
  }

  if (error && !show) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#fca5a5' }}>
        <h2>Error Loading Theater</h2>
        <p style={{ margin: '1rem 0' }}>{error}</p>
        <Link to="/" style={{ color: 'var(--accent-pink)', fontWeight: 600 }}>Back to Home</Link>
      </div>
    );
  }

  return (
    <div style={{
      width: '100%',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '2.5rem'
    }}>
      
      {/* Left Block: Seating Grid */}
      <div style={{ flex: '2 2 700px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Header information */}
        <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>{show.movie_title}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            {show.theater_name} • Screen {show.screen_number} • {new Date(show.show_time).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#fca5a5',
            padding: '0.8rem 1rem',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
            fontSize: '0.9rem'
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Legend */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1.5rem',
          justifyContent: 'center',
          padding: '0.8rem',
          borderRadius: '8px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-color)',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <div style={{ width: '18px', height: '18px', borderRadius: '4px', background: 'var(--seat-available)', border: '1px solid rgba(255, 255, 255, 0.1)' }} />
            <span>Available</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <div style={{ width: '18px', height: '18px', borderRadius: '4px', background: 'var(--seat-selected)', border: '1px solid var(--accent-pink)' }} />
            <span>Selected</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <div style={{
              width: '18px',
              height: '18px',
              borderRadius: '4px',
              background: 'var(--seat-booked)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: '50%', left: '-20%', width: '140%', height: '1px', background: 'rgba(255, 255, 255, 0.3)', transform: 'rotate(45deg)' }} />
            </div>
            <span>Booked</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <div style={{ width: '18px', height: '18px', borderRadius: '4px', background: 'var(--seat-locked)', border: '1px solid var(--seat-locked)' }} />
            <span>Locked</span>
          </div>
        </div>

        {/* Seating Grid Map */}
        <div style={{
          overflowX: 'auto',
          padding: '1.5rem 0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.8rem'
        }}>
          {Object.keys(rows).sort().map((rowName) => (
            <div key={rowName} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              {/* Row Label */}
              <span style={{
                width: '24px',
                fontWeight: 700,
                color: 'var(--text-muted)',
                fontSize: '0.9rem',
                textAlign: 'center'
              }}>{rowName}</span>

              {/* Seats in Row */}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {rows[rowName].map((seat) => {
                  const isSelected = selectedSeats.some(s => s.id === seat.id);
                  const isAvailable = seat.status === 'AVAILABLE';
                  const isBooked = seat.status === 'BOOKED';
                  const isLocked = seat.status === 'LOCKED';

                  let bg = 'var(--seat-available)';
                  let border = '1px solid rgba(255,255,255,0.1)';
                  let cursor = 'pointer';

                  if (isSelected) {
                    bg = 'var(--seat-selected)';
                    border = '1px solid var(--accent-pink)';
                  } else if (isBooked) {
                    bg = 'var(--seat-booked)';
                    border = '1px solid rgba(255,255,255,0.05)';
                    cursor = 'not-allowed';
                  } else if (isLocked) {
                    bg = 'var(--seat-locked)';
                    border = '1px solid var(--seat-locked)';
                    cursor = 'not-allowed';
                  }

                  return (
                    <button
                      key={seat.id}
                      onClick={() => toggleSeatSelection(seat)}
                      disabled={!isAvailable}
                      title={`Seat ${seat.seat_number} - Rs. ${seat.price} (${seat.category})`}
                      style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '6px',
                        background: bg,
                        border: border,
                        color: isSelected ? 'white' : 'var(--text-secondary)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: cursor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (isAvailable && !isSelected) {
                          e.currentTarget.style.borderColor = 'var(--accent-pink)';
                          e.currentTarget.style.transform = 'scale(1.1)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (isAvailable && !isSelected) {
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                          e.currentTarget.style.transform = 'scale(1)';
                        }
                      }}
                    >
                      {/* Booking cross lines */}
                      {isBooked && (
                        <div style={{ position: 'absolute', top: '50%', left: '-20%', width: '140%', height: '1px', background: 'rgba(255,255,255,0.3)', transform: 'rotate(45deg)' }} />
                      )}
                      {!isBooked && seat.seat_number.substring(1)}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          
          {/* Screen curve display */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '2rem', gap: '0.5rem', width: '80%' }}>
            <div style={{
              width: '100%',
              height: '8px',
              borderRadius: '50%',
              borderTop: '4px solid var(--border-color)',
              filter: 'drop-shadow(0 -4px 10px rgba(248, 68, 100, 0.15))'
            }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '2px', fontWeight: 600 }}>All Eyes This Way (Screen)</span>
          </div>
        </div>
      </div>

      {/* Right Block: Selection Summary */}
      <div style={{ flex: '1 1 350px' }}>
        <div className="glass" style={{
          padding: '2rem',
          borderRadius: '16px',
          boxShadow: 'var(--shadow-main)',
          position: 'sticky',
          top: '90px',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Booking Summary</h3>
          
          {selectedSeats.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* Selected seats list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Selected Seats ({selectedSeats.length})</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {selectedSeats.map((seat) => (
                    <span key={seat.id} style={{
                      background: 'rgba(248, 68, 100, 0.1)',
                      border: '1px solid var(--accent-pink)',
                      color: 'var(--accent-pink)',
                      padding: '0.3rem 0.6rem',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      fontWeight: 700
                    }}>
                      {seat.seat_number}
                    </span>
                  ))}
                </div>
              </div>

              {/* Price Calculation details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Base Tickets Cost</span>
                  <span style={{ fontWeight: 600 }}>Rs. {totalTicketPrice.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    Convenience Fee <Info size={12} title="Fixed charge per transaction" />
                  </span>
                  <span style={{ fontWeight: 600 }}>Rs. 30.00</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Integrated GST (18%)</span>
                  <span style={{ fontWeight: 600 }}>Rs. {(totalTicketPrice * 0.18).toFixed(2)}</span>
                </div>
                
                <hr style={{ border: 'none', borderBottom: '1px dashed var(--border-color)' }} />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 800 }}>
                  <span>Grand Total</span>
                  <span style={{ color: 'var(--accent-pink)' }}>
                    Rs. {(totalTicketPrice + 30.00 + (totalTicketPrice * 0.18)).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Info Alert */}
              <div style={{
                background: 'rgba(234, 179, 8, 0.08)',
                border: '1px solid rgba(234, 179, 8, 0.2)',
                borderRadius: '8px',
                padding: '0.6rem 0.8rem',
                fontSize: '0.75rem',
                color: '#f59e0b',
                lineHeight: '1.4'
              }}>
                Seats will be reserved for 5 minutes during checkout. Ensure you finish checkout before reservation expires.
              </div>

              <button
                onClick={handleProceed}
                disabled={actionLoading}
                className="glow-btn"
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  marginTop: '0.5rem'
                }}
              >
                {actionLoading ? 'Reserving...' : 'Proceed to Pay'}
                <ChevronRight size={18} />
              </button>
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '2rem 1rem',
              color: 'var(--text-secondary)',
              fontSize: '0.9rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.6rem'
            }}>
              <Armchair size={32} style={{ opacity: 0.4 }} />
              <p>Please select one or more seats from the layout grid to calculate pricing.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default SeatSelection;

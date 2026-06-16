import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Phone, Mail, Ticket, Download, Calendar, ExternalLink } from 'lucide-react';
import api from '../services/api';
import { TableSkeleton } from '../components/LoadingSkeleton';

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

  useEffect(() => {
    // Get logged-in user info
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    fetchBookingHistory();
  }, []);

  const fetchBookingHistory = async () => {
    setLoading(true);
    try {
      const response = await api.get('bookings/my-bookings/');
      setBookings(response.data.results || response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch your bookings database.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ width: '100%', maxWidth: '1000px', margin: '2rem auto', padding: '0 2rem' }}>
        <TableSkeleton />
      </div>
    );
  }

  return (
    <div style={{
      width: '100%',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2.5rem 2rem',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '2.5rem'
    }}>
      
      {/* Left Column: User Profile Details */}
      {user && (
        <div style={{ flex: '1 1 300px' }}>
          <div className="glass" style={{
            padding: '2rem',
            borderRadius: '16px',
            boxShadow: 'var(--shadow-main)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.2rem',
            textAlign: 'center',
            position: 'sticky',
            top: '90px',
            border: '1px solid var(--border-color)'
          }}>
            {/* Avatar */}
            <div style={{
              width: '90px',
              height: '90px',
              borderRadius: '50%',
              background: 'linear-gradient(45deg, var(--accent-pink), #ec4899)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.2rem',
              fontWeight: 800,
              color: 'white',
              boxShadow: 'var(--shadow-glow)'
            }}>
              {user.username.charAt(0).toUpperCase()}
            </div>

            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>{user.username}</h3>
              <span style={{
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'var(--text-secondary)',
                fontSize: '0.75rem',
                padding: '0.2rem 0.6rem',
                borderRadius: '10px',
                fontWeight: 600,
                textTransform: 'uppercase',
                marginTop: '0.3rem',
                display: 'inline-block'
              }}>{user.role}</span>
            </div>

            <hr style={{ border: 'none', borderBottom: '1px solid var(--border-color)', width: '100%' }} />

            {/* Profile Info fields */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.9rem' }}>
                <Mail size={16} color="var(--accent-pink)" />
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Email Address</span>
                  <span style={{ fontWeight: 600 }}>{user.email || 'N/A'}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.9rem' }}>
                <Phone size={16} color="var(--accent-pink)" />
                <div>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Phone Number</span>
                  <span style={{ fontWeight: 600 }}>{user.phone_number || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Right Column: Booking History */}
      <div style={{ flex: '2 2 700px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Ticket size={24} color="var(--accent-pink)" /> Booking History
        </h2>

        {error && (
          <div style={{ color: '#fca5a5', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>
            {error}
          </div>
        )}

        {bookings.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {bookings.map((booking) => {
              const pdfUrl = booking.pdf_ticket && (booking.pdf_ticket.startsWith('http') 
                ? booking.pdf_ticket 
                : `${BACKEND_URL}${booking.pdf_ticket}`);
              
              const isConfirmed = booking.status === 'CONFIRMED';
              
              return (
                <div
                  key={booking.id}
                  className="glass"
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    gap: '1.5rem',
                    border: '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow-main)'
                  }}
                >
                  {/* Left Side Info */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: '1 1 300px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{
                        background: isConfirmed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        color: isConfirmed ? '#10b981' : '#f59e0b',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 700
                      }}>
                        {booking.status}
                      </span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        ID: {booking.booking_id.substring(0, 18).toUpperCase()}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {booking.show_details.movie_title}
                    </h4>
                    
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {booking.show_details.theater_name} • Screen {booking.show_details.screen_number}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                      <Calendar size={14} />
                      <span>{new Date(booking.show_details.show_time).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <div style={{ marginTop: '0.4rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Seats:</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.1rem' }}>
                        {booking.seats_details.map(s => (
                          <span key={s.id} style={{ background: 'var(--bg-surface-hover)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                            {s.seat_number}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Price + Actions */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                    flex: '1 1 150px',
                    textAlign: 'right',
                    gap: '1rem'
                  }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Paid Amount</span>
                      <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-pink)' }}>
                        Rs. {Number(booking.total_amount).toFixed(2)}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.8rem' }}>
                      {isConfirmed && pdfUrl && (
                        <a
                          href={pdfUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            padding: '0.5rem 0.8rem',
                            borderRadius: '6px',
                            border: '1px solid var(--accent-pink)',
                            color: 'var(--accent-pink)',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            cursor: 'pointer'
                          }}
                        >
                          <Download size={14} /> Ticket
                        </a>
                      )}
                      
                      {booking.status === 'PENDING' && (
                        <Link
                          to={`/checkout/${booking.booking_id}`}
                          className="glow-btn"
                          style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                          }}
                        >
                          Pay Now <ExternalLink size={14} />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{
            padding: '4rem 2rem',
            textAlign: 'center',
            background: 'var(--bg-surface)',
            borderRadius: '12px',
            color: 'var(--text-secondary)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.8rem'
          }}>
            <Ticket size={40} style={{ opacity: 0.3 }} />
            <p style={{ fontWeight: 600 }}>No bookings recorded yet.</p>
            <Link to="/" style={{ color: 'var(--accent-pink)', fontWeight: 700 }}>Book a Movie Now</Link>
          </div>
        )}
      </div>

    </div>
  );
};

export default UserDashboard;

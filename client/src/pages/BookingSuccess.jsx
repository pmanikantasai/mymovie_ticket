import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Download, Home, Calendar, MapPin, Receipt, CreditCard, Wallet } from 'lucide-react';
import api from '../services/api';

const BookingSuccess = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

  useEffect(() => {
    fetchBookingSuccessDetails();
  }, [bookingId]);

  const fetchBookingSuccessDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('bookings/my-bookings/');
      const bookingsList = response.data.results || response.data;
      const currentBooking = bookingsList.find(b => b.booking_id === bookingId);
      
      if (currentBooking) {
        setBooking(currentBooking);
      } else {
        setError('Booking record not found.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch ticket details. Check if connection is active.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '4rem', display: 'flex', justifyContent: 'center' }}>
        <div className="skeleton" style={{ height: '350px', width: '100%', maxWidth: '600px', borderRadius: '15px' }} />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#fca5a5' }}>
        <h2>Ticket Retrieval Error</h2>
        <p style={{ margin: '1rem 0' }}>{error || 'Booking detail missing.'}</p>
        <Link to="/" style={{ color: 'var(--accent-pink)', fontWeight: 600 }}>Back to Home</Link>
      </div>
    );
  }

  const qrCodeUrl = booking.qr_code && (booking.qr_code.startsWith('http') 
    ? booking.qr_code 
    : `${BACKEND_URL}${booking.qr_code}`);

  const pdfUrl = booking.pdf_ticket && (booking.pdf_ticket.startsWith('http') 
    ? booking.pdf_ticket 
    : `${BACKEND_URL}${booking.pdf_ticket}`);

  const basePrice = Number(booking.total_amount) - Number(booking.convenience_fee) - Number(booking.tax);

  return (
    <div style={{
      minHeight: 'calc(100vh - 70px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 2rem',
      background: 'radial-gradient(circle at center, #1b2336 0%, var(--bg-primary) 70%)'
    }}>
      <div className="glass" style={{
        width: '100%',
        maxWidth: '550px',
        borderRadius: '20px',
        boxShadow: 'var(--shadow-main)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        border: '1px solid var(--border-color)'
      }}>
        {/* Success Header Banner */}
        <div style={{
          background: 'rgba(16, 185, 129, 0.08)',
          borderBottom: '1px solid rgba(16, 185, 129, 0.2)',
          width: '100%',
          padding: '2rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.8rem',
          textAlign: 'center'
        }}>
          <CheckCircle2 size={56} color="#10b981" />
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981' }}>Booking Confirmed!</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Your transaction was successful. Show the QR code at the entrance of the screen.
          </p>
        </div>

        {/* Ticket Details Panel */}
        <div style={{
          width: '100%',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          borderBottom: '1px dashed var(--border-color)'
        }}>
          {/* Movie Title */}
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Movie</span>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{booking.show_details.movie_title}</h3>
          </div>

          {/* Show details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.4rem', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Theater & Screen</span>
              <p style={{ fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <MapPin size={14} color="var(--accent-pink)" />
                {booking.show_details.theater_name}
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', paddingLeft: '1.1rem' }}>Screen {booking.show_details.screen_number}</p>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Date & Show Time</span>
              <p style={{ fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Calendar size={14} color="var(--accent-pink)" />
                {new Date(booking.show_details.show_time).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', paddingLeft: '1.1rem' }}>
                {new Date(booking.show_details.show_time).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          {/* Seats details */}
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Seat Numbers ({booking.seats_details.length})</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.2rem' }}>
              {booking.seats_details.map(s => (
                <span key={s.id} style={{ background: 'var(--bg-surface-hover)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 700 }}>
                  {s.seat_number}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Receipt & Bill Breakdown */}
        <div style={{
          width: '100%',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.2rem',
          borderBottom: '1px dashed var(--border-color)',
          background: 'rgba(255, 255, 255, 0.01)'
        }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Receipt size={16} color="var(--accent-pink)" /> Booking Summary & Receipt
          </h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <span>Base Ticket Price</span>
              <span>Rs. {basePrice.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <span>Convenience Fee</span>
              <span>Rs. {Number(booking.convenience_fee).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <span>Integrated Taxes & GST (18%)</span>
              <span>Rs. {Number(booking.tax).toFixed(2)}</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '1.1rem',
              fontWeight: 800,
              borderTop: '1px solid var(--border-color)',
              paddingTop: '0.6rem',
              marginTop: '0.3rem'
            }}>
              <span>Total Amount Paid</span>
              <span style={{ color: 'var(--accent-pink)' }}>Rs. {Number(booking.total_amount).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Transaction/Payment Details Section */}
        <div style={{
          width: '100%',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.2rem',
          borderBottom: '1px dashed var(--border-color)',
          background: 'rgba(255, 255, 255, 0.02)'
        }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <CreditCard size={16} color="var(--accent-pink)" /> Transaction Details
          </h4>
          
          {booking.payment_details && booking.payment_details.length > 0 ? (
            booking.payment_details.map((payment, index) => {
              if (payment.status !== 'SUCCESS') return null;
              return (
                <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Transaction ID</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{payment.payment_id}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Payment Method</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      {payment.payment_method === 'Card' ? (
                        <>
                          <CreditCard size={14} color="var(--text-secondary)" /> Card Payment
                        </>
                      ) : (
                        <>
                          <Wallet size={14} color="var(--text-secondary)" /> UPI Payment
                        </>
                      )}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Payment Date</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {new Date(payment.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Status</span>
                    <span style={{ fontWeight: 700, color: '#10b981' }}>{payment.status}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Transaction ID</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>TXN-{booking.booking_id.substring(0, 8).toUpperCase()}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Payment Method</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Online Payment</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Payment Date</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {new Date(booking.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Status</span>
                <span style={{ fontWeight: 700, color: '#10b981' }}>{booking.status}</span>
              </div>
            </div>
          )}
        </div>

        {/* QR Code and download block */}
        <div style={{
          width: '100%',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
          background: 'rgba(255, 255, 255, 0.01)'
        }}>
          {qrCodeUrl ? (
            <div style={{
              background: 'white',
              padding: '0.8rem',
              borderRadius: '12px',
              boxShadow: 'var(--shadow-main)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '140px',
              height: '140px'
            }}>
              <img src={qrCodeUrl} alt="Ticket QR Code" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
          ) : (
            <div className="skeleton" style={{ width: '140px', height: '140px', borderRadius: '12px' }} />
          )}

          <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
            {pdfUrl ? (
              <a
                href={pdfUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  flex: 1,
                  padding: '0.8rem',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  border: '1px solid var(--accent-pink)',
                  color: 'var(--accent-pink)',
                  background: 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(248, 68, 100, 0.05)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <Download size={16} /> Download PDF
              </a>
            ) : null}

            <Link
              to="/"
              className="glow-btn"
              style={{
                flex: 1,
                padding: '0.8rem',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                textAlign: 'center'
              }}
            >
              <Home size={16} /> Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;

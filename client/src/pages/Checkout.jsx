import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AlertCircle, CreditCard, ShieldCheck, Ticket, Landmark, QrCode } from 'lucide-react';
import api from '../services/api';

const Checkout = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('Card');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [cardData, setCardData] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [upiData, setUpiData] = useState({ vpa: '' });

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch bookings from history or specific endpoint
      const response = await api.get('bookings/my-bookings/');
      const bookingsList = response.data.results || response.data;
      const currentBooking = bookingsList.find(b => b.booking_id === bookingId);
      
      if (currentBooking) {
        setBooking(currentBooking);
      } else {
        setError('Booking session not found. It may have expired.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch checkout details. Check your network.');
    } finally {
      setLoading(false);
    }
  };

  const handleCardChange = (e) => {
    setCardData({ ...cardData, [e.target.name]: e.target.value });
  };

  const handlePay = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    
    try {
      const response = await api.post('payments/process/', {
        booking_id: bookingId,
        payment_method: paymentMethod
      });
      // Redirect to success screen
      navigate(`/booking-success/${bookingId}`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Payment failed. Your seat reservation session may have expired.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '4rem', display: 'flex', justifyContent: 'center' }}>
        <div className="skeleton" style={{ height: '300px', width: '100%', maxWidth: '600px', borderRadius: '15px' }} />
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#fca5a5' }}>
        <h2>Checkout Error</h2>
        <p style={{ margin: '1rem 0' }}>{error}</p>
        <Link to="/" style={{ color: 'var(--accent-pink)', fontWeight: 600 }}>Back to Home</Link>
      </div>
    );
  }

  const basePrice = Number(booking.total_amount) - Number(booking.convenience_fee) - Number(booking.tax);

  return (
    <div style={{
      width: '100%',
      maxWidth: '1000px',
      margin: '0 auto',
      padding: '2rem',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '2.5rem'
    }}>
      
      {/* Left Column: Billing Summary */}
      <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Confirm Booking Details</h2>
        
        {/* Ticket Box */}
        <div className="glass" style={{
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-main)',
          border: '1px solid var(--border-color)'
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(45deg, #1b2336, var(--bg-surface-hover))',
            padding: '1.2rem',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem'
          }}>
            <Ticket size={22} color="var(--accent-pink)" />
            <span style={{ fontWeight: 700, letterSpacing: '0.5px' }}>Booking ID: {bookingId.substring(0, 8).toUpperCase()}...</span>
          </div>

          {/* Details body */}
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Movie</span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-pink)' }}>{booking.show_details.movie_title}</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.8rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Theater & Screen</span>
                <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>{booking.show_details.theater_name}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Screen {booking.show_details.screen_number}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Show Date & Time</span>
                <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                  {new Date(booking.show_details.show_time).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.8rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Reserved Seats ({booking.seats_details.length})</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.2rem' }}>
                {booking.seats_details.map(s => (
                  <span key={s.id} style={{ background: 'var(--bg-surface-hover)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 700 }}>
                    {s.seat_number}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Total Breakdown */}
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1.5rem', borderTop: '1px dashed var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <span>Base Ticket cost</span>
              <span>Rs. {basePrice.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <span>Convenience Fee</span>
              <span>Rs. {Number(booking.convenience_fee).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <span>Taxes & GST (18%)</span>
              <span>Rs. {Number(booking.tax).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 800, borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem', marginTop: '0.3rem' }}>
              <span>Total Amount Paid</span>
              <span style={{ color: 'var(--accent-pink)' }}>Rs. {Number(booking.total_amount).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Checkout Portal */}
      <div style={{ flex: '1 1 450px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Complete Your Payment</h2>
        
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

        <div className="glass" style={{
          padding: '2rem',
          borderRadius: '16px',
          boxShadow: 'var(--shadow-main)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          border: '1px solid var(--border-color)'
        }}>
          {/* Method tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', gap: '1rem' }}>
            <button
              onClick={() => setPaymentMethod('Card')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.4rem 0.8rem',
                border: 'none',
                background: 'transparent',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                color: paymentMethod === 'Card' ? 'var(--accent-pink)' : 'var(--text-secondary)',
                borderBottom: paymentMethod === 'Card' ? '2px solid var(--accent-pink)' : 'none'
              }}
            >
              <CreditCard size={16} /> Credit / Debit Card
            </button>
            <button
              onClick={() => setPaymentMethod('UPI')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.4rem 0.8rem',
                border: 'none',
                background: 'transparent',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                color: paymentMethod === 'UPI' ? 'var(--accent-pink)' : 'var(--text-secondary)',
                borderBottom: paymentMethod === 'UPI' ? '2px solid var(--accent-pink)' : 'none'
              }}
            >
              <QrCode size={16} /> UPI (Scan/Pay)
            </button>
          </div>

          {/* Payment method forms */}
          <form onSubmit={handlePay} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {paymentMethod === 'Card' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Cardholder Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="John Doe"
                    value={cardData.name}
                    onChange={handleCardChange}
                    style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'rgba(255, 255, 255, 0.03)', outline: 'none' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Card Number</label>
                  <input
                    type="text"
                    name="number"
                    required
                    maxLength="16"
                    placeholder="4111 2222 3333 4444"
                    value={cardData.number}
                    onChange={handleCardChange}
                    style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'rgba(255, 255, 255, 0.03)', outline: 'none' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Expiry Date</label>
                    <input
                      type="text"
                      name="expiry"
                      required
                      placeholder="MM/YY"
                      maxLength="5"
                      value={cardData.expiry}
                      onChange={handleCardChange}
                      style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'rgba(255, 255, 255, 0.03)', outline: 'none' }}
                    />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>CVV</label>
                    <input
                      type="password"
                      name="cvv"
                      required
                      maxLength="3"
                      placeholder="***"
                      value={cardData.cvv}
                      onChange={handleCardChange}
                      style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'rgba(255, 255, 255, 0.03)', outline: 'none' }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', textAlign: 'center', padding: '1rem 0' }}>
                <QrCode size={120} style={{ color: 'var(--text-primary)', opacity: 0.8, padding: '0.5rem', background: 'white', borderRadius: '12px' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', width: '100%' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Enter UPI Virtual Address (VPA)</label>
                  <input
                    type="text"
                    required={paymentMethod === 'UPI'}
                    placeholder="username@upi"
                    value={upiData.vpa}
                    onChange={(e) => setUpiData({ vpa: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'rgba(255, 255, 255, 0.03)', outline: 'none', textAlign: 'center' }}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="glow-btn"
              style={{
                width: '100%',
                padding: '0.8rem',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 700,
                marginTop: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem'
              }}
            >
              <ShieldCheck size={18} />
              {submitting ? 'Verifying Transaction...' : `Pay Rs. ${Number(booking.total_amount).toFixed(2)}`}
            </button>
          </form>
        </div>
      </div>

    </div>
  );
};

export default Checkout;

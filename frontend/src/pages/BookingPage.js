import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import styles from './BookingPage.module.css';

const EVENT_TYPES = ['wedding','conference','birthday','corporate','sports','exhibition','concert','social','other'];

export default function BookingPage() {
  const { venueId } = useParams();
  const navigate = useNavigate();
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ eventType:'', eventTitle:'', guestCount:'', date:'', startTime:'09:00', endTime:'17:00', specialRequests:'' });
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalHours, setTotalHours] = useState(0);

  useEffect(() => {
    api.get(`/venues/${venueId}`).then(r => setVenue(r.data.venue)).finally(() => setLoading(false));
  }, [venueId]);

  useEffect(() => {
    if (!venue || !form.startTime || !form.endTime) return;
    const [sh, sm] = form.startTime.split(':').map(Number);
    const [eh, em] = form.endTime.split(':').map(Number);
    const hours = ((eh * 60 + em) - (sh * 60 + sm)) / 60;
    if (hours > 0) { setTotalHours(hours); setTotalPrice(hours * venue.pricePerHour); }
    else { setTotalHours(0); setTotalPrice(0); }
  }, [form.startTime, form.endTime, venue]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (totalHours <= 0) return toast.error('End time must be after start time');
    if (form.guestCount > venue?.capacity) return toast.error(`Max capacity is ${venue.capacity}`);
    setSubmitting(true);
    try {
      const res = await api.post('/bookings', { venueId, ...form, guestCount: parseInt(form.guestCount) });
      if (res.data.waitlisted) {
        toast.info(`You're #${res.data.position} on the waitlist — we'll notify you when a slot opens!`);
      } else {
        toast.success('Booking confirmed! 🎉');
      }
      navigate('/my-bookings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  if (loading) return <div className={styles.loading}><div style={{ width:40,height:40,border:'3px solid #eef0f5',borderTopColor:'#e94560',borderRadius:'50%',animation:'spin 0.8s linear infinite' }} /></div>;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className="container">
          <button onClick={() => navigate(-1)} className={styles.back}>← Back</button>
          <h1>Book: {venue?.name}</h1>
        </div>
      </div>

      <div className="container">
        <div className={styles.layout}>
          <form className={styles.formCard} onSubmit={handleSubmit}>
            <h2 className={styles.formTitle}>Event Details</h2>

            <div className={styles.formGrid}>
              <div className={styles.fieldGroup}>
                <label>Event Title *</label>
                <input required placeholder="e.g. Annual Conference 2026" value={form.eventTitle} onChange={e => set('eventTitle', e.target.value)} />
              </div>
              <div className={styles.fieldGroup}>
                <label>Event Type *</label>
                <select required value={form.eventType} onChange={e => set('eventType', e.target.value)}>
                  <option value="">Select type…</option>
                  {EVENT_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
                </select>
              </div>
              <div className={styles.fieldGroup}>
                <label>Date *</label>
                <input type="date" required min={today} value={form.date} onChange={e => set('date', e.target.value)} />
              </div>
              <div className={styles.fieldGroup}>
                <label>Number of Guests *</label>
                <input type="number" required min={1} max={venue?.capacity} placeholder={`Max: ${venue?.capacity}`} value={form.guestCount} onChange={e => set('guestCount', e.target.value)} />
              </div>
              <div className={styles.fieldGroup}>
                <label>Start Time *</label>
                <input type="time" required value={form.startTime} onChange={e => set('startTime', e.target.value)} />
              </div>
              <div className={styles.fieldGroup}>
                <label>End Time *</label>
                <input type="time" required value={form.endTime} onChange={e => set('endTime', e.target.value)} />
              </div>
            </div>

            <div className={styles.fieldGroupFull}>
              <label>Special Requests</label>
              <textarea rows={3} placeholder="Any special requirements, accessibility needs, etc." value={form.specialRequests} onChange={e => set('specialRequests', e.target.value)} />
            </div>

            {totalHours > 0 && (
              <div className={styles.priceSummary}>
                <div className={styles.priceRow}><span>£{venue?.pricePerHour}/hr × {totalHours}h</span><span>£{totalPrice.toFixed(2)}</span></div>
                <div className={styles.priceTotal}><strong>Total</strong><strong>£{totalPrice.toFixed(2)}</strong></div>
              </div>
            )}

            <div className={styles.waitlistNote}>
              <span>📋</span>
              <p>If this time slot is already booked, you'll automatically be placed on the waitlist and notified when it becomes available.</p>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={submitting}>
              {submitting ? 'Processing…' : `Confirm Booking — £${totalPrice.toFixed(2)}`}
            </button>
          </form>

          {/* Venue summary */}
          <aside className={styles.venueSummary}>
            {venue?.images?.[0] && <img src={venue.images[0]} alt={venue.name} className={styles.venueImg} />}
            <div className={styles.venueInfo}>
              <h3>{venue?.name}</h3>
              <p>📍 {venue?.location.address}, {venue?.location.city}</p>
              <div className={styles.venueDetails}>
                <div><strong>Capacity</strong><span>👥 {venue?.capacity}</span></div>
                <div><strong>Rate</strong><span>£{venue?.pricePerHour}/hr</span></div>
                <div><strong>Category</strong><span style={{ textTransform:'capitalize' }}>{venue?.category}</span></div>
                <div><strong>Policy</strong><span style={{ textTransform:'capitalize' }}>{venue?.cancellationPolicy}</span></div>
              </div>
              {venue?.amenities?.length > 0 && (
                <div className={styles.amenities}>
                  {venue.amenities.slice(0,4).map(a => <span key={a}>{a}</span>)}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

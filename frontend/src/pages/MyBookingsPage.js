import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import styles from './MyBookingsPage.module.css';

const STATUS_COLORS = { confirmed:'#00c896', pending:'#f5a623', cancelled:'#e94560', completed:'#4facfe', waitlisted:'#7c5cbf' };
const STATUS_ICONS = { confirmed:'✅', pending:'⏳', cancelled:'✗', completed:'🎉', waitlisted:'📋' };

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    const params = filter ? `?status=${filter}` : '';
    api.get(`/bookings/my${params}`).then(r => setBookings(r.data.bookings || [])).finally(() => setLoading(false));
  }, [filter]);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    setCancellingId(id);
    try {
      await api.put(`/bookings/${id}/cancel`);
      setBookings(bs => bs.map(b => b._id === id ? { ...b, status: 'cancelled' } : b));
      toast.success('Booking cancelled');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not cancel');
    } finally { setCancellingId(null); }
  };

  const STATUSES = ['', 'confirmed', 'pending', 'waitlisted', 'completed', 'cancelled'];

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className="container">
          <h1>My Bookings</h1>
          <p>{bookings.length} booking{bookings.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="container">
        <div className={styles.content}>
          <div className={styles.filterTabs}>
            {STATUSES.map(s => (
              <button key={s} className={`${styles.tab} ${filter === s ? styles.tabActive : ''}`} onClick={() => setFilter(s)}>
                {s ? (STATUS_ICONS[s] + ' ' + s.charAt(0).toUpperCase() + s.slice(1)) : 'All'}
              </button>
            ))}
          </div>

          {loading ? (
            <div className={styles.list}>
              {[1,2,3].map(i => <div key={i} className={`skeleton ${styles.skeletonCard}`} />)}
            </div>
          ) : bookings.length === 0 ? (
            <div className={styles.empty}>
              <span>📅</span>
              <h3>No bookings found</h3>
              <p>You haven't made any bookings yet.</p>
              <Link to="/venues" className={styles.browseBtn}>Browse Venues</Link>
            </div>
          ) : (
            <div className={styles.list}>
              {bookings.map(b => (
                <div key={b._id} className={styles.bookingCard}>
                  <div className={styles.venueImg}>
                    {b.venue?.images?.[0] ? <img src={b.venue.images[0]} alt={b.venue.name} /> : <span>🏛</span>}
                  </div>
                  <div className={styles.bookingInfo}>
                    <div className={styles.bookingHeader}>
                      <div>
                        <h3>{b.eventTitle}</h3>
                        <p className={styles.venueName}>{b.venue?.name}</p>
                      </div>
                      <div className={styles.statusBadge} style={{ background: `${STATUS_COLORS[b.status]}18`, color: STATUS_COLORS[b.status], borderColor: `${STATUS_COLORS[b.status]}40` }}>
                        {STATUS_ICONS[b.status]} {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                        {b.status === 'waitlisted' && b.waitlistPosition && ` (#${b.waitlistPosition})`}
                      </div>
                    </div>
                    <div className={styles.bookingMeta}>
                      <span>📅 {new Date(b.date).toLocaleDateString('en-GB', { weekday:'short', day:'numeric', month:'short', year:'numeric' })}</span>
                      <span>🕐 {b.startTime} – {b.endTime}</span>
                      <span>👥 {b.guestCount} guests</span>
                      <span>📍 {b.venue?.location?.city}</span>
                    </div>
                    <div className={styles.bookingFooter}>
                      <span className={styles.price}>£{b.totalPrice?.toFixed(2)}</span>
                      <div className={styles.actions}>
                        <Link to={`/venues/${b.venue?._id}`} className={styles.viewBtn}>View Venue</Link>
                        {['confirmed','pending','waitlisted'].includes(b.status) && (
                          <button className={styles.cancelBtn} onClick={() => handleCancel(b._id)} disabled={cancellingId === b._id}>
                            {cancellingId === b._id ? '…' : 'Cancel'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

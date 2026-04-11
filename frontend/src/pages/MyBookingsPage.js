import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import styles from './MyBookingsPage.module.css';

const STATUS_COLORS  = { confirmed:'#00c896', pending:'#f5a623', cancelled:'#e94560', rejected:'#e94560', completed:'#4facfe', waitlisted:'#7c5cbf' };
const STATUS_ICONS   = { confirmed:'✅', pending:'⏳', cancelled:'✗', rejected:'✗', completed:'🎉', waitlisted:'📋' };
const STATUS_LABELS  = { confirmed:'Confirmed', pending:'Awaiting Confirmation', cancelled:'Cancelled', rejected:'Rejected', completed:'Completed', waitlisted:'Waitlisted' };
const STATUSES       = ['', 'pending', 'confirmed', 'waitlisted', 'completed', 'cancelled', 'rejected'];

// ─── Shared booking card ──────────────────────────────────────────────────────
function BookingCard({ b, isOwnerView, onCancel, onConfirm, onReject, actionId }) {
  const color = STATUS_COLORS[b.status] || '#8892b0';
  return (
    <div className={styles.bookingCard}>
      <div className={styles.venueImg}>
        {b.venue?.images?.[0] ? <img src={b.venue.images[0]} alt={b.venue.name} /> : <span>🏛</span>}
      </div>
      <div className={styles.bookingInfo}>
        <div className={styles.bookingHeader}>
          <div>
            <h3>{b.eventTitle}</h3>
            <p className={styles.venueName}>
              {b.venue?.name}
              {isOwnerView && b.user && (
                <span className={styles.guestName}> · {b.user.firstName} {b.user.lastName} ({b.user.email})</span>
              )}
            </p>
          </div>
          <div className={styles.statusBadge} style={{ background:`${color}18`, color, borderColor:`${color}40` }}>
            {STATUS_ICONS[b.status]} {STATUS_LABELS[b.status] || b.status}
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

            {/* Guest view: can cancel their own active bookings */}
            {!isOwnerView && ['confirmed','pending','waitlisted'].includes(b.status) && (
              <button className={styles.cancelBtn} onClick={() => onCancel(b._id)} disabled={actionId === b._id}>
                {actionId === b._id ? '…' : 'Cancel'}
              </button>
            )}

            {/* Owner view: confirm / reject pending bookings */}
            {isOwnerView && b.status === 'pending' && (
              <>
                <button className={styles.confirmBtn} onClick={() => onConfirm(b._id)} disabled={actionId === b._id}>
                  {actionId === b._id ? '…' : 'Confirm'}
                </button>
                <button className={styles.rejectBtn} onClick={() => onReject(b._id)} disabled={actionId === b._id}>
                  Reject
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function MyBookingsPage() {
  const { user } = useAuth();
  const isOwner = user?.role === 'venue_owner' || user?.role === 'admin';

  const [bookings, setBookings]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState('');
  const [actionId, setActionId]   = useState(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params = filter ? `?status=${filter}` : '';
      const endpoint = isOwner ? `/bookings/owner${params}` : `/bookings/my${params}`;
      const r = await api.get(endpoint);
      setBookings(r.data.bookings || []);
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [filter, isOwner]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    setActionId(id);
    try {
      await api.put(`/bookings/${id}/cancel`);
      setBookings(bs => bs.map(b => b._id === id ? { ...b, status: 'cancelled' } : b));
      toast.success('Booking cancelled');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not cancel');
    } finally { setActionId(null); }
  };

  const handleConfirm = async (id) => {
    setActionId(id);
    try {
      await api.put(`/bookings/${id}/confirm`);
      setBookings(bs => bs.map(b => b._id === id ? { ...b, status: 'confirmed' } : b));
      toast.success('Booking confirmed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not confirm');
    } finally { setActionId(null); }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Reject this booking?')) return;
    setActionId(id);
    try {
      await api.put(`/bookings/${id}/reject`);
      setBookings(bs => bs.map(b => b._id === id ? { ...b, status: 'rejected' } : b));
      toast.success('Booking rejected');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not reject');
    } finally { setActionId(null); }
  };

  const pendingCount = bookings.filter(b => b.status === 'pending').length;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className="container">
          <h1>{isOwner ? 'Venue Bookings' : 'My Bookings'}</h1>
          <p>
            {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
            {isOwner && pendingCount > 0 && <span className={styles.pendingBadge}>{pendingCount} awaiting confirmation</span>}
          </p>
        </div>
      </div>

      <div className="container">
        <div className={styles.content}>
          <div className={styles.filterTabs}>
            {STATUSES.map(s => (
              <button key={s} className={`${styles.tab} ${filter === s ? styles.tabActive : ''}`} onClick={() => setFilter(s)}>
                {s ? (STATUS_ICONS[s] + ' ' + (STATUS_LABELS[s] || s)) : 'All'}
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
              <p>{isOwner ? 'No bookings have been made for your venues yet.' : "You haven't made any bookings yet."}</p>
              {!isOwner && <Link to="/venues" className={styles.browseBtn}>Browse Venues</Link>}
            </div>
          ) : (
            <div className={styles.list}>
              {bookings.map(b => (
                <BookingCard
                  key={b._id}
                  b={b}
                  isOwnerView={isOwner}
                  onCancel={handleCancel}
                  onConfirm={handleConfirm}
                  onReject={handleReject}
                  actionId={actionId}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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

// 30-minute slots from 8:00 AM to 9:00 PM, stored in 24h (HH:MM) for the backend
const TIME_SLOTS = (() => {
  const slots = [];
  for (let h = 8; h <= 21; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`);
    if (h < 21) slots.push(`${String(h).padStart(2, '0')}:30`);
  }
  return slots;
})();

// Display a 24h "HH:MM" string as "h:MM AM/PM"
const to12h = (time24) => {
  const [h, m] = time24.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12  = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
};

const EDIT_BADGE = {
  pending:  { label: 'Edit Pending',   color: '#f5a623' },
  approved: { label: 'Edit Approved',  color: '#00c896' },
  rejected: { label: 'Edit Rejected',  color: '#e94560' },
};

// ─── Edit modal ───────────────────────────────────────────────────────────────
function EditModal({ booking, onClose, onSubmitted }) {
  const [form, setForm] = useState({
    date:            booking.date ? new Date(booking.date).toISOString().split('T')[0] : '',
    startTime:       booking.startTime || '09:00',
    endTime:         booking.endTime   || '17:00',
    guestCount:      booking.guestCount?.toString() || '',
    specialRequests: booking.specialRequests || '',
  });
  const [submitting, setSubmitting] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.put(`/bookings/${booking._id}/edit-request`, {
        date:            form.date,
        startTime:       form.startTime,
        endTime:         form.endTime,
        guestCount:      parseInt(form.guestCount),
        specialRequests: form.specialRequests,
      });
      toast.success('Edit request sent — awaiting owner approval');
      onSubmitted(res.data.booking);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit edit request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Edit Booking</h2>
          <button className={styles.modalClose} onClick={onClose}>✕</button>
        </div>
        <p className={styles.modalSub}>
          Propose new details for <strong>{booking.eventTitle}</strong> at <strong>{booking.venue?.name}</strong>.
          The venue owner will review and approve or reject your request.
        </p>
        <form onSubmit={handleSubmit}>
          <div className={styles.modalGrid}>
            <div className={styles.formGroup}>
              <label>Date</label>
              <input type="date" min={today} value={form.date} onChange={e => set('date', e.target.value)} required />
            </div>
            <div className={styles.formGroup}>
              <label>Guest Count</label>
              <input type="number" min={1} value={form.guestCount} onChange={e => set('guestCount', e.target.value)} required />
            </div>
            <div className={styles.formGroup}>
              <label>Start Time</label>
              <select value={form.startTime} onChange={e => set('startTime', e.target.value)}>
                {TIME_SLOTS.map(t => <option key={t} value={t}>{to12h(t)}</option>)}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>End Time</label>
              <select value={form.endTime} onChange={e => set('endTime', e.target.value)}>
                {TIME_SLOTS.map(t => <option key={t} value={t}>{to12h(t)}</option>)}
              </select>
            </div>
            <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
              <label>Special Requests</label>
              <textarea rows={3} value={form.specialRequests} onChange={e => set('specialRequests', e.target.value)} placeholder="Any special requests…" />
            </div>
          </div>
          <div className={styles.modalFooter}>
            <button type="button" className={styles.modalCancelBtn} onClick={onClose}>Cancel</button>
            <button type="submit" className={styles.modalSubmitBtn} disabled={submitting}>
              {submitting ? 'Submitting…' : 'Send Edit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Booking card ─────────────────────────────────────────────────────────────
function BookingCard({ b, isOwnerView, onCancel, onConfirm, onReject, onEdit, actionId }) {
  const color = STATUS_COLORS[b.status] || '#8892b0';
  const er    = b.editRequest;
  const canEdit = !isOwnerView && ['confirmed', 'pending'].includes(b.status) && er?.status !== 'pending';

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
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
            <div className={styles.statusBadge} style={{ background:`${color}18`, color, borderColor:`${color}40` }}>
              {STATUS_ICONS[b.status]} {STATUS_LABELS[b.status] || b.status}
              {b.status === 'waitlisted' && b.waitlistPosition && ` (#${b.waitlistPosition})`}
            </div>
            {er && EDIT_BADGE[er.status] && (
              <div
                className={styles.editBadge}
                style={{ background:`${EDIT_BADGE[er.status].color}18`, color: EDIT_BADGE[er.status].color, borderColor:`${EDIT_BADGE[er.status].color}40` }}
                title={er.ownerNote ? `Owner note: ${er.ownerNote}` : undefined}
              >
                ✏️ {EDIT_BADGE[er.status].label}
              </div>
            )}
          </div>
        </div>

        <div className={styles.bookingMeta}>
          <span>📅 {new Date(b.date).toLocaleDateString('en-GB', { weekday:'short', day:'numeric', month:'short', year:'numeric' })}</span>
          <span>🕐 {b.startTime} – {b.endTime}</span>
          <span>👥 {b.guestCount} guests</span>
          <span>📍 {b.venue?.location?.city}</span>
        </div>

        {/* Show pending edit details to user */}
        {!isOwnerView && er?.status === 'pending' && (
          <div className={styles.editPendingInfo}>
            <span>Requested: 📅 {new Date(er.date).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}</span>
            <span>🕐 {er.startTime} – {er.endTime}</span>
            <span>👥 {er.guestCount} guests</span>
            <span>£{er.totalPrice?.toFixed(2)}</span>
          </div>
        )}

        {/* Show owner note if edit was reviewed */}
        {!isOwnerView && er?.ownerNote && ['approved','rejected'].includes(er.status) && (
          <div className={styles.ownerNote}>Owner note: {er.ownerNote}</div>
        )}

        <div className={styles.bookingFooter}>
          <span className={styles.price}>£{b.totalPrice?.toFixed(2)}</span>
          <div className={styles.actions}>
            <Link to={`/venues/${b.venue?._id}`} className={styles.viewBtn}>View Venue</Link>

            {canEdit && (
              <button className={styles.editBtn} onClick={() => onEdit(b)} disabled={actionId === b._id}>
                Edit
              </button>
            )}

            {!isOwnerView && ['confirmed','pending','waitlisted'].includes(b.status) && (
              <button className={styles.cancelBtn} onClick={() => onCancel(b._id)} disabled={actionId === b._id}>
                {actionId === b._id ? '…' : 'Cancel'}
              </button>
            )}

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

  const [bookings, setBookings]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState('');
  const [actionId, setActionId]     = useState(null);
  const [editTarget, setEditTarget] = useState(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params   = filter ? `?status=${filter}` : '';
      const endpoint = isOwner ? `/bookings/owner${params}` : `/bookings/my${params}`;
      const r        = await api.get(endpoint);
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

  const handleEditSubmitted = (updatedBooking) => {
    setBookings(bs => bs.map(b => b._id === updatedBooking._id ? updatedBooking : b));
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
                  onEdit={setEditTarget}
                  actionId={actionId}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {editTarget && (
        <EditModal
          booking={editTarget}
          onClose={() => setEditTarget(null)}
          onSubmitted={handleEditSubmitted}
        />
      )}
    </div>
  );
}

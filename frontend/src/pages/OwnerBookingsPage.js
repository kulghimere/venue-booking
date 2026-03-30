import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import styles from './OwnerBookingsPage.module.css';

const STATUS_COLORS = {
  confirmed:  '#00c896',
  cancelled:  '#e94560',
  rejected:   '#e94560',
  waitlisted: '#f5a623',
  pending:    '#f5a623',
  completed:  '#4facfe',
};

const ALL_STATUSES = ['pending', 'confirmed', 'waitlisted', 'cancelled', 'rejected', 'completed'];

export default function OwnerBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter]     = useState('');
  const [loading, setLoading]   = useState(true);
  const [actionId, setActionId] = useState(null);
  const [search, setSearch]     = useState('');

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/bookings/owner');
      setBookings(res.data.bookings || []);
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

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
    if (!window.confirm('Reject this booking? The guest will be notified.')) return;
    setActionId(id);
    try {
      await api.put(`/bookings/${id}/reject`);
      setBookings(bs => bs.map(b => b._id === id ? { ...b, status: 'rejected' } : b));
      toast.success('Booking rejected');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not reject');
    } finally { setActionId(null); }
  };

  const handleApproveEdit = async (id) => {
    setActionId(`edit-${id}`);
    try {
      const res = await api.put(`/bookings/${id}/edit-request/review`, { action: 'approve' });
      setBookings(bs => bs.map(b => b._id === id ? res.data.booking : b));
      toast.success('Edit approved — booking updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not approve edit');
    } finally { setActionId(null); }
  };

  const handleRejectEdit = async (id) => {
    if (!window.confirm('Reject this edit request?')) return;
    setActionId(`edit-${id}`);
    try {
      const res = await api.put(`/bookings/${id}/edit-request/review`, { action: 'reject' });
      setBookings(bs => bs.map(b => b._id === id ? res.data.booking : b));
      toast.success('Edit request rejected');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not reject edit');
    } finally { setActionId(null); }
  };

  const counts = ALL_STATUSES.reduce((acc, s) => {
    acc[s] = bookings.filter(b => b.status === s).length;
    return acc;
  }, {});

  const pendingEdits = bookings.filter(b => b.editRequest?.status === 'pending').length;

  const filtered = bookings.filter(b => {
    const matchStatus = !filter || b.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      b.eventTitle?.toLowerCase().includes(q) ||
      b.user?.firstName?.toLowerCase().includes(q) ||
      b.user?.lastName?.toLowerCase().includes(q) ||
      b.user?.email?.toLowerCase().includes(q) ||
      b.venue?.name?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  if (loading) return <div className={styles.loading}>Loading bookings…</div>;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.headerInner}>
          <div>
            <h1>All Venue Bookings</h1>
            <p>
              {bookings.length} total booking{bookings.length !== 1 ? 's' : ''} across all your venues
              {pendingEdits > 0 && (
                <span className={styles.editAlertBadge}>✏️ {pendingEdits} edit request{pendingEdits !== 1 ? 's' : ''} pending</span>
              )}
            </p>
          </div>
          <Link to="/my-venues" className={styles.venuesBtn}>My Venues</Link>
        </div>
      </div>

      {/* Summary bar */}
      <div className={styles.summaryBar}>
        <div className={styles.summaryInner}>
          {ALL_STATUSES.map(s => (
            <div key={s} className={styles.summaryChip} style={{ borderColor: `${STATUS_COLORS[s]}40`, background: `${STATUS_COLORS[s]}10` }}>
              <span className={styles.summaryDot} style={{ background: STATUS_COLORS[s] }} />
              <span className={styles.summaryLabel}>{s.charAt(0).toUpperCase() + s.slice(1)}</span>
              <span className={styles.summaryCount} style={{ color: STATUS_COLORS[s] }}>{counts[s]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.tableSection}>
          <div className={styles.tableHeader}>
            <div className={styles.filterRow}>
              <h2>Bookings</h2>
              <input
                className={styles.searchInput}
                type="text"
                placeholder="Search guest, event, venue…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className={styles.filterTabs}>
              <button
                className={`${styles.tab} ${filter === '' ? styles.tabActive : ''}`}
                onClick={() => setFilter('')}
              >
                All ({bookings.length})
              </button>
              {ALL_STATUSES.map(s => (
                <button
                  key={s}
                  className={`${styles.tab} ${filter === s ? styles.tabActive : ''}`}
                  onClick={() => setFilter(s)}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)} ({counts[s]})
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className={styles.empty}>
              {bookings.length === 0
                ? 'No bookings have been made for your venues yet.'
                : 'No bookings match this filter.'}
            </div>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Guest</th>
                    <th>Venue</th>
                    <th>Event</th>
                    <th>Date / Time</th>
                    <th>Guests</th>
                    <th>Status</th>
                    <th>Price</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(b => {
                    const er           = b.editRequest;
                    const hasPendingEdit = er?.status === 'pending';
                    const isActing     = actionId === b._id || actionId === `edit-${b._id}`;

                    return (
                      <tr key={b._id} className={hasPendingEdit ? styles.rowWithEdit : ''}>
                        <td>
                          <div className={styles.guestCell}>
                            <strong>{b.user?.firstName} {b.user?.lastName}</strong>
                            <span>{b.user?.email}</span>
                          </div>
                        </td>
                        <td>
                          <Link to={`/venue-bookings/${b.venue?._id}`} className={styles.venueLink}>
                            {b.venue?.name}
                          </Link>
                        </td>
                        <td>{b.eventTitle}</td>
                        <td className={styles.dateCell}>
                          <div>{new Date(b.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                          <div className={styles.time}>{b.startTime} – {b.endTime}</div>
                        </td>
                        <td>{b.guestCount}</td>
                        <td>
                          <span
                            className={styles.statusBadge}
                            style={{
                              background: `${STATUS_COLORS[b.status]}18`,
                              color: STATUS_COLORS[b.status],
                              border: `1px solid ${STATUS_COLORS[b.status]}40`,
                            }}
                          >
                            {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                          </span>
                        </td>
                        <td className={styles.price}>£{b.totalPrice?.toFixed(2)}</td>
                        <td>
                          <div className={styles.actionCell}>
                            {/* Booking confirm/reject */}
                            {b.status === 'pending' && (
                              <div className={styles.actionBtns}>
                                <button
                                  className={styles.confirmBtn}
                                  disabled={isActing}
                                  onClick={() => handleConfirm(b._id)}
                                >
                                  {actionId === b._id ? '…' : 'Confirm'}
                                </button>
                                <button
                                  className={styles.rejectBtn}
                                  disabled={isActing}
                                  onClick={() => handleReject(b._id)}
                                >
                                  Reject
                                </button>
                              </div>
                            )}

                            {/* Edit request section */}
                            {hasPendingEdit && (
                              <div className={styles.editRequestBox}>
                                <div className={styles.editRequestTitle}>✏️ Edit Request</div>
                                <div className={styles.editRequestDetails}>
                                  <span>📅 {new Date(er.date).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}</span>
                                  <span>🕐 {er.startTime} – {er.endTime}</span>
                                  <span>👥 {er.guestCount}</span>
                                  <span>£{er.totalPrice?.toFixed(2)}</span>
                                </div>
                                <div className={styles.editActionBtns}>
                                  <button
                                    className={styles.approveEditBtn}
                                    disabled={isActing}
                                    onClick={() => handleApproveEdit(b._id)}
                                  >
                                    {actionId === `edit-${b._id}` ? '…' : 'Approve'}
                                  </button>
                                  <button
                                    className={styles.rejectEditBtn}
                                    disabled={isActing}
                                    onClick={() => handleRejectEdit(b._id)}
                                  >
                                    Decline
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Show resolved edit request status */}
                            {er && !hasPendingEdit && (
                              <span className={styles.editResolved} style={{ color: er.status === 'approved' ? '#00c896' : '#e94560' }}>
                                {er.status === 'approved' ? '✓ Edit approved' : '✗ Edit declined'}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

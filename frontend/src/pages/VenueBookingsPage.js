import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import styles from './VenueBookingsPage.module.css';

const STATUS_COLORS = { confirmed: '#00c896', cancelled: '#e94560', rejected: '#e94560', waitlisted: '#f5a623', pending: '#f5a623', completed: '#4facfe' };
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function VenueBookingsPage() {
  const { venueId } = useParams();
  const [venue, setVenue] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [calMonth, setCalMonth] = useState(new Date());
  const [actionId, setActionId] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [vRes, bRes] = await Promise.all([
        api.get(`/venues/${venueId}`),
        api.get(`/bookings/venue/${venueId}`)
      ]);
      setVenue(vRes.data.venue);
      setBookings(bRes.data.bookings || []);
    } catch {
      toast.error('Failed to load venue data');
    } finally {
      setLoading(false);
    }
  }, [venueId]);

  useEffect(() => { fetchData(); }, [fetchData]);

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

  // Build calendar grid
  const year = calMonth.getFullYear();
  const month = calMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const bookedDates = new Set(
    bookings
      .filter(b => ['confirmed', 'pending'].includes(b.status))
      .map(b => new Date(b.date).toDateString())
  );

  const calDays = [];
  for (let i = 0; i < firstDay; i++) calDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calDays.push(new Date(year, month, d));

  const filtered = filter ? bookings.filter(b => b.status === filter) : bookings;

  if (loading) return <div className={styles.loading}>Loading venue bookings…</div>;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.headerInner}>
          <div>
            <Link to="/my-venues" className={styles.back}>← My Venues</Link>
            <h1>{venue?.name}</h1>
            <p>📍 {venue?.location?.city} · {bookings.length} total bookings</p>
          </div>
        </div>
      </div>

      <div className={styles.container}>
        {/* Calendar */}
        <div className={styles.calendarCard}>
          <div className={styles.calNav}>
            <button onClick={() => setCalMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))} className={styles.calNavBtn}>←</button>
            <h3>{MONTHS[month]} {year}</h3>
            <button onClick={() => setCalMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))} className={styles.calNavBtn}>→</button>
          </div>
          <div className={styles.calGrid}>
            {DAYS.map(d => <div key={d} className={styles.calHeader}>{d}</div>)}
            {calDays.map((day, i) => {
              if (!day) return <div key={`e${i}`} className={styles.calEmpty} />;
              const isBooked = bookedDates.has(day.toDateString());
              const isToday = day.toDateString() === new Date().toDateString();
              return (
                <div key={day.getDate()} className={`${styles.calDay} ${isBooked ? styles.calBooked : styles.calAvail} ${isToday ? styles.calToday : ''}`}>
                  {day.getDate()}
                </div>
              );
            })}
          </div>
          <div className={styles.calLegend}>
            <span className={styles.legendItem}><span className={styles.ldotBooked} /> Booked</span>
            <span className={styles.legendItem}><span className={styles.ldotAvail} /> Available</span>
          </div>
        </div>

        {/* Bookings table */}
        <div className={styles.tableSection}>
          <div className={styles.tableHeader}>
            <h2>All Bookings</h2>
            <div className={styles.filterTabs}>
              {['', 'pending', 'confirmed', 'waitlisted', 'cancelled', 'rejected', 'completed'].map(s => (
                <button
                  key={s}
                  className={`${styles.tab} ${filter === s ? styles.tabActive : ''}`}
                  onClick={() => setFilter(s)}
                >
                  {s || 'All'}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className={styles.empty}>No bookings found for this filter.</div>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Guest</th>
                    <th>Event</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Guests</th>
                    <th>Status</th>
                    <th>Price</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(b => (
                    <tr key={b._id}>
                      <td>
                        <div className={styles.guestCell}>
                          <strong>{b.user?.firstName} {b.user?.lastName}</strong>
                          <span>{b.user?.email}</span>
                        </div>
                      </td>
                      <td>{b.eventTitle}</td>
                      <td>{new Date(b.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                      <td className={styles.time}>{b.startTime} – {b.endTime}</td>
                      <td>{b.guestCount}</td>
                      <td>
                        <span className={styles.statusBadge} style={{ background: `${STATUS_COLORS[b.status]}18`, color: STATUS_COLORS[b.status], border: `1px solid ${STATUS_COLORS[b.status]}40` }}>
                          {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                        </span>
                      </td>
                      <td className={styles.price}>£{b.totalPrice?.toFixed(2)}</td>
                      <td>
                        {b.status === 'pending' && (
                          <div className={styles.actionBtns}>
                            <button
                              className={styles.confirmBtn}
                              disabled={actionId === b._id}
                              onClick={() => handleConfirm(b._id)}
                            >
                              {actionId === b._id ? '…' : 'Confirm'}
                            </button>
                            <button
                              className={styles.rejectBtn}
                              disabled={actionId === b._id}
                              onClick={() => handleReject(b._id)}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

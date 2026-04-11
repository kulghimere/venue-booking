import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';
import styles from './AdminBookingsPage.module.css';

const STATUS_COLORS = { confirmed: '#00c896', cancelled: '#e94560', waitlisted: '#f5a623', pending: '#f5d76e', completed: '#4facfe' };

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ status: '', dateFrom: '', dateTo: '' });
  const [loading, setLoading] = useState(true);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (filters.status) params.set('status', filters.status);
      if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.set('dateTo', filters.dateTo);
      const r = await api.get(`/admin/bookings?${params}`);
      setBookings(r.data.bookings);
      setTotal(r.data.total);
      setPages(r.data.pages);
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const setFilter = (k, v) => { setFilters(f => ({ ...f, [k]: v })); setPage(1); };

  const exportCSV = () => {
    const headers = ['Venue', 'User', 'Date', 'Time', 'Guests', 'Status', 'Price'];
    const rows = bookings.map(b => [
      b.venue?.name || '',
      `${b.user?.firstName} ${b.user?.lastName}`,
      new Date(b.date).toLocaleDateString('en-GB'),
      `${b.startTime}-${b.endTime}`,
      b.guestCount,
      b.status,
      `£${b.totalPrice?.toFixed(2)}`
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bookings.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.headerInner}>
          <div>
            <h1>All Bookings</h1>
            <p>{total} total bookings</p>
          </div>
          <button className={styles.exportBtn} onClick={exportCSV}>Export CSV</button>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.filters}>
          <select value={filters.status} onChange={e => setFilter('status', e.target.value)} className={styles.filterSelect}>
            <option value="">All Statuses</option>
            {['confirmed', 'pending', 'waitlisted', 'cancelled', 'completed'].map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          <div className={styles.dateRange}>
            <label>From</label>
            <input type="date" value={filters.dateFrom} onChange={e => setFilter('dateFrom', e.target.value)} className={styles.dateInput} />
            <label>To</label>
            <input type="date" value={filters.dateTo} onChange={e => setFilter('dateTo', e.target.value)} className={styles.dateInput} />
          </div>
          {(filters.status || filters.dateFrom || filters.dateTo) && (
            <button className={styles.clearBtn} onClick={() => { setFilters({ status: '', dateFrom: '', dateTo: '' }); setPage(1); }}>Clear filters</button>
          )}
        </div>

        <div className={styles.tableWrap}>
          {loading ? (
            <div className={styles.loading}>Loading bookings…</div>
          ) : bookings.length === 0 ? (
            <div className={styles.empty}>No bookings found.</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Venue</th>
                  <th>User</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Guests</th>
                  <th>Status</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b._id}>
                    <td>
                      <div className={styles.venueCell}>
                        <strong>{b.venue?.name}</strong>
                        <span>{b.venue?.location?.city}</span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.userCell}>
                        <span>{b.user?.firstName} {b.user?.lastName}</span>
                        <span className={styles.email}>{b.user?.email}</span>
                      </div>
                    </td>
                    <td>{new Date(b.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td className={styles.time}>{b.startTime} – {b.endTime}</td>
                    <td>{b.guestCount}</td>
                    <td>
                      <span className={styles.statusBadge} style={{ background: `${STATUS_COLORS[b.status]}18`, color: STATUS_COLORS[b.status], border: `1px solid ${STATUS_COLORS[b.status]}40` }}>
                        {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                      </span>
                    </td>
                    <td className={styles.price}>£{b.totalPrice?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {pages > 1 && (
          <div className={styles.pagination}>
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className={styles.pageBtn}>← Prev</button>
            <span className={styles.pageInfo}>Page {page} of {pages}</span>
            <button disabled={page === pages} onClick={() => setPage(p => p + 1)} className={styles.pageBtn}>Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}

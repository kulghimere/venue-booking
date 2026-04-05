import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import styles from './AdminVenuesPage.module.css';

export default function AdminVenuesPage() {
  const [venues, setVenues] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);

  const fetchVenues = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get(`/admin/venues?page=${page}&limit=20`);
      setVenues(r.data.venues);
      setTotal(r.data.total);
      setPages(r.data.pages);
    } catch {
      toast.error('Failed to load venues');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchVenues(); }, [fetchVenues]);

  const handleToggle = async (venueId) => {
    setTogglingId(venueId);
    try {
      const r = await api.patch(`/admin/venues/${venueId}/toggle`);
      setVenues(vs => vs.map(v => v._id === venueId ? { ...v, isActive: r.data.venue.isActive } : v));
      toast.success(r.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to toggle venue');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.headerInner}>
          <div>
            <h1>All Venues</h1>
            <p>{total} total venues</p>
          </div>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.tableWrap}>
          {loading ? (
            <div className={styles.loading}>Loading venues…</div>
          ) : venues.length === 0 ? (
            <div className={styles.empty}>No venues found.</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Venue</th>
                  <th>Owner</th>
                  <th>City</th>
                  <th>Category</th>
                  <th>Capacity</th>
                  <th>Price/hr</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {venues.map(v => (
                  <tr key={v._id} className={!v.isActive ? styles.rowInactive : ''}>
                    <td>
                      <div className={styles.venueCell}>
                        <div className={styles.venueThumbnail}>
                          {v.images?.[0] ? <img src={v.images[0]} alt={v.name} /> : <span>🏛</span>}
                        </div>
                        <Link to={`/venues/${v._id}`} className={styles.venueName}>{v.name}</Link>
                      </div>
                    </td>
                    <td className={styles.ownerCell}>
                      {v.owner?.firstName} {v.owner?.lastName}
                      <span>{v.owner?.email}</span>
                    </td>
                    <td>{v.location?.city}</td>
                    <td><span className={styles.categoryBadge}>{v.category}</span></td>
                    <td>{v.capacity}</td>
                    <td className={styles.price}>£{v.pricePerHour}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${v.isActive ? styles.badgeActive : styles.badgeInactive}`}>
                        {v.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actionBtns}>
                        <button
                          className={`${styles.toggleBtn} ${v.isActive ? styles.toggleDeactivate : styles.toggleActivate}`}
                          onClick={() => handleToggle(v._id)}
                          disabled={togglingId === v._id}
                        >
                          {togglingId === v._id ? '…' : v.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <Link to={`/venues/${v._id}`} className={styles.viewBtn}>View</Link>
                      </div>
                    </td>
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

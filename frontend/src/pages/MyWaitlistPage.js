import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import styles from './MyWaitlistPage.module.css';

const STATUS_COLORS = { active: '#4facfe', notified: '#00c896', expired: '#8892b0' };
const STATUS_LABELS = { active: 'Waiting', notified: 'Slot Available!', expired: 'Expired' };

export default function MyWaitlistPage() {
  const [waitlist, setWaitlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    api.get('/waitlist/my')
      .then(r => setWaitlist(r.data.waitlist || []))
      .catch(() => toast.error('Failed to load waitlist'))
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (id) => {
    if (!window.confirm('Remove yourself from this waitlist?')) return;
    setRemovingId(id);
    try {
      await api.delete(`/waitlist/${id}`);
      setWaitlist(w => w.filter(e => e._id !== id));
      toast.success('Removed from waitlist');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove');
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.headerInner}>
          <h1>My Waitlist</h1>
          <p>{waitlist.length} active {waitlist.length === 1 ? 'entry' : 'entries'}</p>
        </div>
      </div>

      <div className={styles.container}>
        {loading ? (
          <div className={styles.loadingGrid}>
            {[1, 2, 3].map(i => <div key={i} className={styles.skeletonCard} />)}
          </div>
        ) : waitlist.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>📋</div>
            <h3>No waitlist entries</h3>
            <p>When a venue slot is taken, you can join the waitlist and we'll notify you when it becomes available.</p>
            <Link to="/venues" className={styles.browseBtn}>Browse Venues</Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {waitlist.map(entry => (
              <div key={entry._id} className={`${styles.card} ${entry.status === 'notified' ? styles.cardNotified : ''}`}>
                <div className={styles.cardImg}>
                  {entry.venue?.images?.[0] ? (
                    <img src={entry.venue.images[0]} alt={entry.venue.name} />
                  ) : (
                    <span>🏛</span>
                  )}
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.cardHeader}>
                    <div>
                      <h3 className={styles.venueName}>
                        <Link to={`/venues/${entry.venue?._id}`}>{entry.venue?.name}</Link>
                      </h3>
                      <p className={styles.venueLocation}>📍 {entry.venue?.location?.city}</p>
                    </div>
                    <span
                      className={styles.statusBadge}
                      style={{ background: `${STATUS_COLORS[entry.status]}18`, color: STATUS_COLORS[entry.status], border: `1px solid ${STATUS_COLORS[entry.status]}40` }}
                    >
                      {STATUS_LABELS[entry.status]}
                    </span>
                  </div>

                  <div className={styles.details}>
                    <div className={styles.detail}>
                      <span className={styles.detailLabel}>Date</span>
                      <span>{new Date(entry.requestedDate).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <div className={styles.detail}>
                      <span className={styles.detailLabel}>Time</span>
                      <span>{entry.startTime} – {entry.endTime}</span>
                    </div>
                    <div className={styles.detail}>
                      <span className={styles.detailLabel}>Guests</span>
                      <span>{entry.guestCount}</span>
                    </div>
                    <div className={styles.detail}>
                      <span className={styles.detailLabel}>Position</span>
                      <span className={styles.position}>#{entry.position} in queue</span>
                    </div>
                  </div>

                  {entry.status === 'notified' && (
                    <div className={styles.noticeBox}>
                      🎉 A slot opened up! Book now before it's taken.
                      <Link to={`/book/${entry.venue?._id}`} className={styles.bookNowBtn}>Book Now</Link>
                    </div>
                  )}

                  <div className={styles.cardFooter}>
                    <span className={styles.expires}>Expires {new Date(entry.expiresAt).toLocaleDateString('en-GB')}</span>
                    <button
                      className={styles.removeBtn}
                      onClick={() => handleRemove(entry._id)}
                      disabled={removingId === entry._id}
                    >
                      {removingId === entry._id ? 'Removing…' : 'Leave Waitlist'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

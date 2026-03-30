import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import styles from './MyVenuesPage.module.css';

const categoryIcons = { wedding: '💍', conference: '🎯', sports: '⚡', exhibition: '🎨', corporate: '💼', social: '🎉', outdoor: '🌿', concert: '🎵' };

export default function MyVenuesPage() {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/venues/my-venues')
      .then(r => setVenues(r.data.venues || []))
      .catch(() => toast.error('Failed to load venues'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (venueId) => {
    setDeletingId(venueId);
    try {
      await api.delete(`/venues/${venueId}`);
      setVenues(vs => vs.filter(v => v._id !== venueId));
      toast.success('Venue deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete venue');
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.headerInner}>
          <div>
            <h1>My Venues</h1>
            <p>{venues.length} {venues.length === 1 ? 'venue' : 'venues'} listed</p>
          </div>
          <Link to="/add-venue" className={styles.addBtn}>+ List New Venue</Link>
        </div>
      </div>

      <div className={styles.container}>
        {loading ? (
          <div className={styles.grid}>
            {[1, 2, 3].map(i => <div key={i} className={styles.skeletonCard} />)}
          </div>
        ) : venues.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🏛</div>
            <h3>No venues yet</h3>
            <p>Start listing your venues to reach thousands of event organizers.</p>
            <Link to="/add-venue" className={styles.addBtn}>List Your First Venue</Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {venues.map(v => (
              <div key={v._id} className={styles.card}>
                <div className={styles.cardImg}>
                  {v.images?.[0] ? (
                    <img src={v.images[0]} alt={v.name} />
                  ) : (
                    <div className={styles.imgPlaceholder}>
                      <span>{categoryIcons[v.category] || '🏛'}</span>
                    </div>
                  )}
                  <span className={`${styles.activeBadge} ${v.isActive ? styles.activeOn : styles.activeOff}`}>
                    {v.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.cardTop}>
                    <h3>{v.name}</h3>
                    <span className={styles.category}>{categoryIcons[v.category]} {v.category}</span>
                  </div>
                  <p className={styles.location}>📍 {v.location?.address}, {v.location?.city}</p>
                  <div className={styles.stats}>
                    <div className={styles.stat}>
                      <span className={styles.statVal}>👥 {v.capacity}</span>
                      <span className={styles.statLabel}>Capacity</span>
                    </div>
                    <div className={styles.stat}>
                      <span className={styles.statVal}>£{v.pricePerHour}</span>
                      <span className={styles.statLabel}>Per hour</span>
                    </div>
                    <div className={styles.stat}>
                      <span className={styles.statVal}>⭐ {(v.rating || 0).toFixed(1)}</span>
                      <span className={styles.statLabel}>{v.reviewCount} reviews</span>
                    </div>
                  </div>
                  <div className={styles.cardActions}>
                    <Link to={`/venue-bookings/${v._id}`} className={styles.bookingsBtn}>View Bookings</Link>
                    <button className={styles.editBtn} onClick={() => navigate(`/edit-venue/${v._id}`)}>Edit</button>
                    <button className={styles.deleteBtn} onClick={() => setConfirmDelete(v)}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {confirmDelete && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h3>Delete Venue</h3>
            <p>Are you sure you want to delete <strong>{confirmDelete.name}</strong>? This action cannot be undone.</p>
            <div className={styles.modalActions}>
              <button className={styles.cancelModalBtn} onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button
                className={styles.confirmDeleteBtn}
                onClick={() => handleDelete(confirmDelete._id)}
                disabled={deletingId === confirmDelete._id}
              >
                {deletingId === confirmDelete._id ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import styles from './VenueDetailPage.module.css';

const categoryIcons = { wedding:'💍', conference:'🎯', sports:'⚡', exhibition:'🎨', corporate:'💼', social:'🎉', outdoor:'🌿', concert:'🎵' };

export default function VenueDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [venue, setVenue] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [availability, setAvailability] = useState([]);
  const [availLoading, setAvailLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/venues/${id}`),
      api.get(`/recommendations/similar/${id}`)
    ]).then(([vRes, sRes]) => {
      setVenue(vRes.data.venue);
      setSimilar(sRes.data.venues || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!selectedDate) return;
    setAvailLoading(true);
    api.get(`/venues/${id}/availability?date=${selectedDate}`)
      .then(r => setAvailability(r.data.availability || []))
      .catch(() => setAvailability([]))
      .finally(() => setAvailLoading(false));
  }, [selectedDate, id]);

  const today = new Date().toISOString().split('T')[0];

  if (loading) return (
    <div className={styles.loadingPage}>
      <div className={styles.loadingInner}>
        <div className={`skeleton ${styles.skeletonHero}`} />
        <div className={styles.skeletonBody}>
          <div className={`skeleton ${styles.skeletonTitle}`} />
          <div className={`skeleton ${styles.skeletonText}`} />
          <div className={`skeleton ${styles.skeletonText}`} style={{ width: '70%' }} />
        </div>
      </div>
    </div>
  );

  if (!venue) return (
    <div className={styles.notFound}>
      <h2>Venue not found</h2>
      <Link to="/venues">← Back to venues</Link>
    </div>
  );

  const icon = categoryIcons[venue.category] || '🏛';

  return (
    <div className={styles.page}>
      {/* Hero image */}
      <div className={styles.hero}>
        {venue.images?.[0] ? (
          <img src={venue.images[0]} alt={venue.name} className={styles.heroImg} />
        ) : (
          <div className={styles.heroPlaceholder}>
            <span style={{ fontSize: '6rem' }}>{icon}</span>
          </div>
        )}
        <div className={styles.heroOverlay} />
        <div className={styles.heroBreadcrumb}>
          <Link to="/venues">Venues</Link> / <span>{venue.name}</span>
        </div>
        <div className={styles.heroInfo}>
          <div className={styles.heroBadge}>{icon} {venue.category}</div>
          <h1 className={styles.heroTitle}>{venue.name}</h1>
          <div className={styles.heroMeta}>
            <span>📍 {venue.location.address}, {venue.location.city}</span>
            <span>👥 Up to {venue.capacity} guests</span>
            <span>⭐ {(venue.rating || 0).toFixed(1)} ({venue.reviewCount || 0} reviews)</span>
          </div>
        </div>
      </div>

      <div className="container">
        <div className={styles.layout}>
          {/* Main content */}
          <div className={styles.main}>
            <section className={styles.section}>
              <h2>About this venue</h2>
              <p>{venue.description}</p>
            </section>

            <section className={styles.section}>
              <h2>Amenities</h2>
              <div className={styles.amenitiesGrid}>
                {(venue.amenities || []).map(a => (
                  <div key={a} className={styles.amenity}>✓ {a}</div>
                ))}
              </div>
            </section>

            {venue.rules?.length > 0 && (
              <section className={styles.section}>
                <h2>Venue Rules</h2>
                <ul className={styles.rulesList}>
                  {venue.rules.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </section>
            )}

            <section className={styles.section}>
              <h2>Check Availability</h2>
              <div className={styles.availabilityPicker}>
                <input
                  type="date" min={today} value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className={styles.datePicker}
                />
                {selectedDate && (
                  availLoading ? <p className={styles.availMsg}>Checking availability…</p> : (
                    <div className={styles.slots}>
                      {availability.map(s => (
                        <div key={s.time} className={`${styles.slot} ${s.available ? styles.slotAvail : styles.slotBooked}`}>
                          {s.time}
                          <span>{s.available ? '✓' : '✗'}</span>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>
            </section>

            {similar.length > 0 && (
              <section className={styles.section}>
                <h2>Similar Venues</h2>
                <div className={styles.similarGrid}>
                  {similar.map(v => (
                    <Link key={v._id} to={`/venues/${v._id}`} className={styles.similarCard}>
                      {v.images?.[0] ? <img src={v.images[0]} alt={v.name} /> : <div className={styles.simPlaceholder}>{categoryIcons[v.category] || '🏛'}</div>}
                      <div className={styles.similarInfo}>
                        <strong>{v.name}</strong>
                        <span>📍 {v.location.city} · £{v.pricePerHour}/hr</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Booking card */}
          <aside className={styles.sidebar}>
            <div className={styles.bookingCard}>
              <div className={styles.priceRow}>
                <span className={styles.price}>£{venue.pricePerHour}</span>
                <span className={styles.priceUnit}>per hour</span>
              </div>
              <div className={styles.ratingRow}>
                <span className={styles.stars}>{'★'.repeat(Math.round(venue.rating || 0))}</span>
                <span className={styles.ratingNum}>{(venue.rating || 0).toFixed(1)}</span>
                <span className={styles.reviews}>· {venue.reviewCount} reviews</span>
              </div>
              <div className={styles.venueStats}>
                <div className={styles.vStat}><strong>👥</strong><span>Capacity: {venue.capacity}</span></div>
                <div className={styles.vStat}><strong>📋</strong><span>Policy: {venue.cancellationPolicy}</span></div>
                <div className={styles.vStat}><strong>🏙️</strong><span>{venue.location.city}, {venue.location.country}</span></div>
              </div>
              {user ? (
                <button className={styles.bookBtn} onClick={() => navigate(`/book/${venue._id}`)}>
                  Book This Venue
                </button>
              ) : (
                <Link to="/login" className={styles.bookBtn}>Sign In to Book</Link>
              )}
              <p className={styles.bookNote}>Free cancellation within 24 hours of booking.</p>
            </div>

            <div className={styles.ownerCard}>
              <div className={styles.ownerAvatar}>{venue.owner?.name?.charAt(0)}</div>
              <div>
                <strong>Managed by {venue.owner?.name}</strong>
                <span>Venue Owner</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

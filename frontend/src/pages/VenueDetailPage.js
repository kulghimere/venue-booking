import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import styles from './VenueDetailPage.module.css';

const categoryIcons = { wedding:'💍', conference:'🎯', sports:'⚡', exhibition:'🎨', corporate:'💼', social:'🎉', outdoor:'🌿', concert:'🎵' };

function StarRating({ rating, onSelect, interactive = false }) {
  const [hovered, setHovered] = useState(0);
  const display = interactive ? (hovered || rating) : rating;
  return (
    <div className={styles.stars}>
      {[1,2,3,4,5].map(n => (
        <span
          key={n}
          className={`${styles.star} ${n <= display ? styles.starFilled : styles.starEmpty}`}
          onClick={() => interactive && onSelect && onSelect(n)}
          onMouseEnter={() => interactive && setHovered(n)}
          onMouseLeave={() => interactive && setHovered(0)}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

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

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewTotal, setReviewTotal] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [eligibleBooking, setEligibleBooking] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

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
    setReviewsLoading(true);
    api.get(`/reviews?venueId=${id}`)
      .then(r => { setReviews(r.data.reviews || []); setReviewTotal(r.data.total || 0); })
      .catch(() => {})
      .finally(() => setReviewsLoading(false));
  }, [id]);

  // Check if user has a completed booking for this venue and hasn't reviewed it
  useEffect(() => {
    if (!user) return;
    api.get('/bookings/my?status=completed')
      .then(r => {
        const completed = (r.data.bookings || []).filter(b => b.venue?._id === id || b.venue === id);
        if (completed.length === 0) return;
        // Find a booking that hasn't been reviewed
        const reviewedBookingIds = new Set(reviews.map(r => r.booking));
        const unreviewedBooking = completed.find(b => !reviewedBookingIds.has(b._id));
        setEligibleBooking(unreviewedBooking || null);
      })
      .catch(() => {});
  }, [user, id, reviews]);

  useEffect(() => {
    if (!selectedDate) return;
    setAvailLoading(true);
    api.get(`/venues/${id}/availability?date=${selectedDate}`)
      .then(r => setAvailability(r.data.availability || []))
      .catch(() => setAvailability([]))
      .finally(() => setAvailLoading(false));
  }, [selectedDate, id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewForm.rating) return toast.error('Please select a rating');
    if (!eligibleBooking) return;
    setSubmittingReview(true);
    try {
      const r = await api.post('/reviews', {
        venueId: id,
        bookingId: eligibleBooking._id,
        rating: reviewForm.rating,
        comment: reviewForm.comment
      });
      setReviews(prev => [r.data.review, ...prev]);
      setReviewTotal(t => t + 1);
      setEligibleBooking(null);
      setShowReviewForm(false);
      setReviewForm({ rating: 0, comment: '' });
      toast.success('Review submitted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : (venue?.rating || 0).toFixed(1);

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
            <span>⭐ {avgRating} ({reviewTotal || venue.reviewCount || 0} reviews)</span>
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

            {/* Reviews Section */}
            <section className={styles.section}>
              <div className={styles.reviewsHeader}>
                <div>
                  <h2>Reviews</h2>
                  <div className={styles.ratingOverview}>
                    <span className={styles.bigRating}>{avgRating}</span>
                    <StarRating rating={Math.round(parseFloat(avgRating))} />
                    <span className={styles.reviewCount}>{reviewTotal || venue.reviewCount || 0} reviews</span>
                  </div>
                </div>
                {user && eligibleBooking && !showReviewForm && (
                  <button className={styles.writeReviewBtn} onClick={() => setShowReviewForm(true)}>
                    Write a Review
                  </button>
                )}
              </div>

              {showReviewForm && (
                <form className={styles.reviewForm} onSubmit={handleReviewSubmit}>
                  <h3>Your Review</h3>
                  <div className={styles.ratingSelect}>
                    <label>Rating *</label>
                    <StarRating
                      rating={reviewForm.rating}
                      onSelect={n => setReviewForm(f => ({ ...f, rating: n }))}
                      interactive
                    />
                  </div>
                  <div className={styles.commentField}>
                    <label>Comment (optional)</label>
                    <textarea
                      rows={3}
                      maxLength={500}
                      placeholder="Share your experience…"
                      value={reviewForm.comment}
                      onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                    />
                    <span className={styles.charCount}>{reviewForm.comment.length}/500</span>
                  </div>
                  <div className={styles.reviewFormActions}>
                    <button type="button" className={styles.cancelReviewBtn} onClick={() => setShowReviewForm(false)}>Cancel</button>
                    <button type="submit" className={styles.submitReviewBtn} disabled={submittingReview}>
                      {submittingReview ? 'Submitting…' : 'Submit Review'}
                    </button>
                  </div>
                </form>
              )}

              {reviewsLoading ? (
                <p className={styles.availMsg}>Loading reviews…</p>
              ) : reviews.length === 0 ? (
                <div className={styles.noReviews}>
                  <p>No reviews yet. Be the first to review this venue!</p>
                </div>
              ) : (
                <div className={styles.reviewsList}>
                  {reviews.map(r => (
                    <div key={r._id} className={styles.reviewCard}>
                      <div className={styles.reviewTop}>
                        <div className={styles.reviewerInfo}>
                          <div className={styles.reviewerAvatar}>
                            {r.user?.avatar ? <img src={r.user.avatar} alt="" /> : <span>{r.user?.firstName?.charAt(0)}</span>}
                          </div>
                          <div>
                            <strong>{r.user?.firstName} {r.user?.lastName}</strong>
                            <span className={styles.reviewDate}>{new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          </div>
                        </div>
                        <StarRating rating={r.rating} />
                      </div>
                      {r.comment && <p className={styles.reviewComment}>{r.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
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
                <span className={styles.stars}>{'★'.repeat(Math.round(parseFloat(avgRating)))}</span>
                <span className={styles.ratingNum}>{avgRating}</span>
                <span className={styles.reviews}>· {reviewTotal || venue.reviewCount} reviews</span>
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

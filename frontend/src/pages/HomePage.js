import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import VenueCard from '../components/VenueCard';
import styles from './HomePage.module.css';

const CATEGORIES = [
  { key: 'wedding', label: 'Weddings', icon: '💍', desc: 'Elegant spaces for your special day' },
  { key: 'conference', label: 'Conferences', icon: '🎯', desc: 'Professional meeting venues' },
  { key: 'sports', label: 'Sports', icon: '⚡', desc: 'Athletic & competition facilities' },
  { key: 'exhibition', label: 'Exhibitions', icon: '🎨', desc: 'Showcase & gallery spaces' },
  { key: 'outdoor', label: 'Outdoor', icon: '🌿', desc: 'Open-air event spaces' },
  { key: 'social', label: 'Social', icon: '🎉', desc: 'Party & social gatherings' },
];

const FEATURES = [
  { icon: '🤖', title: 'ML-Powered Recommendations', desc: 'Our algorithm analyses your preferences, event history, and real-time demand to surface perfect venue matches.' },
  { icon: '⚡', title: 'Real-Time Availability', desc: 'See live booking status instantly. Automated conflict detection prevents double-bookings every time.' },
  { icon: '📋', title: 'Smart Waitlisting', desc: 'Automatically join a waitlist when a venue is full. Get notified instantly when a slot opens up.' },
  { icon: '🗺️', title: 'Location-Aware Search', desc: 'Filter by city, proximity, and accessibility. Find the most convenient venues for your guests.' },
];

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/venues?limit=6').then(r => setFeatured(r.data.venues || [])).catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (city) params.set('city', city);
    navigate(`/venues?${params.toString()}`);
  };

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroGlow1} />
        <div className={styles.heroGlow2} />
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>✨ AI-Powered Venue Discovery</div>
          <h1 className={styles.heroTitle}>
            Find the Perfect Venue<br />
            <span className={styles.heroAccent}>for Every Occasion</span>
          </h1>
          <p className={styles.heroSub}>
            Intelligent scheduling, real-time availability, and machine learning recommendations — all in one platform.
          </p>
          <form className={styles.searchBar} onSubmit={handleSearch}>
            <div className={styles.searchField}>
              <span>🔍</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search venues, events, amenities…" />
            </div>
            <div className={styles.searchDivider} />
            <div className={styles.searchField}>
              <span>📍</span>
              <input value={city} onChange={e => setCity(e.target.value)} placeholder="City or location" />
            </div>
            <button type="submit" className={styles.searchBtn}>Search</button>
          </form>
          <div className={styles.heroStats}>
            <div className={styles.stat}><strong>500+</strong><span>Venues</span></div>
            <div className={styles.statDot} />
            <div className={styles.stat}><strong>10k+</strong><span>Bookings</span></div>
            <div className={styles.statDot} />
            <div className={styles.stat}><strong>98%</strong><span>Satisfaction</span></div>
          </div>
        </div>
        <div className={styles.heroVisual}>
          <div className={styles.floatingCard} style={{ top: '8%', right: '5%' }}>
            <div className={styles.fcIcon}>🤖</div>
            <div><strong>AI Match Found</strong><span>Grand Pavilion — 94% match</span></div>
          </div>
          <div className={styles.floatingCard} style={{ bottom: '20%', right: '2%' }}>
            <div className={styles.fcIcon}>✅</div>
            <div><strong>Booking Confirmed</strong><span>TechHub · 15 Mar, 9am</span></div>
          </div>
          <div className={styles.floatingCard} style={{ bottom: '5%', left: '5%', right: 'auto' }}>
            <div className={styles.fcIcon}>📋</div>
            <div><strong>Waitlist Promoted</strong><span>You're next — 1 slot opened</span></div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.sectionHead}>
            <h2>Browse by Category</h2>
            <Link to="/venues" className={styles.seeAll}>View all venues →</Link>
          </div>
          <div className={styles.categories}>
            {CATEGORIES.map(cat => (
              <Link key={cat.key} to={`/venues?category=${cat.key}`} className={styles.catCard}>
                <span className={styles.catIcon}>{cat.icon}</span>
                <strong>{cat.label}</strong>
                <span>{cat.desc}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured venues */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.sectionHead}>
            <h2>Featured Venues</h2>
            <Link to="/venues" className={styles.seeAll}>See all →</Link>
          </div>
          {featured.length === 0 ? (
            <div className={styles.venueGrid}>
              {[1,2,3,4,5,6].map(i => <div key={i} className={`skeleton ${styles.skeletonCard}`} />)}
            </div>
          ) : (
            <div className={styles.venueGrid}>
              {featured.map(v => <VenueCard key={v._id} venue={v} />)}
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className={styles.featuresSection}>
        <div className="container">
          <div className={styles.sectionHead} style={{ textAlign: 'center', justifyContent: 'center', flexDirection: 'column', gap: '0.5rem', marginBottom: '3rem' }}>
            <h2>Why VenueBook?</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>Intelligent technology that makes event planning effortless</p>
          </div>
          <div className={styles.features}>
            {FEATURES.map((f, i) => (
              <div key={i} className={styles.feature}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <div className="container">
          <div className={styles.ctaBox}>
            <div className={styles.ctaGlow} />
            <h2>Ready to Find Your Perfect Venue?</h2>
            <p>Join thousands of event planners using intelligent scheduling to make every event a success.</p>
            <div className={styles.ctaButtons}>
              <Link to="/register" className={styles.ctaPrimary}>Start for Free</Link>
              <Link to="/venues" className={styles.ctaSecondary}>Browse Venues</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

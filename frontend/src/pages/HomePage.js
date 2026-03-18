import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import VenueCard from '../components/VenueCard';
import styles from './HomePage.module.css';

const CATEGORIES = [
  { key: 'wedding',    label: 'Weddings',     icon: '💍', desc: 'Elegant spaces for your special day' },
  { key: 'conference', label: 'Conferences',  icon: '🎯', desc: 'Professional meeting venues' },
  { key: 'sports',     label: 'Sports',       icon: '⚡', desc: 'Athletic & competition facilities' },
  { key: 'exhibition', label: 'Exhibitions',  icon: '🎨', desc: 'Showcase & gallery spaces' },
  { key: 'outdoor',    label: 'Outdoor',      icon: '🌿', desc: 'Open-air event spaces' },
  { key: 'social',     label: 'Social',       icon: '🎉', desc: 'Party & social gatherings' },
];

const FEATURES = [
  { icon: '🤖', title: 'ML-Powered Recommendations', desc: 'Our algorithm analyses your preferences and event history to surface perfect venue matches.' },
  { icon: '⚡', title: 'Real-Time Availability',      desc: 'See live booking status instantly. Automated conflict detection prevents double-bookings.' },
  { icon: '📋', title: 'Smart Waitlisting',           desc: 'Automatically join a waitlist when a venue is full. Get notified the moment a slot opens.' },
  { icon: '🗺️', title: 'Location-Aware Search',      desc: 'Filter by city and proximity. Find the most convenient venues for your guests.' },
];

const STEPS = [
  { num: '1', title: 'Browse & Discover',  desc: 'Search venues by category, location, capacity, or let AI recommend the perfect match.' },
  { num: '2', title: 'Book Instantly',     desc: 'Select your date and time, review pricing, and confirm your booking in under 2 minutes.' },
  { num: '3', title: 'Host Your Event',    desc: 'Arrive, set up, and enjoy. We handle confirmation emails, reminders, and cancellations.' },
];

// ── Animated counter ──────────────────────────────────────────────────────────
function CountUp({ target, suffix = '', decimals = 0, duration = 1600 }) {
  const [count, setCount] = useState(0);
  const rafRef  = useRef(null);

  useEffect(() => {
    if (!target && target !== 0) return;
    let startTime = null;

    const animate = (ts) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3); // cubic ease-out
      const value    = eased * target;
      setCount(decimals > 0 ? parseFloat(value.toFixed(decimals)) : Math.floor(value));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
      else setCount(target);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => rafRef.current && cancelAnimationFrame(rafRef.current);
  }, [target, duration, decimals]);

  return <>{decimals > 0 ? count.toFixed(decimals) : count.toLocaleString()}{suffix}</>;
}

// ── Format a number for the hero (e.g. 1234 → "1.2k+") ──────────────────────
function fmtHero(n) {
  if (!n) return '0';
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, '') + 'k+';
  return n + '+';
}

// ── Star rating display ───────────────────────────────────────────────────────
function Stars({ rating }) {
  const full  = Math.floor(rating);
  const half  = rating - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <span className={styles.stars}>
      {'★'.repeat(full)}
      {half ? '½' : ''}
      {'☆'.repeat(empty)}
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [search, setSearch]     = useState('');
  const [city, setCity]         = useState('');
  const [stats, setStats]       = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const navigate = useNavigate();

  // Fetch featured venues once
  useEffect(() => {
    api.get('/venues?limit=6').then(r => setFeatured(r.data.venues || [])).catch(() => {});
  }, []);

  // Fetch live stats + auto-refresh every 60 s
  const fetchStats = () => {
    api.get('/analytics/public-stats')
      .then(r => { setStats(r.data.stats); setLastUpdated(new Date()); })
      .catch(() => {});
  };

  useEffect(() => {
    fetchStats();
    const timer = setInterval(fetchStats, 60_000);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (city)   params.set('city', city);
    navigate(`/venues?${params.toString()}`);
  };

  const s = stats; // shorthand

  return (
    <div className={styles.page}>

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroGlow1} />
        <div className={styles.heroGlow2} />

        <div className={styles.heroInner}>
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

            {/* Hero stats — real data */}
            <div className={styles.heroStats}>
              <div className={styles.stat}>
                <strong>{s ? fmtHero(s.totalVenues) : '—'}</strong>
                <span>Active Venues</span>
              </div>
              <div className={styles.statDot} />
              <div className={styles.stat}>
                <strong>{s ? fmtHero(s.totalBookings) : '—'}</strong>
                <span>Bookings Made</span>
              </div>
              <div className={styles.statDot} />
              <div className={styles.stat}>
                <strong>{s ? (s.satisfactionPct > 0 ? `${s.satisfactionPct}%` : `${s.avgRating > 0 ? s.avgRating + '/5' : 'New'}`) : '—'}</strong>
                <span>Satisfaction</span>
              </div>
            </div>
          </div>

          {/* Right: floating cards */}
          <div className={styles.heroVisual}>
            <div className={styles.floatingCard}>
              <div className={styles.fcIcon}>🤖</div>
              <div>
                <strong>AI Match Found</strong>
                <span>Grand Pavilion — 94% match</span>
              </div>
            </div>
            <div className={styles.floatingCard}>
              <div className={styles.fcIcon}>✅</div>
              <div>
                <strong>Booking Confirmed</strong>
                <span>TechHub · 15 Mar, 9 am</span>
              </div>
            </div>
            <div className={styles.floatingCard}>
              <div className={styles.fcIcon}>📋</div>
              <div>
                <strong>Waitlist Promoted</strong>
                <span>You're next — 1 slot opened</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Live Platform Stats Bar ────────────────────────── */}
      <section className={styles.statsBar}>
        <div className={styles.statsBarInner}>
          <div className={styles.statsGrid}>

            <div className={styles.statItem}>
              <div className={styles.statIcon}>🏛</div>
              <div className={styles.statNum}>
                {s ? <CountUp target={s.totalVenues} suffix="+" /> : <span className={styles.statLoading}>—</span>}
              </div>
              <div className={styles.statLabel}>Active Venues</div>
            </div>

            <div className={styles.statDividerV} />

            <div className={styles.statItem}>
              <div className={styles.statIcon}>📋</div>
              <div className={styles.statNum}>
                {s ? <CountUp target={s.completedBookings} suffix="+" /> : <span className={styles.statLoading}>—</span>}
              </div>
              <div className={styles.statLabel}>Events Completed</div>
            </div>

            <div className={styles.statDividerV} />

            <div className={styles.statItem}>
              <div className={styles.statIcon}>⭐</div>
              <div className={styles.statNum}>
                {s
                  ? s.avgRating > 0
                    ? <><CountUp target={s.avgRating} decimals={1} /><span className={styles.statOf}>/5</span></>
                    : <span className={styles.statNew}>New</span>
                  : <span className={styles.statLoading}>—</span>
                }
              </div>
              <div className={styles.statLabel}>
                Avg Satisfaction
                {s && s.avgRating > 0 && <Stars rating={s.avgRating} />}
              </div>
            </div>

            <div className={styles.statDividerV} />

            <div className={styles.statItem}>
              <div className={styles.statIcon}>📝</div>
              <div className={styles.statNum}>
                {s ? <CountUp target={s.totalReviews} suffix="+" /> : <span className={styles.statLoading}>—</span>}
              </div>
              <div className={styles.statLabel}>Verified Reviews</div>
            </div>

            <div className={styles.statDividerV} />

            <div className={styles.statItem}>
              <div className={styles.statIcon}>👥</div>
              <div className={styles.statNum}>
                {s ? <CountUp target={s.totalUsers} suffix="+" /> : <span className={styles.statLoading}>—</span>}
              </div>
              <div className={styles.statLabel}>Registered Members</div>
            </div>

          </div>

          <div className={styles.liveRow}>
            <span className={styles.liveDot} />
            <span className={styles.liveText}>
              Live data{lastUpdated ? ` · Updated ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
            </span>
          </div>
        </div>
      </section>

      {/* ── Top Rated Venues ──────────────────────────────── */}
      {s && s.avgRating > 0 && s.totalReviews > 0 && (
        <section className={styles.trustBanner}>
          <div className="container">
            <div className={styles.trustInner}>
              <div className={styles.trustRating}>
                <span className={styles.trustBig}>{s.avgRating.toFixed(1)}</span>
                <div>
                  <Stars rating={s.avgRating} />
                  <span className={styles.trustSub}>Based on {s.totalReviews.toLocaleString()} verified reviews</span>
                </div>
              </div>
              <div className={styles.trustDivider} />
              <div className={styles.trustFacts}>
                <div className={styles.trustFact}>
                  <strong>{s.completedBookings.toLocaleString()}</strong>
                  <span>events successfully hosted</span>
                </div>
                <div className={styles.trustFact}>
                  <strong>{s.satisfactionPct > 0 ? `${s.satisfactionPct}%` : '—'}</strong>
                  <span>guest satisfaction rate</span>
                </div>
                {s.topCategory && (
                  <div className={styles.trustFact}>
                    <strong style={{ textTransform: 'capitalize' }}>{s.topCategory}</strong>
                    <span>most popular category</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Browse by Category ────────────────────────────── */}
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

      {/* ── Featured Venues ───────────────────────────────── */}
      <section className={styles.section} style={{ paddingTop: 0 }}>
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

      {/* ── How It Works ──────────────────────────────────── */}
      <section className={styles.howSection}>
        <div className="container">
          <div className={styles.sectionHead} style={{ justifyContent:'center', flexDirection:'column', alignItems:'center', gap:'0.5rem' }}>
            <h2>How It Works</h2>
            <p className={styles.featuresSub}>Three simple steps to your perfect event</p>
          </div>
          <div className={styles.steps}>
            {STEPS.map(s => (
              <div key={s.num} className={styles.step}>
                <div className={styles.stepNum}>{s.num}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why VenueBook ─────────────────────────────────── */}
      <section className={styles.featuresSection}>
        <div className="container">
          <div className={styles.sectionHead} style={{ justifyContent:'center', flexDirection:'column', alignItems:'center', gap:'0.5rem' }}>
            <h2 style={{ color:'white' }}>Why VenueBook?</h2>
            <p className={styles.featuresSub}>Intelligent technology that makes event planning effortless</p>
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

      {/* ── CTA ───────────────────────────────────────────── */}
      <section className={styles.cta}>
        <div className="container">
          <div className={styles.ctaBox}>
            <div className={styles.ctaGlow} />
            <h2>Ready to Find Your Perfect Venue?</h2>
            <p>Join {s ? s.totalUsers.toLocaleString() + ' members' : 'thousands of event planners'} using intelligent scheduling to make every event a success.</p>
            <div className={styles.ctaButtons}>
              <Link to="/register" className={styles.ctaPrimary}>Get Started Free</Link>
              <Link to="/venues" className={styles.ctaSecondary}>Browse Venues</Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

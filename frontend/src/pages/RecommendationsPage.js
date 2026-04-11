import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import styles from './RecommendationsPage.module.css';

const DEMAND_COLORS = { very_high:'#e94560', high:'#f5a623', moderate:'#4facfe', low:'#00c896' };
const DEMAND_LABELS = { very_high:'Very High', high:'High', moderate:'Moderate', low:'Low' };

export default function RecommendationsPage() {
  const [recs, setRecs] = useState([]);
  const [demand, setDemand] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ eventType:'', guestCount:'', maxBudget:'', city:'', date:'' });

  const fetchRecs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(form).forEach(([k,v]) => { if(v) params.set(k,v); });
      const res = await api.get(`/recommendations?${params}`);
      setRecs(res.data.recommendations || []);
      setDemand(res.data.demandForecast);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRecs(); }, []); // eslint-disable-line

  const set = (k,v) => setForm(f => ({...f,[k]:v}));
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className="container">
          <div className={styles.headerBadge}>🤖 Machine Learning</div>
          <h1>AI Venue Recommendations</h1>
          <p>Our ML algorithm analyses your preferences and booking history to surface the best venue matches.</p>
        </div>
      </div>

      <div className="container">
        <div className={styles.layout}>
          {/* Filter form */}
          <aside className={styles.filterPanel}>
            <h3>Refine Recommendations</h3>
            <div className={styles.filterGroup}>
              <label>Event Type</label>
              <select value={form.eventType} onChange={e => set('eventType', e.target.value)}>
                <option value="">Any</option>
                {['wedding','conference','sports','exhibition','outdoor','social','corporate','concert'].map(t =>
                  <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>
                )}
              </select>
            </div>
            <div className={styles.filterGroup}>
              <label>Guest Count</label>
              <input type="number" placeholder="e.g. 100" value={form.guestCount} onChange={e => set('guestCount', e.target.value)} min={1} />
            </div>
            <div className={styles.filterGroup}>
              <label>Max Budget (£/hr)</label>
              <input type="number" placeholder="e.g. 200" value={form.maxBudget} onChange={e => set('maxBudget', e.target.value)} min={0} />
            </div>
            <div className={styles.filterGroup}>
              <label>City</label>
              <input placeholder="e.g. London" value={form.city} onChange={e => set('city', e.target.value)} />
            </div>
            <div className={styles.filterGroup}>
              <label>Event Date</label>
              <input type="date" min={today} value={form.date} onChange={e => set('date', e.target.value)} />
            </div>
            <button className={styles.runBtn} onClick={fetchRecs} disabled={loading}>
              {loading ? 'Running AI…' : '🤖 Get Recommendations'}
            </button>
          </aside>

          <main>
            {/* Demand forecast */}
            {demand && (
              <div className={styles.demandCard} style={{ '--demand-color': DEMAND_COLORS[demand.demandLevel] }}>
                <div className={styles.demandHeader}>
                  <div>
                    <h3>Demand Forecast</h3>
                    <p>{demand.recommendation}</p>
                  </div>
                  <div className={styles.demandBadge}>{DEMAND_LABELS[demand.demandLevel]} Demand</div>
                </div>
                <div className={styles.demandBar}>
                  <div className={styles.demandFill} style={{ width: `${demand.demandScore * 100}%` }} />
                </div>
                <div className={styles.demandMeta}>
                  <span>📊 {Math.round(demand.demandScore * 100)}% demand score</span>
                  {demand.isHighSeason && <span>🔥 High season period</span>}
                  {demand.isWeekend && <span>📅 Weekend pricing may apply</span>}
                </div>
              </div>
            )}

            {/* Recommendations */}
            <div className={styles.recsHeader}>
              <h2>Top Matches</h2>
              <span className={styles.algo}>Powered by ML Scoring v1</span>
            </div>

            {loading ? (
              <div className={styles.grid}>
                {[1,2,3,4,5,6].map(i => <div key={i} className={`skeleton ${styles.skeletonCard}`} />)}
              </div>
            ) : recs.length === 0 ? (
              <div className={styles.empty}><span>🔍</span><p>No recommendations yet. Try adjusting filters and running the AI.</p></div>
            ) : (
              <div className={styles.grid}>
                {recs.map(({ venue, score, reasons }, i) => (
                  <div key={venue._id} className={styles.recCard}>
                    <div className={styles.recRank}>#{i+1}</div>
                    <div className={styles.recImageWrap}>
                      {venue.images?.[0] ? <img src={venue.images[0]} alt={venue.name} /> : <div className={styles.recPlaceholder}>🏛</div>}
                      <div className={styles.scoreChip}>
                        <div className={styles.scoreRing} style={{ '--score': score }}>
                          <span>{Math.round(score * 100)}%</span>
                        </div>
                        <span>match</span>
                      </div>
                    </div>
                    <div className={styles.recBody}>
                      <h3>{venue.name}</h3>
                      <p>📍 {venue.location.city} · 👥 {venue.capacity} · £{venue.pricePerHour}/hr</p>
                      <div className={styles.reasons}>
                        {reasons.map((r,j) => <span key={j} className={styles.reason}>✓ {r}</span>)}
                      </div>
                    </div>
                    <Link to={`/venues/${venue._id}`} className={styles.recBtn}>View Venue</Link>
                    <Link to={`/book/${venue._id}`} className={styles.recBtnPrimary}>Book Now</Link>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

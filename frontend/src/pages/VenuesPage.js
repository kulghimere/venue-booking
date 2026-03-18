import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import VenueCard from '../components/VenueCard';
import { useAuth } from '../context/AuthContext';
import styles from './VenuesPage.module.css';

const CATEGORIES = ['wedding','conference','sports','exhibition','outdoor','social','corporate','concert'];

export default function VenuesPage() {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    city: searchParams.get('city') || '',
    category: searchParams.get('category') || '',
    minCapacity: '',
    maxPrice: '',
    page: 1
  });

  const fetchVenues = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
      const res = await api.get(`/venues?${params}`);
      setVenues(res.data.venues || []);
      setTotal(res.data.total || 0);
      setPages(res.data.pages || 1);
    } catch { setVenues([]); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchVenues(); }, [fetchVenues]);

  const updateFilter = (key, value) => setFilters(f => ({ ...f, [key]: value, page: 1 }));

  const clearFilters = () => setFilters({ search: '', city: '', category: '', minCapacity: '', maxPrice: '', page: 1 });

  const { user } = useAuth();
  const hasFilters = filters.search || filters.city || filters.category || filters.minCapacity || filters.maxPrice;

  return (
    <div className={user ? styles.pageWrapperAuth : styles.pageWrapper}>
      <div className={styles.pageHeader}>
        <div className="container">
          <h1>Browse Venues</h1>
          <p>{total} venue{total !== 1 ? 's' : ''} available</p>
        </div>
      </div>

      <div className="container">
        <div className={styles.layout}>
          {/* Filters sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.filterHeader}>
              <h3>Filters</h3>
              {hasFilters && <button onClick={clearFilters} className={styles.clearBtn}>Clear all</button>}
            </div>

            <div className={styles.filterGroup}>
              <label>Search</label>
              <input className={styles.filterInput} placeholder="Venue name, keyword…" value={filters.search} onChange={e => updateFilter('search', e.target.value)} />
            </div>
            <div className={styles.filterGroup}>
              <label>City</label>
              <input className={styles.filterInput} placeholder="e.g. London, Glasgow" value={filters.city} onChange={e => updateFilter('city', e.target.value)} />
            </div>
            <div className={styles.filterGroup}>
              <label>Category</label>
              <select className={styles.filterInput} value={filters.category} onChange={e => updateFilter('category', e.target.value)}>
                <option value="">All Categories</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <div className={styles.filterGroup}>
              <label>Min. Capacity</label>
              <input className={styles.filterInput} type="number" placeholder="e.g. 100" value={filters.minCapacity} onChange={e => updateFilter('minCapacity', e.target.value)} min={1} />
            </div>
            <div className={styles.filterGroup}>
              <label>Max Price / Hour (£)</label>
              <input className={styles.filterInput} type="number" placeholder="e.g. 200" value={filters.maxPrice} onChange={e => updateFilter('maxPrice', e.target.value)} min={0} />
            </div>
          </aside>

          {/* Results */}
          <main className={styles.results}>
            <div className={styles.resultsHeader}>
              <span>{loading ? 'Loading…' : `${venues.length} of ${total} venues`}</span>
            </div>
            {loading ? (
              <div className={styles.grid}>
                {[1,2,3,4,5,6].map(i => <div key={i} className={`skeleton ${styles.skeletonCard}`} />)}
              </div>
            ) : venues.length === 0 ? (
              <div className={styles.empty}>
                <span>🔍</span>
                <h3>No venues found</h3>
                <p>Try adjusting your filters or search terms.</p>
                <button onClick={clearFilters} className={styles.clearBtn2}>Clear filters</button>
              </div>
            ) : (
              <>
                <div className={styles.grid}>
                  {venues.map(v => <VenueCard key={v._id} venue={v} />)}
                </div>
                {pages > 1 && (
                  <div className={styles.pagination}>
                    {Array.from({ length: pages }, (_, i) => (
                      <button key={i} className={`${styles.pageBtn} ${filters.page === i+1 ? styles.activePage : ''}`} onClick={() => setFilters(f => ({ ...f, page: i+1 }))}>
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

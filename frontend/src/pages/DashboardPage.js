import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import styles from './DashboardPage.module.css';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/analytics/stats'),
      api.get('/analytics/trends'),
      api.get('/analytics/categories')
    ]).then(([s, t, c]) => {
      setStats(s.data.stats);
      setTrends(t.data.trends || []);
      setCategories(c.data.stats || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const statCards = user?.role === 'admin' ? [
    { label: 'Total Users', value: stats?.totalUsers, icon: '👥', color: '#4facfe' },
    { label: 'Active Venues', value: stats?.totalVenues, icon: '🏛', color: '#00c896' },
    { label: 'Total Bookings', value: stats?.totalBookings, icon: '📋', color: '#e94560' },
    { label: 'Total Revenue', value: `£${(stats?.totalRevenue || 0).toLocaleString()}`, icon: '💰', color: '#f5a623' },
  ] : user?.role === 'venue_owner' ? [
    { label: 'My Venues', value: stats?.totalVenues, icon: '🏛', color: '#4facfe' },
    { label: 'Total Bookings', value: stats?.totalBookings, icon: '📋', color: '#e94560' },
    { label: 'Pending', value: stats?.pendingBookings, icon: '⏳', color: '#f5a623' },
    { label: 'Revenue', value: `£${(stats?.totalRevenue || 0).toLocaleString()}`, icon: '💰', color: '#00c896' },
  ] : [
    { label: 'Total Bookings', value: stats?.totalBookings, icon: '📋', color: '#4facfe' },
    { label: 'Upcoming', value: stats?.upcomingBookings, icon: '📅', color: '#00c896' },
    { label: 'Completed', value: stats?.completedBookings, icon: '✅', color: '#e94560' },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className="container">
          <div className={styles.headerContent}>
            <div>
              <h1>Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
              <p>Here's an overview of your activity</p>
            </div>
            <div className={styles.headerActions}>
              <Link to="/venues" className={styles.actionBtn}>Browse Venues</Link>
              {(user?.role === 'venue_owner' || user?.role === 'admin') && (
                <Link to="/add-venue" className={styles.actionBtnPrimary}>+ Add Venue</Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className={styles.content}>
          {/* Stat cards */}
          <div className={styles.statsGrid}>
            {loading ? [1,2,3,4].map(i => <div key={i} className={`skeleton ${styles.skeletonStat}`} />) :
              statCards.map((s, i) => (
                <div key={i} className={styles.statCard} style={{ '--accent-color': s.color }}>
                  <div className={styles.statIcon}>{s.icon}</div>
                  <div>
                    <div className={styles.statValue}>{s.value ?? '—'}</div>
                    <div className={styles.statLabel}>{s.label}</div>
                  </div>
                </div>
              ))
            }
          </div>

          <div className={styles.chartsGrid}>
            {/* Booking trends */}
            <div className={styles.chartCard}>
              <h3>Booking Trends (30 days)</h3>
              {trends.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eef0f5" />
                    <XAxis dataKey="_id" tick={{ fontSize: 11 }} tickFormatter={v => v.slice(5)} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v, n) => [v, n === 'count' ? 'Bookings' : 'Revenue £']} labelFormatter={l => `Date: ${l}`} />
                    <Line type="monotone" dataKey="count" stroke="#e94560" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className={styles.noData}>📊 No trend data yet — bookings will appear here</div>
              )}
            </div>

            {/* Category distribution */}
            <div className={styles.chartCard}>
              <h3>Venues by Category</h3>
              {categories.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={categories} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#eef0f5" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="_id" tick={{ fontSize: 11 }} width={90} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#4facfe" radius={[0,4,4,0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className={styles.noData}>📊 No category data yet</div>
              )}
            </div>
          </div>

          {/* Quick links */}
          <div className={styles.quickLinks}>
            <h3>Quick Actions</h3>
            <div className={styles.linksGrid}>
              <Link to="/my-bookings" className={styles.quickLink}><span>📋</span><strong>My Bookings</strong><p>View and manage your bookings</p></Link>
              <Link to="/recommendations" className={styles.quickLink}><span>🤖</span><strong>AI Picks</strong><p>Get personalized venue suggestions</p></Link>
              <Link to="/venues" className={styles.quickLink}><span>🏛</span><strong>Browse Venues</strong><p>Discover available venues</p></Link>
              {(user?.role === 'venue_owner' || user?.role === 'admin') && (
                <Link to="/add-venue" className={styles.quickLink}><span>➕</span><strong>List a Venue</strong><p>Add your venue to the platform</p></Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

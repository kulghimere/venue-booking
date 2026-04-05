import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../utils/api';
import styles from './AdminReportPage.module.css';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.tooltip}>
        <p className={styles.tooltipLabel}>{label}</p>
        <p className={styles.tooltipValue}>£{payload[0].value.toLocaleString()}</p>
        <p className={styles.tooltipSub}>{payload[1]?.value} bookings</p>
      </div>
    );
  }
  return null;
};

export default function AdminReportPage() {
  const [report, setReport] = useState([]);
  const [topVenues, setTopVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/reports/revenue'),
      api.get('/admin/reports/top-venues')
    ]).then(([rRes, tRes]) => {
      setReport(rRes.data.report);
      setTopVenues(tRes.data.venues);
    }).catch(() => {
      toast.error('Failed to load reports');
    }).finally(() => setLoading(false));
  }, []);

  const totalRevenue = report.reduce((s, r) => s + r.revenue, 0);
  const totalBookings = report.reduce((s, r) => s + r.bookings, 0);
  const bestMonth = report.reduce((best, r) => r.revenue > (best?.revenue || 0) ? r : best, null);

  if (loading) return <div className={styles.loading}>Loading reports…</div>;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.headerInner}>
          <div>
            <h1>Revenue Reports</h1>
            <p>Last 12 months performance overview</p>
          </div>
        </div>
      </div>

      <div className={styles.container}>
        {/* KPI Row */}
        <div className={styles.kpiRow}>
          <div className={styles.kpiCard}>
            <span className={styles.kpiIcon}>💰</span>
            <div>
              <div className={styles.kpiValue}>£{totalRevenue.toLocaleString()}</div>
              <div className={styles.kpiLabel}>Total Revenue (12mo)</div>
            </div>
          </div>
          <div className={styles.kpiCard}>
            <span className={styles.kpiIcon}>📅</span>
            <div>
              <div className={styles.kpiValue}>{totalBookings}</div>
              <div className={styles.kpiLabel}>Total Bookings (12mo)</div>
            </div>
          </div>
          <div className={styles.kpiCard}>
            <span className={styles.kpiIcon}>📈</span>
            <div>
              <div className={styles.kpiValue}>£{totalBookings ? Math.round(totalRevenue / totalBookings).toLocaleString() : 0}</div>
              <div className={styles.kpiLabel}>Avg Booking Value</div>
            </div>
          </div>
          <div className={styles.kpiCard}>
            <span className={styles.kpiIcon}>🏆</span>
            <div>
              <div className={styles.kpiValue}>{bestMonth?.month || '—'}</div>
              <div className={styles.kpiLabel}>Best Month</div>
            </div>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className={styles.chartCard}>
          <h2>Monthly Revenue</h2>
          <div className={styles.chartWrap}>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={report} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3148" />
                <XAxis dataKey="month" tick={{ fill: '#8892b0', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#8892b0', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `£${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" fill="#e94560" radius={[4, 4, 0, 0]} />
                <Bar dataKey="bookings" fill="#4facfe" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className={styles.legend}>
            <span className={styles.legendItem}><span className={styles.legendDot} style={{ background: '#e94560' }} /> Revenue (£)</span>
            <span className={styles.legendItem}><span className={styles.legendDot} style={{ background: '#4facfe' }} /> Bookings</span>
          </div>
        </div>

        {/* Top Venues */}
        <div className={styles.topSection}>
          <h2>Top 5 Venues</h2>
          <div className={styles.topGrid}>
            {topVenues.map((v, i) => (
              <div key={v._id} className={styles.topCard}>
                <div className={styles.topRank}>#{i + 1}</div>
                <div className={styles.topImg}>
                  {v.image ? <img src={v.image} alt={v.name} /> : <span>🏛</span>}
                </div>
                <div className={styles.topInfo}>
                  <strong>{v.name}</strong>
                  <span>{v.city} · {v.category}</span>
                </div>
                <div className={styles.topStats}>
                  <div className={styles.topStat}>
                    <span className={styles.topStatVal}>{v.bookingCount}</span>
                    <span className={styles.topStatLabel}>Bookings</span>
                  </div>
                  <div className={styles.topStat}>
                    <span className={styles.topStatVal} style={{ color: '#00c896' }}>£{v.revenue.toLocaleString()}</span>
                    <span className={styles.topStatLabel}>Revenue</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

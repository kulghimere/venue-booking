import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import styles from './Sidebar.module.css';

const navItems = {
  user: [
    { to: '/dashboard',       icon: '🏠', label: 'Dashboard' },
    { to: '/my-bookings',     icon: '📋', label: 'My Bookings' },
    { to: '/my-waitlist',     icon: '⏳', label: 'My Waitlist' },
    { to: '/recommendations', icon: '🤖', label: 'AI Picks' },
    { to: '/venues',          icon: '🏛',  label: 'Browse Venues' },
  ],
  venue_owner: [
    { to: '/my-venues',       icon: '🏛',  label: 'My Venues' },
    { to: '/owner-bookings',  icon: '📋', label: 'Venue Bookings' },
    { to: '/dashboard',       icon: '📊', label: 'Dashboard' },
    { to: '/my-waitlist',     icon: '⏳', label: 'My Waitlist' },
    { to: '/add-venue',       icon: '➕', label: 'List a Venue' },
    { to: '/venues',          icon: '🔍', label: 'Browse Venues' },
  ],
  admin: [
    { to: '/dashboard',       icon: '📊', label: 'Dashboard' },
    { to: '/admin/users',     icon: '👥', label: 'Manage Users' },
    { to: '/admin/bookings',  icon: '📋', label: 'All Bookings' },
    { to: '/admin/venues',    icon: '🏛',  label: 'All Venues' },
    { to: '/admin/reports',   icon: '📈', label: 'Reports' },
    { to: '/my-bookings',     icon: '🗓',  label: 'My Bookings' },
    { to: '/venues',          icon: '🔍', label: 'Browse Venues' },
  ],
};

const ROLE_LABELS = { user: 'Member', venue_owner: 'Venue Owner', admin: 'Administrator' };
const ROLE_COLORS = { user: '#4facfe', venue_owner: '#f5a623', admin: '#e94560' };

export default function Sidebar({ collapsed, onCollapse }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const items = navItems[user.role] || navItems.user;
  const initials = `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase();
  const roleColor = ROLE_COLORS[user.role] || '#4facfe';
  const roleLabel = ROLE_LABELS[user.role] || 'Member';

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      {/* Profile block */}
      <div className={styles.profile}>
        <div className={styles.avatarWrap}>
          <div className={styles.avatar} style={{ background: `linear-gradient(135deg, ${roleColor}, ${roleColor}aa)` }}>
            {initials}
          </div>
          {!collapsed && (
            <div className={styles.profileInfo}>
              <span className={styles.profileName}>{user.firstName} {user.lastName}</span>
              <span className={styles.profileRole} style={{ color: roleColor }}>{roleLabel}</span>
            </div>
          )}
        </div>
        <button
          className={styles.collapseBtn}
          onClick={() => onCollapse(c => !c)}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? '›' : '‹'}
        </button>
      </div>

      {/* Nav links */}
      <nav className={styles.nav}>
        {items.map(item => {
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`${styles.navItem} ${active ? styles.navActive : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
              {active && <span className={styles.activeDot} />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: theme toggle + sign out */}
      <div className={styles.bottom}>
        <button
          className={styles.themeToggle}
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        >
          <span className={styles.navIcon}>{theme === 'dark' ? '☀️' : '🌙'}</span>
          {!collapsed && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>
        <button className={styles.signOut} onClick={handleLogout} title={collapsed ? 'Sign Out' : undefined}>
          <span className={styles.navIcon}>🚪</span>
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}

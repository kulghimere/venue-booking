import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); setAdminOpen(false); }, [location]);

  const handleLogout = () => { logout(); navigate('/'); };

  const isOwnerOrAdmin = user && (user.role === 'venue_owner' || user.role === 'admin');
  const isAdmin = user && user.role === 'admin';

  return (
    <header className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoIcon}>⬡</span>
          <span className={styles.logoText}>VenueBook</span>
        </Link>

        <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`}>
          <Link to={!user ? '/' : user.role === 'venue_owner' ? '/my-venues' : '/dashboard'} className={styles.navLink}>Home</Link>
          <Link to="/venues" className={styles.navLink}>Browse Venues</Link>
          {user && <Link to="/recommendations" className={styles.navLink}>AI Picks</Link>}
          {user && <Link to="/my-bookings" className={styles.navLink}>My Bookings</Link>}
          {user && <Link to="/my-waitlist" className={styles.navLink}>My Waitlist</Link>}
          {isOwnerOrAdmin && <Link to="/my-venues" className={styles.navLink}>My Venues</Link>}
          {isOwnerOrAdmin && <Link to="/add-venue" className={styles.navLink}>List Venue</Link>}
        </nav>

        <div className={styles.actions}>
          <button
            className={styles.themeToggle}
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          {user ? (
            <div className={styles.userMenu}>
              <Link to="/dashboard" className={styles.avatar}>
                <span>{user.firstName?.charAt(0).toUpperCase()}</span>
              </Link>
              <div className={styles.dropdown}>
                <div className={styles.dropdownHeader}>
                  <strong>{user.firstName} {user.lastName}</strong>
                  <span>{user.email}</span>
                </div>
                <Link to="/dashboard" className={styles.dropdownItem}>Dashboard</Link>
                <Link to="/my-bookings" className={styles.dropdownItem}>My Bookings</Link>
                <Link to="/my-waitlist" className={styles.dropdownItem}>My Waitlist</Link>
                {isOwnerOrAdmin && <Link to="/my-venues" className={styles.dropdownItem}>My Venues</Link>}
                {isOwnerOrAdmin && <Link to="/add-venue" className={styles.dropdownItem}>List a Venue</Link>}
                {isAdmin && (
                  <div className={styles.adminSection}>
                    <div className={styles.adminSectionLabel}>Admin</div>
                    <Link to="/admin/users" className={styles.dropdownItem}>Manage Users</Link>
                    <Link to="/admin/bookings" className={styles.dropdownItem}>All Bookings</Link>
                    <Link to="/admin/venues" className={styles.dropdownItem}>All Venues</Link>
                    <Link to="/admin/reports" className={styles.dropdownItem}>Reports</Link>
                  </div>
                )}
                <button onClick={handleLogout} className={styles.dropdownItem} style={{ color: '#e94560' }}>Sign Out</button>
              </div>
            </div>
          ) : (
            <div className={styles.authButtons}>
              <Link to="/login" className={styles.btnGhost}>Sign In</Link>
              <Link to="/register" className={styles.btnPrimary}>Get Started</Link>
            </div>
          )}
          <button className={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            <span className={menuOpen ? styles.barOpen : ''}></span>
            <span className={menuOpen ? styles.barOpen : ''}></span>
            <span className={menuOpen ? styles.barOpen : ''}></span>
          </button>
        </div>
      </div>
    </header>
  );
}

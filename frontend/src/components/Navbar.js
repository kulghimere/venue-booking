import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [location]);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <header className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoIcon}>⬡</span>
          <span className={styles.logoText}>VenueBook</span>
        </Link>

        <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`}>
          <Link to="/venues" className={styles.navLink}>Browse Venues</Link>
          {user && <Link to="/recommendations" className={styles.navLink}>AI Picks</Link>}
          {user && <Link to="/my-bookings" className={styles.navLink}>My Bookings</Link>}
          {user && (user.role === 'venue_owner' || user.role === 'admin') && (
            <Link to="/add-venue" className={styles.navLink}>List Venue</Link>
          )}
        </nav>

        <div className={styles.actions}>
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
                {(user.role === 'venue_owner' || user.role === 'admin') && (
                  <Link to="/add-venue" className={styles.dropdownItem}>List a Venue</Link>
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

import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <div className={styles.logo}><span className={styles.icon}>⬡</span> VenueBook</div>
          <p>An intelligent venue booking platform powered by machine learning recommendations and real-time scheduling.</p>
          <p className={styles.credit}>MSc IT Project — University of the West of Scotland</p>
        </div>
        <div className={styles.links}>
          <div className={styles.col}>
            <h4>Platform</h4>
            <Link to="/venues">Browse Venues</Link>
            <Link to="/recommendations">AI Recommendations</Link>
            <Link to="/register">List Your Venue</Link>
          </div>
          <div className={styles.col}>
            <h4>Account</h4>
            <Link to="/login">Sign In</Link>
            <Link to="/register">Register</Link>
            <Link to="/dashboard">Dashboard</Link>
          </div>
          <div className={styles.col}>
            <h4>Categories</h4>
            <Link to="/venues?category=wedding">Weddings</Link>
            <Link to="/venues?category=conference">Conferences</Link>
            <Link to="/venues?category=sports">Sports</Link>
            <Link to="/venues?category=outdoor">Outdoor</Link>
          </div>
          <div className={styles.col}>
            <h4>Legal</h4>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/privacy">Privacy Policy</Link>
          </div>
        </div>
      </div>
      <div className={styles.bottom}>
        <span>© {new Date().getFullYear()} VenueBook. Built with MERN Stack + ML. Kul Prasad Ghimire — B01821142</span>
        <span className={styles.bottomLinks}>
          <Link to="/terms">Terms</Link>
          <Link to="/privacy">Privacy</Link>
        </span>
      </div>
    </footer>
  );
}

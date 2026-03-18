import React from 'react';
import { Link } from 'react-router-dom';
import styles from './VenueCard.module.css';

const categoryColors = {
  wedding: '#e94560', conference: '#4facfe', sports: '#00c896',
  exhibition: '#f5a623', corporate: '#7c5cbf', social: '#ff6b6b',
  outdoor: '#00c896', concert: '#e94560'
};

const categoryIcons = {
  wedding: '💍', conference: '🎯', sports: '⚡', exhibition: '🎨',
  corporate: '💼', social: '🎉', outdoor: '🌿', concert: '🎵'
};

export default function VenueCard({ venue }) {
  const color = categoryColors[venue.category] || '#4facfe';
  const icon = categoryIcons[venue.category] || '🏛';

  return (
    <Link to={`/venues/${venue._id}`} className={styles.card}>
      <div className={styles.imageWrap}>
        {venue.images?.[0] ? (
          <img src={venue.images[0]} alt={venue.name} className={styles.image} loading="lazy" />
        ) : (
          <div className={styles.imagePlaceholder} style={{ background: `${color}18` }}>
            <span style={{ fontSize: '3rem' }}>{icon}</span>
          </div>
        )}
        <div className={styles.badge} style={{ background: color }}>
          {icon} {venue.category}
        </div>
        <div className={styles.priceTag}>
          £{venue.pricePerHour}<span>/hr</span>
        </div>
      </div>
      <div className={styles.body}>
        <h3 className={styles.name}>{venue.name}</h3>
        <p className={styles.location}>📍 {venue.location.city}, {venue.location.country}</p>
        <p className={styles.desc}>{venue.description?.slice(0, 90)}…</p>
        <div className={styles.footer}>
          <div className={styles.rating}>
            <span className={styles.stars}>{'★'.repeat(Math.round(venue.rating || 0))}</span>
            <span className={styles.ratingNum}>{(venue.rating || 0).toFixed(1)}</span>
            <span className={styles.reviews}>({venue.reviewCount || 0})</span>
          </div>
          <div className={styles.capacity}>👥 {venue.capacity}</div>
        </div>
        <div className={styles.amenities}>
          {(venue.amenities || []).slice(0, 3).map(a => (
            <span key={a} className={styles.amenity}>{a}</span>
          ))}
          {venue.amenities?.length > 3 && <span className={styles.amenity}>+{venue.amenities.length - 3}</span>}
        </div>
      </div>
    </Link>
  );
}

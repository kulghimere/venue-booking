import React, { useEffect, useRef, useState } from 'react';
import styles from './MapPicker.module.css';

// Leaflet CSS is loaded once via a <link> injected into <head>
let leafletCssLoaded = false;
function ensureLeafletCss() {
  if (leafletCssLoaded) return;
  leafletCssLoaded = true;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  document.head.appendChild(link);
}

export default function MapPicker({ onLocationSelect }) {
  const mapRef      = useRef(null);   // DOM node
  const leafletMap  = useRef(null);   // L.Map instance
  const markerRef   = useRef(null);   // L.Marker instance
  const [status, setStatus] = useState('Click anywhere on the map to pin your venue location');
  const [picked, setPicked] = useState(null); // { lat, lng, address, city, country }

  useEffect(() => {
    ensureLeafletCss();

    // Dynamically import Leaflet so it only loads client-side
    import('leaflet').then(({ default: L }) => {
      if (leafletMap.current) return; // already initialised

      // Fix default marker icon paths broken by webpack
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current, { zoomControl: true }).setView([51.505, -0.09], 6);
      leafletMap.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      map.on('click', async (e) => {
        const { lat, lng } = e.latlng;

        // Place / move marker
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          markerRef.current = L.marker([lat, lng]).addTo(map);
        }

        setStatus('Fetching address…');

        try {
          const res  = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await res.json();
          const addr = data.address || {};

          const road    = addr.road || addr.pedestrian || addr.footway || '';
          const houseNo = addr.house_number || '';
          const street  = [houseNo, road].filter(Boolean).join(' ');
          const city    = addr.city || addr.town || addr.village || addr.county || '';
          const country = addr.country || '';

          const result = { lat, lng, address: street, city, country };
          setPicked(result);
          setStatus(`Pinned: ${data.display_name}`);
          onLocationSelect(result);

          markerRef.current
            .bindPopup(`<strong>${street || 'Selected location'}</strong><br/>${city}${country ? ', ' + country : ''}`)
            .openPopup();
        } catch {
          const result = { lat, lng, address: '', city: '', country: '' };
          setPicked(result);
          setStatus(`Pinned at ${lat.toFixed(5)}, ${lng.toFixed(5)} — could not fetch address`);
          onLocationSelect(result);
        }
      });
    });

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
        markerRef.current  = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleGeolocate = () => {
    if (!navigator.geolocation) return;
    setStatus('Locating…');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        if (leafletMap.current) {
          leafletMap.current.setView([lat, lng], 15);
          leafletMap.current.fire('click', { latlng: { lat, lng } });
        }
      },
      () => setStatus('Could not get your location'),
      { timeout: 8000 }
    );
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
        <span className={styles.statusText}>{status}</span>
        <button type="button" className={styles.geoBtn} onClick={handleGeolocate} title="Use my location">
          My location
        </button>
      </div>
      <div ref={mapRef} className={styles.map} />
      {picked && (
        <div className={styles.coords}>
          Lat {picked.lat.toFixed(6)}, Lng {picked.lng.toFixed(6)}
        </div>
      )}
    </div>
  );
}

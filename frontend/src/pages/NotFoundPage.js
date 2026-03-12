import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'2rem', textAlign:'center', paddingTop:'88px', background:'var(--surface-2)' }}>
      <div style={{ fontSize:'6rem', marginBottom:'1.5rem' }}>🏛</div>
      <h1 style={{ fontSize:'3rem', fontFamily:'var(--font-display)', marginBottom:'0.75rem', color:'var(--text-primary)' }}>404</h1>
      <h2 style={{ fontSize:'1.25rem', marginBottom:'0.75rem', color:'var(--text-secondary)' }}>Page not found</h2>
      <p style={{ color:'var(--text-muted)', marginBottom:'2rem', maxWidth:'360px' }}>The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" style={{ background:'var(--accent)', color:'white', padding:'0.75rem 2rem', borderRadius:'12px', fontWeight:'700', display:'inline-block' }}>← Back to Home</Link>
    </div>
  );
}

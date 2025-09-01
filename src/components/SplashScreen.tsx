import React, { useEffect, useState } from 'react';
import App from '../App';

export function SplashScreen() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)',
      color: '#222',
      fontFamily: 'inherit',
      fontSize: '2rem',
      fontWeight: 600
    }}>
  <img src="/logo.png" alt="Logo" style={{ width: 96, height: 96, marginBottom: 24, borderRadius: 48, boxShadow: '0 2px 12px #0001', objectFit: 'cover' }} />
      <span>Slit Master</span>
      <span style={{ fontSize: '1rem', fontWeight: 400, marginTop: 8, color: '#64748b' }}>Optimizing Paper, Maximizing Value</span>
    </div>
  );
}

export function RootWithSplash() {
  const [showSplash, setShowSplash] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1200);
    return () => clearTimeout(timer);
  }, []);
  return showSplash ? <SplashScreen /> : <App />;
}
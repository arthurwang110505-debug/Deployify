import React from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

export default function NotFoundPage() {
  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'var(--bg)',
      textAlign: 'center',
      padding: 24
    }}>
      <Helmet>
        <title>404 - Page Not Found | Deployify</title>
      </Helmet>

      <div style={{ position: 'relative', marginBottom: 48 }}>
        <div style={{ 
          fontSize: '180px', 
          fontWeight: 900, 
          color: 'var(--bg2)',
          lineHeight: 1,
          letterSpacing: '-0.05em'
        }}>
          404
        </div>
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          width: '100%'
        }}>
          <h1 className="text-gradient" style={{ fontSize: 48, fontWeight: 800 }}>Lost in the Edge.</h1>
        </div>
      </div>

      <p style={{ color: 'var(--text2)', fontSize: 18, maxWidth: 500, lineHeight: 1.6, marginBottom: 40 }}>
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>

      <div style={{ display: 'flex', gap: 16 }}>
        <Link to="/" className="btn-primary" style={{ padding: '14px 32px' }}>Go Home</Link>
        <button onClick={() => window.history.back()} className="btn-secondary" style={{ padding: '14px 32px' }}>Go Back</button>
      </div>

      <div style={{ marginTop: 80, color: 'var(--text3)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }} />
        All systems operational
      </div>
    </div>
  )
}

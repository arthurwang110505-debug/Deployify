import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function PublicLayout({ children }) {
  const { user } = useAuth()
  const { pathname, hash } = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.replace('#', ''))
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      }
    } else {
      window.scrollTo(0, 0)
    }
  }, [pathname, hash])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      {/* Top Loading Bar Simulation */}
      <div style={{ 
        position: 'fixed', top: 0, left: 0, right: 0, height: 2, 
        background: 'var(--accent)', zIndex: 9999, 
        transform: 'translateX(-100%)',
        animation: pathname ? 'loadingBar 1s ease-in-out' : 'none'
      }} />

      {/* Navbar */}
      <nav style={{
        padding: '20px 0',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'var(--bg3-dim)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}>
        <div className="section-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <img src="/logo.png" alt="" style={{ height: 32 }} />
            <span style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.05em', color: 'var(--text)' }}>Deployify</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hide-mobile" style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 24 }}>
              <Link to="/#features" style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 500 }}>Features</Link>
              <Link to="/#pricing" style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 500 }}>Pricing</Link>
              <Link to="/blog" style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 500 }}>Blog</Link>
            </div>
            <div style={{ width: 1, height: 16, background: 'var(--border)' }} />
            {user ? (
              <Link to="/dashboard" className="btn-primary" style={{ padding: '8px 18px', fontSize: 13 }}>Dashboard</Link>
            ) : (
              <>
                <Link to="/auth" style={{ fontSize: 13, color: 'var(--text)', fontWeight: 600 }}>Login</Link>
                <Link to="/auth" className="btn-primary" style={{ padding: '8px 18px', fontSize: 13 }}>Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="show-mobile"
            aria-label="Toggle menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', padding: 10 }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {mobileMenuOpen ? <line x1="18" y1="6" x2="6" y2="18" /> : <line x1="3" y1="12" x2="21" y2="12" />}
              {mobileMenuOpen ? <line x1="6" y1="6" x2="18" y2="18" /> : <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></>}
            </svg>
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="fade-in" style={{ 
            position: 'fixed', top: 71, left: 0, right: 0, bottom: 0, 
            background: 'var(--bg)', zIndex: 99, padding: 24, display: 'flex', flexDirection: 'column', gap: 32 
          }}>
            <Link to="/#features" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: 18, color: 'var(--text)', fontWeight: 600 }}>Features</Link>
            <Link to="/#pricing" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: 18, color: 'var(--text)', fontWeight: 600 }}>Pricing</Link>
            <Link to="/blog" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: 18, color: 'var(--text)', fontWeight: 600 }}>Blog</Link>
            <div style={{ height: 1, background: 'var(--border)' }} />
            {user ? (
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="btn-primary" style={{ justifyContent: 'center', padding: 16 }}>Dashboard</Link>
            ) : (
              <>
                <Link to="/auth" onClick={() => setMobileMenuOpen(false)} className="btn-secondary" style={{ justifyContent: 'center', padding: 16 }}>Login</Link>
                <Link to="/auth" onClick={() => setMobileMenuOpen(false)} className="btn-primary" style={{ justifyContent: 'center', padding: 16 }}>Get Started</Link>
              </>
            )}
          </div>
        )}
      </nav>

      <main style={{ flex: 1 }}>
        {children}
      </main>

      {/* Professional Footer */}
      <footer style={{ padding: '80px 0 40px', background: 'var(--bg2)', borderTop: '1px solid var(--border)' }}>
        <div className="section-container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 64, marginBottom: 64 }}>
            <div>
              <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, textDecoration: 'none' }}>
                <img src="/logo.png" alt="" style={{ height: 24 }} />
                <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.03em' }}>Deployify</span>
              </Link>
              <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.6, maxWidth: 280 }}>
                High-performance hosting platform for the modern developer. Ship global websites in seconds.
              </p>
            </div>
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 24, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Product</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Link to="/#features" style={{ fontSize: 14, color: 'var(--text2)' }}>Features</Link>
                <Link to="/#pricing" style={{ fontSize: 14, color: 'var(--text2)' }}>Pricing</Link>
                <Link to="/docs" style={{ fontSize: 14, color: 'var(--text2)' }}>Documentation</Link>
                <Link to="/blog" style={{ fontSize: 14, color: 'var(--text2)' }}>Changelog</Link>
              </div>
            </div>
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 24, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Company</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Link to="/about" style={{ fontSize: 14, color: 'var(--text2)' }}>About Us</Link>
                <Link to="/contact" style={{ fontSize: 14, color: 'var(--text2)' }}>Contact</Link>
                <Link to="/privacy" style={{ fontSize: 14, color: 'var(--text2)' }}>Privacy Policy</Link>
                <Link to="/terms" style={{ fontSize: 14, color: 'var(--text2)' }}>Terms of Service</Link>
              </div>
            </div>
            <div className="hide-mobile">
              <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 24, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Connect</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <a href="https://twitter.com" target="_blank" rel="noreferrer" style={{ fontSize: 14, color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 8 }}><TwitterIcon /> Twitter / X</a>
                <a href="https://github.com" target="_blank" rel="noreferrer" style={{ fontSize: 14, color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 8 }}><GithubIcon /> GitHub</a>
                <a href="https://discord.com" target="_blank" rel="noreferrer" style={{ fontSize: 14, color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 8 }}><DiscordIcon /> Discord</a>
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
            <p style={{ fontSize: 13, color: 'var(--text3)' }}>© 2026 Deployify Technologies Inc. All rights reserved.</p>
            <div style={{ display: 'flex', gap: 24 }}>
              <span style={{ fontSize: 13, color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, background: 'var(--accent)', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
                All systems operational
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function TwitterIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
}

function GithubIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
}

function DiscordIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="12" r="1"></circle><circle cx="15" cy="12" r="1"></circle><path d="M15 17.5c-2.5 1.5-3.5 1.5-6 0"></path><path d="M9 2c-1.5 0-3 1.5-3 3v13c0 1.5 1.5 3 3 3h6c1.5 0 3-1.5 3-3V5c0-1.5-1.5-3-3-3H9z"></path></svg>
}

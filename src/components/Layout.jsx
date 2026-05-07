import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { signOut } from '../lib/supabase'

const NAV = [
  { to: '/dashboard', label: 'Sites', icon: GridIcon },
  { to: '/deploys', label: 'Deploys', icon: UploadIcon },
  { to: '/domains', label: 'Domains', icon: GlobeIcon },
  { to: '/analytics', label: 'Analytics', icon: ChartIcon },
  { to: '/teams', label: 'Teams', icon: UsersIcon },
  { to: '/settings', label: 'Settings', icon: GearIcon },
  { to: '/admin', label: 'Admin', icon: ShieldIcon, adminOnly: true },
]

export default function Layout() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/auth')
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', flexDirection: 'column' }}>
      
      {/* Mobile Header */}
      <header className="show-mobile" style={{ 
        height: 64, background: 'var(--bg2)', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px',
        flexShrink: 0, zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/logo.png" alt="" style={{ height: 24 }} />
          <span style={{ fontSize: 16, fontWeight: 800 }}>Deployify</span>
        </div>
        <button 
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer' }}
        >
          {mobileNavOpen ? <XIcon /> : <MenuIcon />}
        </button>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        {/* Sidebar / Drawer */}
        <aside style={{
          width: 260, flexShrink: 0,
          background: 'var(--bg2)',
          borderRight: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column',
          padding: '0',
          position: 'relative',
          zIndex: 90,
          transition: 'transform 0.3s ease',
          transform: window.innerWidth <= 768 ? (mobileNavOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none',
          ...(window.innerWidth <= 768 ? {
            position: 'absolute', top: 0, bottom: 0, left: 0,
            boxShadow: mobileNavOpen ? '20px 0 50px rgba(0,0,0,0.5)' : 'none'
          } : {})
        }}>
          <div className="hide-mobile" style={{ padding: '32px 24px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/logo.png" alt="" style={{ height: 24 }} />
            <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.03em' }}>Deployify</span>
          </div>

          {/* Nav */}
          <nav style={{ padding: '20px 14px', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {NAV.filter(item => !item.adminOnly || user?.email === 'arthur0116.wang@gmail.com').map(({ to, label, icon: Icon, disabled }) => (
              <NavLink 
                key={to} 
                to={disabled ? '#' : to} 
                onClick={(e) => {
                  if (disabled) e.preventDefault()
                  else setMobileNavOpen(false)
                }}
                style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px', borderRadius: 'var(--radius)',
                  fontSize: 13, fontWeight: 500,
                  color: isActive && !disabled ? 'var(--accent)' : 'var(--text2)',
                  background: isActive && !disabled ? 'var(--accent-dim2)' : 'transparent',
                  transition: 'all 0.15s',
                  border: 'none',
                  textDecoration: 'none',
                  opacity: disabled ? 0.5 : 1,
                  cursor: disabled ? 'not-allowed' : 'pointer'
                })}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Icon size={16} />
                  {label}
                </div>
                {disabled && <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', background: 'var(--bg3)', borderRadius: 10, color: 'var(--text3)' }}>SOON</span>}
              </NavLink>
            ))}
          </nav>

          {/* User Section in Sidebar */}
          <div style={{ padding: '20px', borderTop: '1px solid var(--border)', background: 'var(--bg3-dim)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 'var(--radius)',
                background: 'linear-gradient(135deg, var(--accent), #2ec4b6)', 
                border: '1px solid var(--border2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 700, color: '#0a0b0d',
              }}>
                {user?.email?.[0]?.toUpperCase() || '?'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.email?.split('@')[0]}
                </div>
                <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600, marginTop: 1 }}>Free Professional</div>
              </div>
            </div>
            <button onClick={handleSignOut} className="btn-secondary" style={{ width: '100%', fontSize: 12, justifyContent: 'center', padding: '10px' }}>
              Sign out
            </button>
          </div>
        </aside>

        {/* Mobile Backdrop */}
        {mobileNavOpen && (
          <div 
            onClick={() => setMobileNavOpen(false)}
            style={{ 
              position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 80,
              backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
            }} 
          />
        )}

        {/* Main Content Area */}
        <main style={{ flex: 1, overflow: 'auto', background: 'var(--bg)', paddingBottom: 60 }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function MenuIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
}
function XIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
}

function GridIcon({ size = 16 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
}
function UploadIcon({ size = 16 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
}
function GlobeIcon({ size = 16 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
}
function ChartIcon({ size = 16 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
}
function UsersIcon({ size = 16 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
}
function GearIcon({ size = 16 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 Denis 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
}
function ShieldIcon({ size = 16 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
}

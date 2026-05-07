import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useToast } from '../context/ToastContext'

export default function DomainsPage() {
  const { addToast } = useToast()
  const [domains, setDomains] = useState([
    { id: 1, name: 'my-project.deployify.app', type: 'default', status: 'active', ssl: true },
    { id: 2, name: 'custom-client.com', type: 'custom', status: 'pending', ssl: false }
  ])
  const [connectDomain, setConnectDomain] = useState('')
  const [searchDomain, setSearchDomain] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResult, setSearchResult] = useState(null)
  const [verifyingId, setVerifyingId] = useState(null)
  const [selectedDomain, setSelectedDomain] = useState(null)

  const handleConnect = (e) => {
    e.preventDefault()
    if (!connectDomain) return
    const newDomain = {
      id: Date.now(),
      name: connectDomain,
      type: 'custom',
      status: 'pending',
      ssl: false
    }
    setDomains(prev => [...prev, newDomain])
    setConnectDomain('')
    setSelectedDomain(newDomain)
    addToast(`Domain ${connectDomain} added. Please configure DNS.`, 'success')
  }

  const verifyDNS = (id) => {
    setVerifyingId(id)
    setTimeout(() => {
      setDomains(prev => prev.map(d => 
        d.id === id ? { ...d, status: 'active', ssl: true } : d
      ))
      setVerifyingId(null)
      addToast('DNS Verified! Your domain is now active.', 'success')
    }, 2000)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (!searchDomain) return
    setIsSearching(true)
    setTimeout(() => {
      const isAvailable = Math.random() > 0.3
      setSearchResult({
        name: searchDomain,
        available: isAvailable,
        price: isAvailable ? '$14.99/yr' : null
      })
      setIsSearching(false)
    }, 800)
  }

  const handleBuy = () => {
    if (!searchResult?.available) return
    const newDomain = {
      id: Date.now(),
      name: searchResult.name,
      type: 'custom',
      status: 'active',
      ssl: true
    }
    setDomains(prev => [...prev, newDomain])
    addToast(`Successfully purchased ${searchResult.name}!`, 'success')
    setSearchResult(null)
    setSearchDomain('')
  }

  const removeDomain = (id) => {
    setDomains(prev => prev.filter(d => d.id !== id))
    addToast('Domain removed.', 'info')
  }

  const isMobile = window.innerWidth <= 768

  return (
    <div className="fade-in" style={{ padding: isMobile ? '24px 20px' : '40px 48px', maxWidth: 1200, margin: '0 auto' }}>
      <Helmet>
        <title>Infrastructure | Domains</title>
      </Helmet>

      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8, letterSpacing: '-0.03em' }}>Domains & DNS</h1>
        <p style={{ color: 'var(--text2)', fontSize: 14 }}>Global edge networking and custom domain management.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.8fr 1.2fr', gap: 32, alignItems: 'start' }}>
        
        {/* Left Column: Domain List & DNS Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          <div className="glass" style={{ borderRadius: 24, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase' }}>Active Domains</h3>
              <span style={{ fontSize: 11, background: 'var(--bg3)', padding: '2px 8px', borderRadius: 12 }}>{domains.length} Total</span>
            </div>
            
            {domains.map((domain, index) => (
              <div 
                key={domain.id} 
                onClick={() => setSelectedDomain(domain)}
                style={{ 
                  padding: '20px 24px', 
                  cursor: 'pointer',
                  borderBottom: index < domains.length - 1 ? '1px solid var(--border)' : 'none',
                  background: selectedDomain?.id === domain.id ? 'var(--accent-dim2)' : 'transparent',
                  transition: 'background 0.2s ease',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{domain.name}</span>
                    {domain.ssl && (
                      <span title="SSL Active" style={{ fontSize: 12, color: 'var(--accent)' }}>🔒</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {domain.status === 'active' ? (
                      <span style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 700 }}>● Active</span>
                    ) : (
                      <span style={{ fontSize: 10, color: 'var(--yellow)', fontWeight: 700 }}>● Pending Verification</span>
                    )}
                    <span style={{ fontSize: 10, color: 'var(--text3)' }}>•</span>
                    <span style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase' }}>{domain.type}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  {verifyingId === domain.id ? (
                    <div className="spinner" style={{ width: 12, height: 12 }} />
                  ) : (
                    <div style={{ fontSize: 12, color: 'var(--text3)' }}>→</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* DNS Instructions Panel (Shown when a domain is selected) */}
          {selectedDomain && (
            <div className="glass fade-up" style={{ padding: 32, borderRadius: 24, border: '1px solid var(--accent-dim)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>DNS Configuration</h3>
                <button onClick={() => setSelectedDomain(null)} style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: 20 }}>×</button>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 24, lineHeight: 1.6 }}>
                To point <strong>{selectedDomain.name}</strong> to our global network, add the following record to your DNS provider (Cloudflare, GoDaddy, etc.)
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
                <div style={{ background: 'var(--bg)', padding: 16, borderRadius: 12, border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase' }}>Type</span>
                    <span style={{ fontSize: 12, color: 'var(--text)', fontWeight: 600 }}>CNAME</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase' }}>Name (Host)</span>
                    <span style={{ fontSize: 12, color: 'var(--text)', fontWeight: 600, fontFamily: 'DM Mono' }}>@</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase' }}>Value</span>
                    <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 700, fontFamily: 'DM Mono' }}>cname.deployify.app</span>
                  </div>
                </div>
              </div>

              {selectedDomain.status === 'pending' ? (
                <button 
                  onClick={() => verifyDNS(selectedDomain.id)}
                  className="btn-primary" 
                  style={{ width: '100%', justifyContent: 'center' }}
                  disabled={verifyingId}
                >
                  {verifyingId ? 'Scanning Global DNS...' : 'Refresh & Verify Status'}
                </button>
              ) : (
                <div style={{ display: 'flex', gap: 12 }}>
                  <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Configure SSL</button>
                  <button onClick={() => removeDomain(selectedDomain.id)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center', color: 'var(--red)' }}>Remove Domain</button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Connect Panel */}
          <div className="glass" style={{ padding: 28, borderRadius: 24 }}>
            <div style={{ fontSize: 32, marginBottom: 16 }}>🔗</div>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Connect Domain</h3>
            <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 24, lineHeight: 1.5 }}>
              Assign a domain you already own to your personal edge network.
            </p>
            <form onSubmit={handleConnect} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input 
                type="text" 
                value={connectDomain}
                onChange={(e) => setConnectDomain(e.target.value)}
                placeholder="e.g. my-app.com" 
                style={{ padding: '12px 16px', borderRadius: 12, background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 13 }}
              />
              <button type="submit" className="btn-primary" style={{ justifyContent: 'center' }} disabled={!connectDomain}>
                Add Domain
              </button>
            </form>
          </div>

          {/* Search/Buy Panel */}
          <div className="glass" style={{ padding: 28, borderRadius: 24 }}>
            <div style={{ fontSize: 32, marginBottom: 16 }}>🌍</div>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>New Registration</h3>
            <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 24, lineHeight: 1.5 }}>
              Don't have a domain? Register one directly on Deployify.
            </p>
            <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
              <input 
                type="text" 
                value={searchDomain}
                onChange={(e) => setSearchDomain(e.target.value)}
                placeholder="Search name..." 
                style={{ padding: '12px 16px', borderRadius: 12, background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 13 }}
              />
              <button type="submit" className="btn-secondary" style={{ justifyContent: 'center' }} disabled={!searchDomain || isSearching}>
                {isSearching ? 'Searching...' : 'Search Available'}
              </button>
            </form>

            {searchResult && (
              <div className="fade-up" style={{ padding: 16, background: 'var(--bg3)', borderRadius: 16, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{searchResult.name}</div>
                    <div style={{ fontSize: 11, color: searchResult.available ? 'var(--accent)' : 'var(--red)', fontWeight: 600 }}>
                      {searchResult.available ? 'AVAILABLE' : 'TAKEN'}
                    </div>
                  </div>
                  {searchResult.available && <span style={{ fontWeight: 800 }}>{searchResult.price}</span>}
                </div>
                {searchResult.available && (
                  <button onClick={handleBuy} className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 12, padding: '8px' }}>Register Now</button>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

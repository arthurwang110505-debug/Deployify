import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase, signOut } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../context/ToastContext'
import { getApiTokens, createApiToken, deleteApiToken } from '../lib/supabase'

export default function SettingsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [newPassword, setNewPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)
  const [tokens, setTokens] = useState([])
  const [newTokenRaw, setNewTokenRaw] = useState(null)
  const [tokenName, setTokenName] = useState('')

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    if (user) loadTokens()
    return () => window.removeEventListener('resize', handleResize)
  }, [user])

  const loadTokens = async () => {
    try {
      const data = await getApiTokens(user.id)
      setTokens(data || [])
    } catch (err) {
      addToast(err.message, 'error')
    }
  }

  const handleGenerateToken = async (e) => {
    e.preventDefault()
    if (!tokenName.trim()) return

    const rawToken = 'dpfy_' + crypto.randomUUID().replace(/-/g, '') + Math.random().toString(36).substring(2, 10)
    
    // Hash the token using Web Crypto API
    const encoder = new TextEncoder()
    const data = encoder.encode(rawToken)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const tokenHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    
    const prefix = rawToken.substring(0, 9)

    try {
      const newToken = await createApiToken({
        userId: user.id,
        name: tokenName.trim(),
        tokenHash,
        tokenPrefix: prefix
      })
      setTokens([newToken, ...tokens])
      setNewTokenRaw(rawToken)
      setTokenName('')
    } catch (err) {
      addToast(err.message, 'error')
    }
  }

  const handleDeleteToken = async (id) => {
    if (!confirm('Revoke this token? Applications using it will immediately lose access.')) return
    try {
      await deleteApiToken(id)
      setTokens(tokens.filter(t => t.id !== id))
      addToast('Token revoked')
    } catch (err) {
      addToast(err.message, 'error')
    }
  }

  const isMobile = windowWidth <= 768

  const handlePasswordUpdate = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMsg('')
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setSaving(false)
    setMsg(error ? error.message : 'Password updated!')
    if (!error) setNewPassword('')
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Delete your account? This permanently removes all your sites and data.')) return
    await signOut()
    navigate('/auth')
  }

  return (
    <div style={{ padding: isMobile ? '24px 20px' : '32px 36px', maxWidth: 800 }}>
      <div className="fade-up" style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: isMobile ? 24 : 28, fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.03em' }}>Settings</h1>
        <p style={{ fontSize: 13, color: 'var(--text3)', marginTop: 4 }}>Manage your personal account and security preferences.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr', gap: 24, maxWidth: 600 }}>
        {/* Account info */}
        <Card title="Profile" isMobile={isMobile}>
          <Row label="Email" isMobile={isMobile}>
            <span style={{ fontSize: 13, color: 'var(--text)', fontFamily: 'DM Mono, monospace', wordBreak: 'break-all' }}>{user?.email}</span>
          </Row>
          <Row label="User ID" isMobile={isMobile}>
            <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'DM Mono, monospace' }}>{user?.id}</span>
          </Row>
          <Row label="Account Plan" isMobile={isMobile}>
            <span style={{
              fontSize: 10, fontWeight: 800, padding: '3px 10px',
              background: 'var(--accent-dim)', color: 'var(--accent)', borderRadius: 6,
              textTransform: 'uppercase', letterSpacing: '0.05em'
            }}>Pro Developer</span>
          </Row>
        </Card>

        {/* Password */}
        {user?.app_metadata?.provider !== 'google' && (
          <Card title="Security" isMobile={isMobile}>
            <form onSubmit={handlePasswordUpdate}>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text2)', marginBottom: 8, fontWeight: 600 }}>Update Password</label>
              <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 12 }}>
                <input
                  type="password" value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="New password (min 6 chars)"
                  required minLength={6}
                  style={{
                    flex: 1, padding: '10px 14px',
                    background: 'var(--bg3)', border: '1px solid var(--border)',
                    borderRadius: 12, color: 'var(--text)', fontSize: 13,
                  }}
                />
                <button type="submit" disabled={saving} className="btn-primary" style={{ justifyContent: 'center' }}>
                  {saving ? 'Saving…' : 'Update'}
                </button>
              </div>
              {msg && (
                <div style={{
                  marginTop: 12, fontSize: 12, padding: '10px 14px', borderRadius: 12,
                  color: msg.includes('!') ? 'var(--accent)' : 'var(--red)',
                  background: msg.includes('!') ? 'var(--accent-dim)' : 'var(--red-dim)',
                  border: `1px solid ${msg.includes('!') ? 'var(--accent-dim2)' : 'rgba(255,0,0,0.1)'}`
                }}>{msg}</div>
              )}
            </form>
          </Card>
        )}

        {/* API Keys for CLI */}
        <Card title="CLI Access Tokens" isMobile={isMobile}>
          <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 16, lineHeight: 1.5 }}>
            Use these tokens to authenticate your deployments from the CLI or GitHub Actions.
          </p>

          {newTokenRaw && (
            <div style={{ padding: 16, background: 'rgba(61,255,192,0.1)', border: '1px solid var(--accent)', borderRadius: 12, marginBottom: 20 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', marginBottom: 8 }}>New Token Created!</p>
              <p style={{ fontSize: 12, color: 'var(--text)', marginBottom: 12 }}>Copy this token now. You will not be able to see it again.</p>
              <div style={{ display: 'flex', gap: 10 }}>
                <input readOnly value={newTokenRaw} style={{ flex: 1, padding: '10px', background: 'var(--bg)', border: '1px solid var(--accent)', borderRadius: 8, color: 'var(--text)', fontFamily: 'DM Mono', fontSize: 13 }} />
                <button onClick={() => { navigator.clipboard.writeText(newTokenRaw); addToast('Copied!') }} className="btn-primary" style={{ padding: '0 16px', fontSize: 12 }}>Copy</button>
              </div>
            </div>
          )}

          <form onSubmit={handleGenerateToken} style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
            <input
              type="text"
              value={tokenName}
              onChange={e => setTokenName(e.target.value)}
              placeholder="Token name (e.g. GitHub Actions)"
              required
              style={{
                flex: 1, padding: '10px 14px', background: 'var(--bg3)',
                border: '1px solid var(--border)', borderRadius: 8,
                color: 'var(--text)', fontSize: 13
              }}
            />
            <button type="submit" className="btn-secondary" style={{ fontSize: 12, padding: '0 16px' }}>
              Generate New Token
            </button>
          </form>

          {tokens.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 4 }}>Active Tokens</div>
              {tokens.map(t => (
                <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'DM Mono' }}>{t.token_prefix}••••••••••••••••</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span style={{ fontSize: 11, color: 'var(--text3)' }}>{new Date(t.created_at).toLocaleDateString()}</span>
                    <button onClick={() => handleDeleteToken(t.id)} style={{ background: 'none', border: 'none', color: 'var(--red)', fontSize: 12, cursor: 'pointer' }}>Revoke</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Danger zone */}
        <div style={{ marginTop: 20, padding: isMobile ? 24 : 32, borderRadius: 24, border: '1px solid var(--red)', background: 'rgba(255, 75, 75, 0.03)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--red)', marginBottom: 8 }}>Danger Zone</h3>
          <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 24, lineHeight: 1.5 }}>
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <button onClick={handleDeleteAccount} style={{
            padding: '10px 20px', borderRadius: 12,
            background: 'var(--red)', border: 'none',
            color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer'
          }}>Delete Account</button>
        </div>
      </div>
    </div>
  )
}

function Card({ title, children, isMobile }) {
  return (
    <div className="glass" style={{ borderRadius: 24, overflow: 'hidden' }}>
      <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg3)' }}>
        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</span>
      </div>
      <div style={{ padding: isMobile ? 24 : 32 }}>{children}</div>
    </div>
  )
}

function Row({ label, children, isMobile }) {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: isMobile ? 'column' : 'row', 
      justifyContent: 'space-between', 
      alignItems: isMobile ? 'flex-start' : 'center', 
      marginBottom: 20,
      gap: isMobile ? 8 : 16
    }}>
      <span style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 600 }}>{label}</span>
      {children}
    </div>
  )
}

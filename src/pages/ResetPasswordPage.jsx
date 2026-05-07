import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  const handleUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setSuccess('Password updated successfully!')
      setTimeout(() => navigate('/auth'), 2000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}>
      <div className="fade-up" style={{ width: '100%', maxWidth: 400 }}>
        <div style={{
          background: 'var(--bg2)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: 28,
        }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Set New Password</h2>
          <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 24 }}>Please enter your new password below.</p>
          
          <form onSubmit={handleUpdate}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text2)', marginBottom: 6, fontWeight: 500 }}>
                New Password
              </label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="••••••••" minLength={6}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 'var(--radius)',
                  background: 'var(--bg3)', border: '1px solid var(--border)',
                  color: 'var(--text)', fontSize: 13,
                }}
              />
            </div>

            {error && <div style={{ color: 'var(--red)', fontSize: 12, marginBottom: 14 }}>{error}</div>}
            {success && <div style={{ color: 'var(--accent)', fontSize: 12, marginBottom: 14 }}>{success}</div>}

            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%' }}>
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signInWithGoogle, signInWithGithub, signInWithEmail, signUpWithEmail, resetPasswordForEmail } from '../lib/supabase'

export default function AuthPage() {
  const [mode, setMode] = useState('signin') // signin | signup
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showForgot, setShowForgot] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const navigate = useNavigate()

  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email)
  }

  const getPasswordStrength = (pw) => {
    if (pw.length === 0) return null
    if (pw.length < 6) return 'Weak'
    if (pw.length >= 10 && /[A-Z]/.test(pw) && /[0-9]/.test(pw)) return 'Strong'
    return 'Medium'
  }

  const passwordStrength = getPasswordStrength(password)

  const handleEmail = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      if (mode === 'signin') {
        const { error } = await signInWithEmail(email, password)
        if (error) throw error
        navigate('/dashboard')
      } else {
        const { error } = await signUpWithEmail(email, password)
        if (error) throw error
        setSuccess('Check your email to confirm your account.')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setError('')
    const { error } = await signInWithGoogle()
    if (error) setError(error.message)
  }

  const handleGithub = async () => {
    setError('')
    const { error } = await signInWithGithub()
    if (error) setError(error.message)
  }

  const handleForgot = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      // 1. Trigger Supabase reset flow
      const { error } = await resetPasswordForEmail(resetEmail)
      if (error) throw error

      // 2. Custom notification via Resend for extra polish
      // Note: In a real production environment, you'd usually trigger this from a Supabase Edge Function
      // to keep your Resend API key secure.
      import('../lib/email').then(({ sendPasswordResetEmail }) => {
        sendPasswordResetEmail(resetEmail, `${window.location.origin}/reset-password`)
      })

      setSuccess('A reset link has been sent to your email via Resend.')
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
      {/* Background grid */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
        maskImage: 'radial-gradient(ellipse 60% 60% at 50% 50%, black 40%, transparent 100%)',
      }} />

      <div className="fade-up" style={{
        width: '100%', maxWidth: 400, position: 'relative',
      }}>
        {/* Back Button */}
        <Link to="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--text3)',
          textDecoration: 'none', fontSize: 13, marginBottom: 24, transition: 'color 0.2s'
        }} onMouseOver={e => e.target.style.color = 'var(--text2)'} onMouseOut={e => e.target.style.color = 'var(--text3)'}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Back to home
        </Link>

        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
            <img src="/logo.png" alt="" style={{ height: 40 }} />
            <span style={{ fontSize: 28, fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.05em' }}>Deployify</span>
          </div>
          <p style={{ color: 'var(--text2)', fontSize: 13, marginTop: 6 }}>
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--bg2)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: 28,
        }}>
          {showForgot ? (
            <form onSubmit={handleForgot}>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>Reset Password</h2>
              <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 20 }}>Enter your email and we'll send you a link to reset your password.</p>
              <div style={{ marginBottom: 20 }}>
                <input
                  type="email" value={resetEmail} onChange={e => setResetEmail(e.target.value)} required
                  placeholder="you@example.com"
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 'var(--radius)',
                    background: 'var(--bg3)', border: '1px solid var(--border)',
                    color: 'var(--text)', fontSize: 13,
                  }}
                />
              </div>
              {error && <div style={{ color: 'var(--red)', fontSize: 12, marginBottom: 14 }}>{error}</div>}
              {success && <div style={{ color: 'var(--accent)', fontSize: 12, marginBottom: 14 }}>{success}</div>}
              <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', marginBottom: 12 }}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
              <button type="button" onClick={() => setShowForgot(false)} style={{ width: '100%', background: 'none', border: 'none', color: 'var(--text3)', fontSize: 12 }}>
                Back to Sign in
              </button>
            </form>
          ) : (
            <>
              {/* Social Logins */}
              <div style={{ display: 'flex', flexDirection: window.innerWidth <= 360 ? 'column' : 'row', gap: 10, marginBottom: 20 }}>
                <button onClick={handleGoogle} style={{
                  flex: 1, padding: '10px', borderRadius: 'var(--radius)',
                  background: 'var(--bg3)', border: '1px solid var(--border2)',
                  color: 'var(--text)', fontSize: 12, fontWeight: 500,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}>
                  <GoogleIcon /> Google
                </button>
                <button onClick={handleGithub} style={{
                  flex: 1, padding: '10px', borderRadius: 'var(--radius)',
                  background: 'var(--bg3)', border: '1px solid var(--border2)',
                  color: 'var(--text)', fontSize: 12, fontWeight: 500,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}>
                  <GithubIcon /> GitHub
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                <span style={{ fontSize: 11, color: 'var(--text3)' }}>OR</span>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              </div>

              {/* Email form */}
              <form onSubmit={handleEmail}>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text2)', marginBottom: 6, fontWeight: 500 }}>
                    Email
                  </label>
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)} required
                    placeholder="you@example.com"
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: 'var(--radius)',
                      background: 'var(--bg3)', border: '1px solid var(--border)',
                      color: 'var(--text)', fontSize: 13,
                      transition: 'border-color 0.15s',
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>

                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 500 }}>
                      Password
                    </label>
                    {mode === 'signin' && (
                      <span onClick={() => setShowForgot(true)} style={{ fontSize: 11, color: 'var(--accent)', cursor: 'pointer' }}>
                        Forgot password?
                      </span>
                    )}
                  </div>
                  <input
                    type="password" value={password} onChange={e => setPassword(e.target.value)} required
                    placeholder="••••••••"
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: 'var(--radius)',
                      background: 'var(--bg3)', border: '1px solid var(--border)',
                      color: 'var(--text)', fontSize: 13,
                      transition: 'border-color 0.15s',
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                  {mode === 'signup' && passwordStrength && (
                    <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 3, background: 'var(--bg3)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: passwordStrength === 'Weak' ? '33%' : passwordStrength === 'Medium' ? '66%' : '100%',
                          background: passwordStrength === 'Weak' ? 'var(--red)' : passwordStrength === 'Medium' ? 'var(--yellow)' : 'var(--accent)',
                          transition: 'all 0.3s'
                        }} />
                      </div>
                      <span style={{ fontSize: 10, color: 'var(--text3)', minWidth: 40 }}>{passwordStrength}</span>
                    </div>
                  )}
                </div>

                {error && (
                  <div style={{
                    padding: '10px 12px', borderRadius: 'var(--radius)',
                    background: 'var(--red-dim)', border: '1px solid rgba(255,91,91,0.25)',
                    color: 'var(--red)', fontSize: 12, marginBottom: 14,
                  }}>{error}</div>
                )}
                {success && (
                  <div style={{
                    padding: '10px 12px', borderRadius: 'var(--radius)',
                    background: 'var(--accent-dim)', border: '1px solid rgba(61,255,192,0.25)',
                    color: 'var(--accent)', fontSize: 12, marginBottom: 14,
                  }}>{success}</div>
                )}

                <button type="submit" disabled={loading || (mode === 'signup' && !validateEmail(email))} style={{
                  width: '100%', padding: '11px', borderRadius: 'var(--radius)',
                  background: 'var(--accent)', border: 'none',
                  color: '#0a0b0d', fontSize: 13, fontWeight: 700,
                  opacity: (loading || (mode === 'signup' && !validateEmail(email))) ? 0.6 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  cursor: (loading || (mode === 'signup' && !validateEmail(email))) ? 'not-allowed' : 'pointer'
                }}>
                  {loading && <div className="spinner" style={{ borderTopColor: '#0a0b0d' }} />}
                  {mode === 'signin' ? 'Sign in' : 'Create account'}
                </button>
              </form>
            </>
          )}

          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text2)', marginTop: 18 }}>
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <span
              onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); setSuccess('') }}
              style={{ color: 'var(--accent)', cursor: 'pointer' }}
            >
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </span>
          </p>
          <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text3)', marginTop: 24, lineHeight: 1.6 }}>
            By continuing, you agree to Deployify's <br/>
            <Link to="/terms" style={{ color: 'var(--text2)', textDecoration: 'underline' }}>Terms of Service</Link> and <Link to="/privacy" style={{ color: 'var(--text2)', textDecoration: 'underline' }}>Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.9 0 6.6 1.7 8.1 3.1l6-5.8C34.5 3.5 29.7 1 24 1 14.7 1 6.8 6.7 3.2 14.8l7 5.4C12 14.1 17.5 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.2-.4-4.7H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.4 5.7c4.3-4 6.8-10 6.8-17.2z" />
      <path fill="#FBBC05" d="M10.2 28.6A14.6 14.6 0 019.5 24c0-1.6.3-3.2.7-4.6l-7-5.4A23.9 23.9 0 000 24c0 3.9.9 7.5 2.6 10.7l7.6-6.1z" />
      <path fill="#34A853" d="M24 47c5.7 0 10.5-1.9 14-5.1l-7.4-5.7c-1.9 1.3-4.4 2-6.6 2-6.5 0-12-4.6-14-10.7l-7.4 5.7C6.8 41.3 14.7 47 24 47z" />
    </svg>
  )
}

function GithubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  )
}

import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import PublicLayout from '../components/PublicLayout'

export default function ContactPage() {
  const [sent, setSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <PublicLayout>
      <Helmet>
        <title>Contact Us | Deployify Support</title>
        <meta name="description" content="Get in touch with our team for enterprise solutions or technical support." />
      </Helmet>
      <div className="section-container" style={{ padding: '100px 0', maxWidth: 600 }}>
        <div className="fade-up" style={{ textAlign: 'center', marginBottom: 48 }}>
          <h1 style={{ fontSize: 40, fontWeight: 700, color: 'var(--text)', marginBottom: 16 }}>Talk to our Team</h1>
          <p style={{ color: 'var(--text2)', fontSize: 18 }}>Have questions about our Enterprise plan or need support? We're here to help.</p>
        </div>

        <div className="glass fade-up-2" style={{ padding: 40 }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 20 }}>✉️</div>
              <h2 style={{ color: 'var(--text)', marginBottom: 12 }}>Message Sent!</h2>
              <p style={{ color: 'var(--text2)' }}>Our team will get back to you within 24 hours.</p>
              <button onClick={() => setSent(false)} className="btn-secondary" style={{ marginTop: 24 }}>Send another message</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--text2)', marginBottom: 8 }}>Full Name</label>
                <input type="text" required style={{ width: '100%', padding: '12px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text)' }} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--text2)', marginBottom: 8 }}>Work Email</label>
                <input type="email" required style={{ width: '100%', padding: '12px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text)' }} />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--text2)', marginBottom: 8 }}>Message</label>
                <textarea required rows={4} style={{ width: '100%', padding: '12px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text)', resize: 'none' }} placeholder="How can we help you?" />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px' }}>Send Message</button>
            </form>
          )}
        </div>
      </div>
    </PublicLayout>
  )
}

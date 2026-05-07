import React from 'react'
import PublicLayout from '../components/PublicLayout'

import { Helmet } from 'react-helmet-async'

export default function PrivacyPage() {
  const sections = [
    { id: 'intro', title: '1. Introduction' },
    { id: 'data', title: '2. Data We Collect' },
    { id: 'usage', title: '3. How We Use Your Data' },
    { id: 'security', title: '4. Security' }
  ]

  return (
    <PublicLayout>
      <Helmet>
        <title>Privacy Policy | Deployify</title>
        <meta name="description" content="Read our privacy policy to understand how we protect your data and project assets." />
      </Helmet>
      <div className="section-container" style={{ padding: '80px 0', maxWidth: 1000, display: 'flex', gap: 64 }}>
        {/* Table of Contents - Desktop */}
        <aside style={{ width: 240, flexShrink: 0, position: 'sticky', top: 120, height: 'fit-content' }} className="hide-mobile">
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 20 }}>Contents</div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {sections.map(s => (
              <a key={s.id} href={`#${s.id}`} style={{ fontSize: 14, color: 'var(--text2)', textDecoration: 'none', transition: 'color 0.2s' }}
                 onMouseOver={e => e.target.style.color = 'var(--accent)'}
                 onMouseOut={e => e.target.style.color = 'var(--text2)'}>
                {s.title}
              </a>
            ))}
          </nav>
        </aside>

        <div style={{ flex: 1 }}>
          <div className="fade-up" style={{ marginBottom: 48 }}>
            <h1 style={{ fontSize: 40, fontWeight: 700, color: 'var(--text)', marginBottom: 16 }}>Privacy Policy</h1>
            <p style={{ color: 'var(--text3)', fontSize: 14 }}>Last Updated: April 23, 2024</p>
          </div>

          <div className="fade-up-2" style={{ display: 'flex', flexDirection: 'column', gap: 56, color: 'var(--text2)', lineHeight: 1.8 }}>
            <section id="intro">
              <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', marginBottom: 20 }}>1. Introduction</h2>
              <p>
                Welcome to <strong>Deployify</strong>. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.
              </p>
              <p style={{ marginTop: 16 }}>
                By using our platform, you agree to the collection and use of information in accordance with this policy.
              </p>
            </section>

            <section id="data">
              <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', marginBottom: 20 }}>2. Data We Collect</h2>
              <p>We collect several different types of information for various purposes to provide and improve our Service to you:</p>
              <ul style={{ marginTop: 16, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <li><strong>Personal Identifiable Information:</strong> Email address, first and last name.</li>
                <li><strong>Usage Data:</strong> IP address, browser type, browser version, the pages of our Service that you visit, the time and date of your visit.</li>
                <li><strong>Deployment Data:</strong> Source code, build artifacts, and environment variables necessary to host your sites.</li>
              </ul>
            </section>

            <section id="usage">
              <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', marginBottom: 20 }}>3. How We Use Your Data</h2>
              <p>Deployify uses the collected data for various purposes:</p>
              <ul style={{ marginTop: 16, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <li>To <strong>provide and maintain</strong> our Service</li>
                <li>To <strong>notify you</strong> about changes to our Service</li>
                <li>To provide <strong>customer support</strong></li>
                <li>To gather <strong>analysis</strong> or valuable information so that we can improve our Service</li>
                <li>To <strong>monitor the usage</strong> of our Service</li>
              </ul>
            </section>

            <section id="security">
              <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', marginBottom: 20 }}>4. Security</h2>
              <p>
                The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. 
              </p>
              <div style={{ 
                marginTop: 20, 
                padding: 20, 
                background: 'var(--bg3)', 
                border: '1px solid var(--border)', 
                borderRadius: 'var(--radius)',
                fontSize: 14
              }}>
                <span style={{ color: 'var(--accent)', fontWeight: 700 }}>Note:</span> All user deployments are stored securely using <strong>Supabase Storage</strong> with strict RLS (Row Level Security) policies to ensure only you can access your project files.
              </div>
            </section>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}

import React from 'react'
import { Helmet } from 'react-helmet-async'
import PublicLayout from '../components/PublicLayout'

export default function TermsPage() {
  return (
    <PublicLayout>
      <Helmet>
        <title>Terms of Service | Deployify</title>
        <meta name="description" content="Read our terms of service and usage policies." />
      </Helmet>
      <div className="section-container" style={{ padding: '80px 0', maxWidth: 800 }}>
        <div className="fade-up" style={{ marginBottom: 48 }}>
          <h1 style={{ fontSize: 40, fontWeight: 700, color: 'var(--text)', marginBottom: 16 }}>Terms of Service</h1>
          <p style={{ color: 'var(--text3)', fontSize: 14 }}>Last Updated: April 30, 2024</p>
        </div>

        <div className="fade-up-2" style={{ display: 'flex', flexDirection: 'column', gap: 40, color: 'var(--text2)', lineHeight: 1.8 }}>
          <section>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 16 }}>1. Agreement to Terms</h2>
            <p>
              By accessing or using Deployify, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 16 }}>2. Use License</h2>
            <p>
              Permission is granted to temporarily host your web projects on Deployify's platform for personal or commercial use, subject to your chosen plan's limits.
            </p>
            <ul style={{ marginTop: 12, paddingLeft: 20 }}>
              <li>You may not use the service for any illegal activities.</li>
              <li>You may not attempt to reverse engineer any software contained on Deployify.</li>
              <li>You are responsible for the content you deploy.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 16 }}>3. Account Security</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account and password. Deployify cannot and will not be liable for any loss or damage from your failure to comply with this security obligation.
            </p>
          </section>
        </div>
      </div>
    </PublicLayout>
  )
}

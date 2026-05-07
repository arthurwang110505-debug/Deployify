import React from 'react'
import { Helmet } from 'react-helmet-async'
import PublicLayout from '../components/PublicLayout'

export default function MissionPage() {
  return (
    <PublicLayout>
      <Helmet>
        <title>Our Mission | Deployify</title>
        <meta name="description" content="Learn about our mission to simplify web deployment for developers worldwide." />
      </Helmet>
      <div className="section-container" style={{ padding: '100px 0', maxWidth: 800 }}>
        <div className="fade-up" style={{ textAlign: 'center', marginBottom: 64 }}>
          <h1 className="text-gradient" style={{ fontSize: 48, fontWeight: 800, marginBottom: 20 }}>Our Mission</h1>
          <p style={{ color: 'var(--text2)', fontSize: 20, lineHeight: 1.6 }}>Making the web accessible, one deployment at a time.</p>
        </div>

        <div className="fade-up-2" style={{ display: 'flex', flexDirection: 'column', gap: 64 }}>
          <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)', marginBottom: 20 }}>The Problem</h2>
              <p style={{ color: 'var(--text2)', lineHeight: 1.8 }}>
                Modern cloud infrastructure has become unnecessarily complex. Developers spend more time configuring CI/CD pipelines and managing servers than actually writing code. We saw a need for a platform that brings back the simplicity of the early web while keeping the power of modern architecture.
              </p>
            </div>
            <div style={{ background: 'var(--bg2)', padding: 40, borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>😵‍💫</div>
              <p style={{ fontStyle: 'italic', color: 'var(--text3)' }}>"I just wanted to host a simple landing page, why do I need a 50-line YAML file?"</p>
            </div>
          </section>

          <section>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)', marginBottom: 24, textAlign: 'center' }}>Our Values</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
              {[
                { title: 'Simplicity', desc: 'If it takes more than 30 seconds to deploy, we failed.', icon: '🌱' },
                { title: 'Performance', desc: 'Your sites should be fast, globally and always.', icon: '⚡' },
                { title: 'Transparency', desc: 'No hidden fees, no complex pricing tiers.', icon: '💎' }
              ].map((v, i) => (
                <div key={i} className="glass" style={{ padding: 32, textAlign: 'center' }}>
                  <div style={{ fontSize: 32, marginBottom: 16 }}>{v.icon}</div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>{v.title}</h3>
                  <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.6 }}>{v.desc}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </PublicLayout>
  )
}

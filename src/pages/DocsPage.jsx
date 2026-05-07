import React from 'react'
import { Helmet } from 'react-helmet-async'
import PublicLayout from '../components/PublicLayout'

export default function DocsPage() {
  return (
    <PublicLayout>
      <Helmet>
        <title>Documentation | Deployify CLI & Deployment Guide</title>
        <meta name="description" content="Learn how to deploy your projects in seconds using the Deployify CLI and GitHub Actions. Official documentation for Deployify hosting." />
        <meta property="og:title" content="Deployify Documentation" />
      </Helmet>

      <div style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)', padding: '60px 0' }}>
        <div className="section-container" style={{ maxWidth: 800 }}>
          <h1 style={{ fontSize: 48, fontWeight: 800, marginBottom: 16, letterSpacing: '-0.03em' }}>Documentation</h1>
          <p style={{ fontSize: 20, color: 'var(--text2)' }}>Everything you need to build and deploy with Deployify.</p>
        </div>
      </div>

      <div className="section-container" style={{ padding: '60px 20px', maxWidth: 800 }}>
        <div style={{ display: 'grid', gap: 40 }}>
          <section>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Getting Started</h2>
            <p style={{ color: 'var(--text2)', lineHeight: 1.7, marginBottom: 16 }}>
              Deployify is the fastest way to deploy static websites. You can deploy via our web dashboard or using our official CLI.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>CLI Deployment</h2>
            <p style={{ color: 'var(--text2)', lineHeight: 1.7, marginBottom: 16 }}>
              To deploy from your terminal, install the Deployify CLI globally:
            </p>
            <pre style={{ background: '#0a0b0d', padding: 20, borderRadius: 12, border: '1px solid var(--border)', overflowX: 'auto' }}>
              <code style={{ color: '#d1d5db', fontFamily: 'DM Mono, monospace', fontSize: 14 }}>
                npm install -g deployify-cli-official
              </code>
            </pre>
            <p style={{ color: 'var(--text2)', lineHeight: 1.7, marginTop: 16, marginBottom: 16 }}>
              Then log in and deploy your project:
            </p>
            <pre style={{ background: '#0a0b0d', padding: 20, borderRadius: 12, border: '1px solid var(--border)', overflowX: 'auto' }}>
              <code style={{ color: '#d1d5db', fontFamily: 'DM Mono, monospace', fontSize: 14 }}>
                deployify login<br />
                deployify deploy
              </code>
            </pre>
          </section>

          <section>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Custom Domains</h2>
            <p style={{ color: 'var(--text2)', lineHeight: 1.7, marginBottom: 16 }}>
              You can connect a custom domain to any Deployify site. Navigate to your site's dashboard and select the "Domains" tab to configure your DNS settings. We automatically provision an SSL certificate for you.
            </p>
          </section>
        </div>
      </div>
    </PublicLayout>
  )
}

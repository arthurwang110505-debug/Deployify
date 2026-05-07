import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function SiteViewerPage() {
  const { slug } = useParams()
  const [htmlContent, setHtmlContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchSite() {
      try {
        // Construct the base URL for this specific site
        const baseUrl = `https://${import.meta.env.VITE_SUPABASE_URL.split('//')[1]}/storage/v1/object/public/deployify-sites/sites/${slug}/`
        const indexUrl = `${baseUrl}index.html`

        const response = await fetch(indexUrl)
        
        if (!response.ok) {
          throw new Error('Site not found or could not be loaded.')
        }

        let html = await response.text()

        // Analytics Tracking Script
        const trackingScript = `
<script>
  window.addEventListener('load', () => {
    fetch('https://${import.meta.env.VITE_SUPABASE_URL.split('//')[1]}/rest/v1/page_views', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': '${import.meta.env.VITE_SUPABASE_ANON_KEY}'
      },
      body: JSON.stringify({ site_slug: '${slug}', url: window.location.href, user_agent: navigator.userAgent })
    }).catch(e => console.error('Tracking failed', e));
  });
</script>
`

        // Inject the <base> tag right after <head> so relative assets load from Supabase
        const baseTag = `<base href="${baseUrl}">`
        
        if (html.toLowerCase().includes('<head>')) {
          html = html.replace(/<head>/i, `<head>\n  ${baseTag}\n  ${trackingScript}`)
        } else {
          html = `${baseTag}\n${trackingScript}\n${html}`
        }

        setHtmlContent(html)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchSite()
  }, [slug])

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#000', color: 'var(--text)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div className="spinner" style={{ borderTopColor: 'var(--accent)', width: 32, height: 32 }} />
          <span style={{ fontSize: 14, color: 'var(--text2)', fontFamily: 'DM Mono' }}>Loading {slug}.deployify.app...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#000', color: 'var(--text)' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: 48, marginBottom: 16 }}>404</h1>
          <p style={{ color: 'var(--text2)' }}>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0a0b0d' }}>
      {/* Security Preview Header */}
      <div style={{
        height: 44, padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'var(--bg2)', borderBottom: '1px solid var(--border)', flexShrink: 0,
        fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', color: 'var(--text)' }}>
            <div style={{ width: 18, height: 18, background: 'var(--accent)', borderRadius: 4 }} />
            <span style={{ fontSize: 13, fontWeight: 700 }}>Deployify Preview</span>
          </Link>
          <div style={{ width: 1, height: 14, background: 'var(--border)' }} />
          <span style={{ fontSize: 12, color: 'var(--text2)', fontFamily: 'DM Mono' }}>{slug}.deployify.app</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 11, color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            Sandboxed
          </span>
          <a href="/dashboard" style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>Return to Dashboard</a>
        </div>
      </div>

      <iframe
        title={`Site: ${slug}`}
        srcDoc={htmlContent}
        style={{
          width: '100%',
          flex: 1,
          border: 'none',
          display: 'block',
          background: '#fff' // Default background for sites
        }}
        sandbox="allow-scripts" // Strict sandbox: no allow-same-origin, completely isolated origin
      />
    </div>
  )
}

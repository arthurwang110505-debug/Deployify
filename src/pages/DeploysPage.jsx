import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { getDeployments, rollbackToDeployment } from '../lib/supabase'
import { useToast } from '../context/ToastContext'
import { Helmet } from 'react-helmet-async'

export default function DeploysPage() {
  const { user } = useAuth()
  const { addToast } = useToast()
  const [deploys, setDeploys] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    loadDeploys()
  }, [user])

  async function loadDeploys() {
    const d = await getDeployments(user.id)
    setDeploys(d || [])
    setLoading(false)
  }

  const handleRollback = async (siteId, deploymentId) => {
    try {
      await rollbackToDeployment(siteId, deploymentId)
      addToast('Site successfully restored to this version!', 'success')
    } catch (err) {
      addToast('Rollback failed: ' + err.message, 'error')
    }
  }

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1000, margin: '0 auto' }}>
      <Helmet>
        <title>Deployments | Deployify History</title>
        <meta name="description" content="Track and manage all your site deployments and build logs." />
      </Helmet>
      <div className="fade-up" style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>Deploys</h1>
        <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4 }}>Full deploy history across all sites</p>
      </div>

      {loading ? (
        <div style={{ color: 'var(--text2)', fontSize: 13 }}>Loading...</div>
      ) : deploys.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text2)', fontSize: 13 }}>No deploys yet. Go deploy a site!</div>
      ) : (
        <div className="fade-up-2" style={{
          background: 'var(--bg2)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', overflow: 'hidden',
        }}>
          <div style={{
            display: 'grid', gridTemplateColumns: 'auto 1fr auto auto',
            padding: '10px 18px', borderBottom: '1px solid var(--border)',
            gap: 16,
          }}>
            {['Status', 'Site', 'Deploy ID', 'Time'].map(h => (
              <span key={h} style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</span>
            ))}
          </div>

          {deploys.map((d, i) => (
            <div key={d.id} style={{
              display: 'grid', gridTemplateColumns: 'auto 1fr auto auto',
              padding: '13px 18px', gap: 16,
              borderBottom: i < deploys.length - 1 ? '1px solid var(--border)' : 'none',
              alignItems: 'center',
              transition: 'background 0.1s',
            }}
              onMouseOver={e => e.currentTarget.style.background = 'var(--bg3)'}
              onMouseOut={e => e.currentTarget.style.background = 'transparent'}
            >
              <StatusBadge status={d.status} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{d.sites?.name || '—'}</div>
                <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                  {d.deploy_url && (
                    <a href={d.deploy_url} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}
                      onClick={e => e.stopPropagation()}>
                      View →
                    </a>
                  )}
                  {d.status === 'published' && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleRollback(d.site_id, d.id) }}
                      style={{ background: 'none', border: 'none', padding: 0, fontSize: 11, color: 'var(--text3)', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Restore this version
                    </button>
                  )}
                </div>
              </div>
              <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'DM Mono, monospace' }}>
                {d.id.slice(0, 12)}
              </span>
              <span style={{ fontSize: 11, color: 'var(--text2)' }}>{timeAgo(d.created_at)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }) {
  const cfg = {
    published: { color: 'var(--accent)', bg: 'var(--accent-dim)', label: 'Published' },
    building: { color: 'var(--yellow)', bg: 'var(--yellow-dim)', label: 'Building' },
    failed: { color: 'var(--red)', bg: 'var(--red-dim)', label: 'Failed' },
  }[status] || { color: 'var(--text2)', bg: 'var(--bg3)', label: status }

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 8px', borderRadius: 4,
      background: cfg.bg, color: cfg.color,
      fontSize: 11, fontWeight: 600,
    }}>
      <div style={{
        width: 5, height: 5, borderRadius: '50%', background: cfg.color,
        animation: status === 'building' ? 'pulse 1s infinite' : 'none',
      }} />
      {cfg.label}
    </div>
  )
}

function timeAgo(ts) {
  if (!ts) return ''
  const diff = (Date.now() - new Date(ts)) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago'
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago'
  return Math.floor(diff / 86400) + 'd ago'
}

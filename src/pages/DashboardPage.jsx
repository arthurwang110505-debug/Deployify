import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useDeploy } from '../hooks/useDeploy'
import { useToast } from '../context/ToastContext'
import { getSites, deleteSite, deleteStorageSite, updateSite, getPageViews, promoteDeployment, getPageViewsStats, seedPageViews, updateSiteSlug, createEnvVar, deleteEnvVar, createDomain, deleteDomain } from '../lib/supabase'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { supabase } from '../lib/supabase'

export default function DashboardPage() {
  const { user } = useAuth()
  const { addToast } = useToast()
  const [sites, setSites] = useState([])
  const [loadingSites, setLoadingSites] = useState(true)
  const [deployModal, setDeployModal] = useState(false)
  const [selectedSite, setSelectedSite] = useState(null)
  const [search, setSearch] = useState('')
  const [githubModal, setGithubModal] = useState(false)
  const [buildingRepo, setBuildingRepo] = useState(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const fetchSites = async () => {
    if (!user) return
    try {
      const data = await getSites(user.id)
      setSites(data || [])
    } finally {
      setLoadingSites(false)
    }
  }

  useEffect(() => { fetchSites() }, [user])

  const handleDelete = async (site) => {
    if (!confirm(`Delete "${site.name}"? This cannot be undone.`)) return
    await deleteStorageSite(site.slug)
    await deleteSite(site.id)
    setSites(s => s.filter(x => x.id !== site.id))
    setSelectedSite(null)
  }

  const filteredSites = sites.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.slug.toLowerCase().includes(search.toLowerCase())
  )

  const stats = {
    total: sites.length,
    published: sites.filter(s => s.status === 'published').length,
    deployments: sites.reduce((acc, s) => acc + (s.deployments?.length || 0), 0)
  }

  return (
    <div style={{ padding: isMobile ? '24px 20px' : '40px 48px' }}>
      {/* Stats Bar */}
      <div className="fade-up" style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
        gap: 24,
        marginBottom: 48
      }}>
        {[
          { label: 'Active Sites', value: stats.total, icon: '🌐', color: 'var(--accent)' },
          { label: 'Published', value: stats.published, icon: '✅', color: '#2ec4b6' },
          { label: 'Total Deploys', value: stats.deployments, icon: '🚀', color: '#7209b7' }
        ].map((s, i) => (
          <div key={i} className="glass card-hover" style={{
            padding: '24px',
            border: '1px solid var(--border)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute', top: -10, right: -10, fontSize: 64, opacity: 0.05, filter: 'grayscale(1)'
            }}>{s.icon}</div>
            <div style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>{s.label}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.03em' }}>{s.value}</div>
              <div style={{ fontSize: 12, color: s.color, fontWeight: 600 }}>Live</div>
            </div>
          </div>
        ))}
      </div>

      {/* Header & Search */}
      <div className="fade-up-2" style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'stretch' : 'center',
        justifyContent: 'space-between',
        gap: 20,
        marginBottom: 32
      }}>
        <div style={{ flex: 1, maxWidth: isMobile ? 'none' : 400, position: 'relative' }}>
          <input
            type="text"
            placeholder="Search sites..."
            className="search-input"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 40 }}
          />
          <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            onClick={() => setGithubModal(true)}
            className="btn-secondary"
            style={{ fontSize: 13, padding: '10px 16px', justifyContent: 'center', borderColor: 'var(--accent)', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <GithubIcon size={16} />
            <span>Setup CI/CD</span>
          </button>
          <button onClick={() => setDeployModal(true)} className="btn-primary" style={{ fontSize: 13, padding: '10px 20px', justifyContent: 'center' }}>
            <span>+</span> Deploy
          </button>
        </div>
      </div>

      {/* Sites grid */}
      {loadingSites ? (
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : filteredSites.length === 0 ? (
        <EmptyState onDeploy={() => setDeployModal(true)} isSearch={!!search} />
      ) : (
        <div className="fade-up-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {filteredSites.map(site => (
            <SiteCard
              key={site.id}
              site={site}
              onDelete={() => handleDelete(site)}
              onClick={() => setSelectedSite(site)}
              selected={selectedSite?.id === site.id}
            />
          ))}
        </div>
      )}

      {/* Selected site detail */}
      {selectedSite && (
        <SiteDetailPanel
          site={selectedSite}
          onClose={() => setSelectedSite(null)}
          onDelete={() => handleDelete(selectedSite)}
          onRedeploy={() => { setSelectedSite(null); setDeployModal(true) }}
        />
      )}

      {/* Deploy modal */}
      {deployModal && (
        <DeployModal
          userId={user.id}
          onClose={() => setDeployModal(false)}
          onSuccess={() => { setDeployModal(false); fetchSites() }}
        />
      )}

      {/* GitHub Modal */}
      {githubModal && (
        <GithubImportModal
          onClose={() => setGithubModal(false)}
          onImport={async (repo) => {
            setGithubModal(false);
            setBuildingRepo(repo);
            try {
              const { data: { session } } = await supabase.auth.getSession()
              const slug = repo.name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.random().toString(36).substring(2, 5)

              // 1. 在資料庫建立 Site
              const { data, error } = await supabase.from('sites').insert([{
                user_id: user.id,
                name: repo.name,
                slug: slug,
                github_repo: repo.full_name,
                status: 'building',
                build_command: 'npm run build',
                output_dir: 'dist'
              }]).select().single()

              if (error) throw error

              // 2. 自動在 GitHub 建立 Webhook (Full Webhook Integration)
              // 注意：這需要您的 Supabase Edge Function 網址
              const webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/github-webhook`

              const hookResponse = await fetch(`https://api.github.com/repos/${repo.full_name}/hooks`, {
                method: 'POST',
                headers: {
                  'Authorization': `token ${session.provider_token}`,
                  'Accept': 'application/vnd.github.v3+json'
                },
                body: JSON.stringify({
                  name: 'web',
                  active: true,
                  events: ['push'],
                  config: {
                    url: webhookUrl,
                    content_type: 'json',
                    insecure_ssl: '0'
                  }
                })
              })

              if (!hookResponse.ok) {
                console.warn('Could not create webhook automatically. User might need to set it up manually.')
              }

              setSites(prev => [data, ...prev])
              setSelectedSite(data)
            } catch (err) {
              addToast(err.message, 'error')
            }
          }}
        />
      )}

      {/* Building State Overlay */}
      {buildingRepo && (
        <BuildingOverlay
          repo={buildingRepo}
          onFinish={() => {
            setBuildingRepo(null);
            fetchSites();
            setSettingsModal(true);
            setTab('git');
            addToast('Repository connected! Follow the steps to enable automatic deployments.', 'success');
          }}
        />
      )}
    </div>
  )
}

// ─── Site Card ────────────────────────────────────────────────────────────────
function SiteCard({ site, onDelete, onClick, selected }) {
  const latestDeploy = site.deployments?.[0]

  return (
    <div
      onClick={onClick}
      className="card-hover"
      style={{
        background: 'var(--bg2)',
        border: `1px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
        borderRadius: 16,
        cursor: 'pointer',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, border-color 0.2s'
      }}
    >
      {/* Visual Preview Area */}
      <div style={{
        height: 140,
        background: 'var(--bg3)',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottom: '1px solid var(--border)',
        overflow: 'hidden'
      }}>
        {/* Abstract "Browser" Mockup */}
        <div style={{
          width: '85%', height: '80%',
          background: 'var(--bg)',
          borderRadius: '8px 8px 0 0',
          border: '1px solid var(--border2)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          transform: 'translateY(10px)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ height: 12, background: 'var(--bg2)', borderBottom: '1px solid var(--border)', display: 'flex', gap: 4, alignItems: 'center', padding: '0 8px' }}>
            <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#ff5f56' }} />
            <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#ffbd2e' }} />
            <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#27c93f' }} />
          </div>
          <div style={{ flex: 1, padding: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ height: 4, width: '40%', background: 'var(--border)', borderRadius: 2 }} />
            <div style={{ height: 4, width: '70%', background: 'var(--border)', borderRadius: 2 }} />
            <div style={{ height: 4, width: '50%', background: 'var(--border)', borderRadius: 2 }} />
          </div>
        </div>

        {/* Status Badge Over Preview */}
        <div style={{
          position: 'absolute', top: 12, right: 12,
          padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700,
          background: site.status === 'published' ? 'rgba(61,255,192,0.15)' : 'rgba(255,255,255,0.05)',
          color: site.status === 'published' ? 'var(--accent)' : 'var(--text3)',
          border: `1px solid ${site.status === 'published' ? 'rgba(61,255,192,0.3)' : 'transparent'}`,
          backdropFilter: 'blur(4px)',
          textTransform: 'uppercase'
        }}>
          {site.status}
        </div>
      </div>

      {/* Content Area */}
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em' }}>{site.name}</div>
          <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'DM Mono' }}>{site.id.slice(0, 8)}</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text3)', fontSize: 12, marginBottom: 16 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
          {site.slug}.deployify.app
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          paddingTop: 16, borderTop: '1px solid var(--border)',
          fontSize: 11, color: 'var(--text3)'
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: site.status === 'published' ? 'var(--accent)' : 'var(--text3)' }} />
          <span>Last deployed {latestDeploy ? timeAgo(latestDeploy.created_at) : 'never'}</span>
        </div>
      </div>
    </div>
  )
}

// ─── Site Detail Panel ────────────────────────────────────────────────────────
function SiteDetailPanel({ site, onClose, onDelete, onRedeploy }) {
  const { user } = useAuth()
  const { addToast } = useToast()
  const [tab, setTab] = useState('info') // info | logs | domains
  const deploys = site.deployments || []

  const [newDomain, setNewDomain] = useState('')
  const [newEnvKey, setNewEnvKey] = useState('')
  const [newEnvVal, setNewEnvVal] = useState('')
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleAddDomain = async () => {
    if (!newDomain.trim()) return
    try {
      await createDomain({ siteId: site.id, userId: user.id, domain: newDomain.trim() })
      site.domains = [...(site.domains || []), { domain: newDomain.trim(), status: 'pending_verification' }]
      setNewDomain('')
      addToast('Domain added successfully!', 'success')
    } catch (err) {
      addToast('Error adding domain: ' + err.message, 'error')
    }
  }

  const handleAddEnv = async () => {
    if (!newEnvKey.trim() || !newEnvVal.trim()) return
    try {
      await createEnvVar({ siteId: site.id, userId: user.id, key: newEnvKey.trim(), value: newEnvVal.trim() })
      site.env_vars = [...(site.env_vars || []), { key: newEnvKey.trim(), value: newEnvVal.trim() }]
      setNewEnvKey('')
      setNewEnvVal('')
      addToast('Variable added successfully!', 'success')
    } catch (err) {
      addToast('Error adding variable: ' + err.message, 'error')
    }
  }

  const handleRename = async () => {
    const newName = prompt('Enter new site name:', site.name)
    if (newName && newName !== site.name) {
      try {
        await updateSite(site.id, { name: newName })
        site.name = newName // Update local ref
        onClose() // Close to refresh list
        addToast('Site renamed successfully')
      } catch (err) {
        addToast('Failed to rename site: ' + err.message, 'error')
      }
    }
  }

  const handleChangeSlug = async () => {
    const newSlug = prompt('Enter new site URL slug (no spaces):', site.slug)
    if (newSlug && newSlug !== site.slug) {
      const cleanSlug = newSlug.toLowerCase().replace(/[^a-z0-9-]/g, '-')
      if (confirm(`Change URL to "${cleanSlug}.deployify.app"? \n\nWarning: This will move all site files. The old URL will stop working.`)) {
        try {
          await updateSiteSlug(site.id, site.slug, cleanSlug)
          addToast('URL changed successfully!')
          onClose()
        } catch (err) {
          addToast('Error: ' + err.message, 'error')
        }
      }
    }
  }

  return (
    <div className="animate-reveal" style={{
      position: 'fixed', right: 0, top: 0, bottom: 0,
      width: isMobile ? '100%' : 440,
      background: 'var(--bg2)', borderLeft: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', zIndex: 1000,
      boxShadow: '-20px 0 40px rgba(0,0,0,0.5)'
    }}>
      <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{site.name}</span>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{site.slug}</div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text2)', fontSize: 18, lineHeight: 1 }}>✕</button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 20px' }}>
        {['info', 'domains', 'git', 'logs', 'analytics'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '16px 16px',
              background: 'none',
              border: 'none',
              borderBottom: `2px solid ${tab === t ? 'var(--accent)' : 'transparent'}`,
              color: tab === t ? 'var(--text)' : 'var(--text3)',
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              cursor: 'pointer'
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
        {tab === 'git' && (
          <div className="fade-in">
            <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 700, marginBottom: 16, textTransform: 'uppercase' }}>Continuous Integration</div>

            <div className="glass" style={{ padding: 20, borderRadius: 16, marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ padding: '4px 8px', background: 'var(--accent-dim)', color: 'var(--accent)', borderRadius: 4, fontSize: 10, fontWeight: 700 }}>CLI</div>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Deploy from Local</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 12, lineHeight: 1.5 }}>
                Use the published CLI to deploy directly from your terminal.
              </p>
              <div style={{ position: 'relative', background: '#0a0b0d', padding: '12px', borderRadius: 8, border: '1px solid var(--border)', fontFamily: 'DM Mono', fontSize: 11, color: 'var(--text3)', marginBottom: 10 }}>
                <code>npx deployify-cli deploy --site={site.slug} --dir=dist</code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`npx deployify-cli deploy --site=${site.slug} --dir=dist`)
                    addToast('CLI command copied!')
                  }}
                  style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2 2v1"></path></svg>
                </button>
              </div>
            </div>

            <div className="glass" style={{ padding: 20, borderRadius: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ padding: '4px 8px', background: 'rgba(61,255,192,0.15)', color: 'var(--accent)', borderRadius: 4, fontSize: 10, fontWeight: 700 }}>GITHUB</div>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>GitHub Actions (CI/CD)</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 12, lineHeight: 1.5 }}>
                Automatic deployment on every push. Create <code>.github/workflows/deploy.yml</code>:
              </p>
              <div style={{ position: 'relative', background: '#0a0b0d', padding: '12px', borderRadius: 8, border: '1px solid var(--border)', fontFamily: 'DM Mono', fontSize: 10, color: 'var(--text3)', overflowX: 'auto', whiteSpace: 'pre' }}>
                {`name: Deploy
on: [push]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install && npm run build
      - run: npx deployify-cli deploy --site=${site.slug} --dir=dist
        env:
          DEPLOYIFY_TOKEN: \${{ secrets.DEPLOYIFY_TOKEN }}`}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`name: Deploy\non: [push]\njobs:\n  deploy:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v3\n      - run: npm install && npm run build\n      - run: npx deployify-cli deploy --site=${site.slug} --dir=dist\n        env:\n          DEPLOYIFY_TOKEN: \${{ secrets.DEPLOYIFY_TOKEN }}`)
                    addToast('Workflow copied!')
                  }}
                  style={{ position: 'absolute', right: 8, top: 12, background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)', padding: '4px 8px', borderRadius: 4, cursor: 'pointer', fontSize: 10 }}
                >
                  Copy
                </button>
              </div>
              <div style={{ marginTop: 12, padding: 10, background: 'rgba(255,189,46,0.1)', borderRadius: 8, border: '1px solid rgba(255,189,46,0.2)', fontSize: 11, color: 'var(--yellow)' }}>
                ⚠️ Remember to add <b>DEPLOYIFY_TOKEN</b> to your GitHub Repo Secrets.
              </div>
            </div>
          </div>
        )}

        {tab === 'domains' && (
          <div className="fade-in">
            <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 700, marginBottom: 16, textTransform: 'uppercase' }}>Custom Domains</div>
            <div className="glass" style={{ padding: 20, borderRadius: 16, marginBottom: 20 }}>
              <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16 }}>Connect your own domain to this project.</p>
              <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                <input
                  type="text"
                  placeholder="e.g. my-app.com"
                  value={newDomain}
                  onChange={e => setNewDomain(e.target.value)}
                  style={{ flex: 1, padding: '10px 12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 13 }}
                />
                <button onClick={handleAddDomain} className="btn-primary" style={{ fontSize: 12 }}>Add</button>
              </div>

              {site.domains?.length > 0 && (
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {site.domains.map(d => (
                    <div key={d.domain} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 600 }}>{d.domain}</span>
                      <span style={{ fontSize: 10, padding: '4px 8px', borderRadius: 12, background: d.status === 'active' ? 'rgba(61,255,192,0.2)' : 'rgba(255,189,46,0.2)', color: d.status === 'active' ? 'var(--accent)' : 'var(--yellow)' }}>
                        {d.status === 'active' ? 'Active' : 'Pending Verification'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="glass" style={{ padding: 20, borderRadius: 16, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>DNS Configuration</div>
              <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 16, lineHeight: 1.5 }}>
                To point your domain to Deployify, set the following CNAME record in your DNS provider:
              </p>
              <div style={{ background: '#0a0b0d', padding: 12, borderRadius: 8, border: '1px solid var(--border)', fontSize: 11, fontFamily: 'DM Mono' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: 'var(--text3)' }}>Type:</span>
                  <span style={{ color: 'var(--text)' }}>CNAME</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: 'var(--text3)' }}>Name:</span>
                  <span style={{ color: 'var(--text)' }}>@ or www</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text3)' }}>Value:</span>
                  <span style={{ color: 'var(--accent)' }}>cname.deployify.app</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'info' && (
          <>
            <Section label="Deployment URL">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg3)', padding: '10px 14px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', flex: 1 }}>
                  <a href={`/site/${site.slug}`} target="_blank" rel="noopener noreferrer" style={{
                    fontSize: 13, color: 'var(--accent)', fontFamily: 'DM Mono, monospace',
                    wordBreak: 'break-all', textDecoration: 'none', flex: 1
                  }}>
                    {window.location.origin}/site/{site.slug}
                  </a>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/site/${site.slug}`)
                      addToast('Short link copied!')
                    }}
                    style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: 4 }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                  </button>
                </div>
              </div>
            </Section>

            <Section label="Environment Variables">
              <div className="glass" style={{ padding: 16, borderRadius: 12, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                  {site.env_vars?.map((env, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8 }}>
                      <input readOnly value={env.key} style={{ flex: 1, padding: '6px 10px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 4, fontSize: 11, color: 'var(--text2)', fontFamily: 'DM Mono' }} />
                      <input readOnly value="••••••••••••" style={{ flex: 1.5, padding: '6px 10px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 4, fontSize: 11, color: 'var(--text2)', fontFamily: 'DM Mono' }} />
                    </div>
                  ))}

                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      value={newEnvKey}
                      onChange={e => setNewEnvKey(e.target.value)}
                      placeholder="KEY (e.g. API_URL)"
                      style={{ flex: 1, padding: '6px 10px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, fontSize: 11, color: 'var(--text)' }}
                    />
                    <input
                      value={newEnvVal}
                      onChange={e => setNewEnvVal(e.target.value)}
                      placeholder="VALUE"
                      style={{ flex: 1.5, padding: '6px 10px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, fontSize: 11, color: 'var(--text)' }}
                    />
                  </div>
                </div>
                <button onClick={handleAddEnv} style={{ width: '100%', background: 'var(--bg3)', border: '1px dashed var(--border)', color: 'var(--text)', padding: '8px', borderRadius: 6, fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>
                  Save Variable
                </button>
              </div>
            </Section>

            <Section label="Project Controls">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <button onClick={onRedeploy} className="btn-primary" style={{ gridColumn: 'span 2', fontSize: 12, padding: '10px' }}>Redeploy Site</button>
                <button onClick={handleRename} className="btn-secondary" style={{ fontSize: 12 }}>Rename</button>
                <button onClick={handleChangeSlug} className="btn-secondary" style={{ fontSize: 12 }}>Change URL</button>
                <button onClick={onDelete} className="btn-secondary" style={{ gridColumn: 'span 2', color: 'var(--red)', borderColor: 'rgba(255,91,91,0.2)', fontSize: 12 }}>Delete Project</button>
              </div>
            </Section>
          </>
        )}

        {tab === 'logs' && (
          <div className="fade-up">
            <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 700, marginBottom: 20, textTransform: 'uppercase' }}>Deployment History</div>
            {deploys.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text3)' }}>No deployments found</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {deploys.map((d, i) => {
                  const isCurrentProd = d.deploy_url === site.deploy_url;
                  const previewUrl = `/preview/${d.id.slice(0, 8)}`;

                  return (
                    <div key={d.id} className="glass" style={{
                      padding: '16px',
                      borderRadius: 12,
                      border: isCurrentProd ? '1px solid var(--accent)' : '1px solid var(--border)',
                      position: 'relative'
                    }}>
                      {isCurrentProd && (
                        <div style={{
                          position: 'absolute', top: -10, right: 12,
                          background: 'var(--accent)', color: '#000',
                          fontSize: 9, fontWeight: 900, padding: '2px 8px', borderRadius: 4
                        }}>CURRENT PRODUCTION</div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <div className={`badge badge-${d.status}`}>{d.status}</div>
                            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{d.id.slice(0, 8)}</span>
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                            Deployed {timeAgo(d.created_at)} • via GitHub
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <a href={previewUrl} target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: '6px 12px', fontSize: 11 }}>
                            Visit Preview
                          </a>
                        </div>
                      </div>

                      {!isCurrentProd && d.status === 'published' && (
                        <button
                          onClick={async () => {
                            if (confirm('Promote this version to production?')) {
                              try {
                                await promoteDeployment(site.id, d.deploy_url)
                                addToast('Deployment promoted to production!')
                                onClose()
                              } catch (err) {
                                addToast('Promotion failed: ' + err.message, 'error')
                              }
                            }
                          }}
                          className="btn-primary"
                          style={{ width: '100%', padding: '8px', fontSize: 11, background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent)' }}
                        >
                          🚀 Promote to Production
                        </button>
                      )}

                      {d.log && d.log.length > 0 && (
                        <details style={{ marginTop: 12 }}>
                          <summary style={{ fontSize: 11, color: 'var(--text3)', cursor: 'pointer', outline: 'none' }}>View Build Logs</summary>
                          <div className="log-container" style={{ marginTop: 8, maxHeight: 150 }}>
                            {d.log.map((line, idx) => (
                              <div key={idx}><span style={{ color: 'var(--text3)', marginRight: 8 }}>{'>'}</span>{line}</div>
                            ))}
                          </div>
                        </details>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tab === 'analytics' && (
          <div className="fade-up">
            <AnalyticsPanel slug={site.slug} />
          </div>
        )}
      </div>
    </div>
  )
}

function AnalyticsPanel({ slug }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  const loadStats = async () => {
    try {
      const [stats, count] = await Promise.all([
        getPageViewsStats(slug),
        getPageViews(slug)
      ])
      setData(stats)
      setTotal(count)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadStats() }, [slug])

  const handleSeed = async () => {
    if (confirm('Add 7 days of dummy traffic data?')) {
      await seedPageViews(slug)
      loadStats()
    }
  }

  if (loading) return <div style={{ color: 'var(--text3)', textAlign: 'center', padding: '40px 0' }}>Loading analytics...</div>

  return (
    <div>
      <div style={{
        background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
        padding: 24, textAlign: 'center', marginBottom: 24
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Total Page Views</div>
        <div style={{ fontSize: 48, fontWeight: 900, color: 'var(--text)', fontFamily: 'DM Mono, monospace' }}>
          {total.toLocaleString()}
        </div>
      </div>

      <div style={{ height: 200, width: '100%', marginBottom: 24 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--text3)', fontSize: 10 }}
            />
            <YAxis hide />
            <Tooltip
              contentStyle={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
              itemStyle={{ color: 'var(--accent)' }}
            />
            <Line
              type="monotone"
              dataKey="views"
              stroke="var(--accent)"
              strokeWidth={2}
              dot={{ fill: 'var(--accent)', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: 'var(--accent)' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
        <button onClick={handleSeed} className="btn-secondary" style={{ fontSize: 11, padding: '8px 16px' }}>
          ✨ Seed Mock Data
        </button>
      </div>

      <p style={{ fontSize: 11, color: 'var(--text3)', lineHeight: 1.6, textAlign: 'center', marginTop: 24 }}>
        Views are recorded automatically via the <span style={{ color: 'var(--text)' }}>SiteViewer</span> tracking script.
      </p>
    </div>
  )
}

// ─── Deploy Modal ─────────────────────────────────────────────────────────────
function DeployModal({ userId, onClose, onSuccess }) {
  const [siteName, setSiteName] = useState('')
  const [file, setFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef()
  const [renameTarget, setRenameTarget] = useState(null)

  // GitHub Import States
  const [deployMode, setDeployMode] = useState('upload') // 'upload' | 'github' | 'cicd'
  const [githubRepo, setGithubRepo] = useState('')
  const [isFetchingGithub, setIsFetchingGithub] = useState(false)

  const { phase, progress, log, deployUrl, error, deploy, reset } = useDeploy(userId, onSuccess)

  const handleFiles = (files) => {
    if (!files || files.length === 0) return
    const fileList = Array.from(files)
    setRenameTarget(null) // Reset

    // Check for index.html
    const hasIndex = fileList.some(f => {
      const path = f.webkitRelativePath || f.name
      const parts = path.split('/')
      if (f.type === 'application/zip') return true
      if (parts.length === 1) return parts[0] === 'index.html'
      if (parts.length === 2) return parts[1] === 'index.html'
      return false
    })

    if (!hasIndex && fileList[0].type !== 'application/zip') {
      // Find alternative HTML
      const altHtml = fileList.find(f => {
        const path = f.webkitRelativePath || f.name
        return path.endsWith('.html')
      })

      if (altHtml) {
        const cleanAlt = altHtml.webkitRelativePath || altHtml.name
        if (confirm(`No "index.html" found, but detected "${cleanAlt}". Use this as your home page? (We will automatically rename it for you)`)) {
          setRenameTarget(cleanAlt)
        }
      } else {
        addToast('No "index.html" found. Site might not load correctly.', 'error')
      }
    }

    if (files.length === 1) {
      setFile(files[0])
    } else {
      setFile(fileList)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }

  const handleSubmit = async () => {
    if (!siteName.trim()) return

    if (deployMode === 'upload') {
      if (!file) return
      deploy(file, siteName.trim(), renameTarget)
    } else {
      if (!githubRepo.trim()) return
      setIsFetchingGithub(true)
      try {
        const repoPath = githubRepo.replace('https://github.com/', '').trim()
        const zipUrl = `https://api.github.com/repos/${repoPath}/zipball`

        // Try to get provider token from session if logged in with Github
        const { data: { session } } = await supabase.auth.getSession()
        const headers = {}
        if (session?.provider_token) {
          headers['Authorization'] = `token ${session.provider_token}`
        }

        const response = await fetch(zipUrl, { headers })

        if (response.status === 404) {
          throw new Error('Repository not found. If it is private, make sure you signed in with GitHub and granted repo permissions.')
        }
        if (!response.ok) throw new Error(`GitHub API error: ${response.statusText}`)

        const blob = await response.blob()
        const zipFile = new File([blob], `${repoPath.split('/').pop()}.zip`, { type: 'application/zip' })

        deploy(zipFile, siteName.trim(), null)
      } catch (err) {
        addToast(err.message, 'error')
      } finally {
        setIsFetchingGithub(false)
      }
    }
  }

  const isRunning = phase === 'reading' || phase === 'uploading' || isFetchingGithub
  const isDone = phase === 'done'

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100, padding: 20,
    }} onClick={e => e.target === e.currentTarget && !isRunning && onClose()}>
      <div className="fade-up" style={{
        width: '100%', maxWidth: 520,
        background: 'var(--bg2)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', overflow: 'hidden',
      }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>
            {isDone ? '🎉 Deploy complete!' : 'Deploy new site'}
          </span>
          {!isRunning && <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text2)', fontSize: 18 }}>✕</button>}
        </div>

        <div style={{ padding: 22 }}>
          {!isRunning && !isDone ? (
            <>
              {/* Deployment Mode Toggle */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                <button
                  onClick={() => setDeployMode('upload')}
                  style={{
                    flex: 1, padding: '8px', fontSize: 12, fontWeight: 600,
                    background: deployMode === 'upload' ? 'var(--accent)' : 'var(--bg3)',
                    color: deployMode === 'upload' ? '#0a0b0d' : 'var(--text2)',
                    border: '1px solid', borderColor: deployMode === 'upload' ? 'var(--accent)' : 'var(--border)',
                    borderRadius: 'var(--radius)', cursor: 'pointer', transition: 'all 0.15s'
                  }}
                >
                  Manual Upload
                </button>
                <button
                  onClick={() => setDeployMode('github')}
                  style={{
                    flex: 1, padding: '8px', fontSize: 12, fontWeight: 600,
                    background: deployMode === 'github' ? 'var(--accent)' : 'var(--bg3)',
                    color: deployMode === 'github' ? '#0a0b0d' : 'var(--text2)',
                    border: '1px solid', borderColor: deployMode === 'github' ? 'var(--accent)' : 'var(--border)',
                    borderRadius: 'var(--radius)', cursor: 'pointer', transition: 'all 0.15s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                  }}
                >
                  Import Repo
                </button>
                <button
                  onClick={() => setDeployMode('cicd')}
                  style={{
                    flex: 1, padding: '8px', fontSize: 12, fontWeight: 600,
                    background: deployMode === 'cicd' ? 'var(--accent)' : 'var(--bg3)',
                    color: deployMode === 'cicd' ? '#0a0b0d' : 'var(--text2)',
                    border: '1px solid', borderColor: deployMode === 'cicd' ? 'var(--accent)' : 'var(--border)',
                    borderRadius: 'var(--radius)', cursor: 'pointer', transition: 'all 0.15s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                  Setup CI/CD
                </button>
              </div>

              {/* Site name */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 8 }}>Site name</label>
                <input
                  value={siteName}
                  onChange={e => setSiteName(e.target.value)}
                  placeholder="my-awesome-site"
                  style={{
                    width: '100%', padding: '10px 12px',
                    background: 'var(--bg3)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)', color: 'var(--text)', fontSize: 13,
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>

              {deployMode === 'upload' ? (
                /* Drop zone */
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current.click()}
                  style={{
                    border: `1.5px dashed ${dragOver ? 'var(--accent)' : file ? 'rgba(61,255,192,0.4)' : 'var(--border2)'}`,
                    borderRadius: 'var(--radius-lg)',
                    padding: 32, textAlign: 'center',
                    cursor: 'pointer',
                    background: dragOver ? 'var(--accent-dim2)' : file ? 'var(--accent-dim2)' : 'transparent',
                    transition: 'all 0.15s',
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    style={{ display: 'none' }}
                    onChange={e => handleFiles(e.target.files)}
                  />
                  <div style={{ fontSize: 28, marginBottom: 10 }}>
                    {file ? (Array.isArray(file) ? '📁' : (file.name.endsWith('.zip') ? '📦' : '📄')) : '☁️'}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
                    {file ? (Array.isArray(file) ? `${file.length} files selected` : file.name) : 'Drop files or ZIP here'}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text2)' }}>
                    {file ? (Array.isArray(file) ? 'Click to change' : `${(file.size / 1024).toFixed(1)} KB`) : 'or click to browse'}
                  </div>
                </div>
              ) : deployMode === 'github' ? (
                /* GitHub Input */
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 8 }}>GitHub Repository</label>
                  <input
                    value={githubRepo}
                    onChange={e => setGithubRepo(e.target.value)}
                    placeholder="e.g. facebook/react"
                    style={{
                      width: '100%', padding: '10px 12px',
                      background: 'var(--bg3)', border: '1px solid var(--border)',
                      borderRadius: 'var(--radius)', color: 'var(--text)', fontSize: 13,
                      transition: 'border-color 0.15s',
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                  <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 8 }}>Only public repositories are supported for instant import.</p>
                </div>
              ) : (
                <div style={{ marginBottom: 18, background: 'var(--bg3)', border: '1px solid var(--border)', padding: 16, borderRadius: 'var(--radius-lg)' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ padding: '2px 6px', background: 'rgba(61,255,192,0.2)', color: 'var(--accent)', borderRadius: 4, fontSize: 10 }}>READY</div>
                    Push-to-Deploy with GitHub Actions
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 12 }}>
                    Add this workflow file to your repository at <code>.github/workflows/deployify.yml</code> to enable automated builds on push.
                  </p>
                  <div style={{ position: 'relative', background: '#0a0b0d', padding: '16px 12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontFamily: 'DM Mono', fontSize: 11, color: 'var(--text3)', overflowX: 'auto', whiteSpace: 'pre' }}>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`name: Deployify CI\non:\n  push:\n    branches: [ main ]\njobs:\n  deploy:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v3\n      - run: npm ci\n      - run: npm run build\n      - name: Deploy to Deployify\n        run: npx deployify-cli deploy --dir=dist --site=${siteName || 'YOUR_SITE_NAME'}\n        env:\n          DEPLOYIFY_TOKEN: \${{ secrets.DEPLOYIFY_TOKEN }}`);
                        addToast('Workflow copied to clipboard!', 'success');
                      }}
                      style={{ position: 'absolute', top: 8, right: 8, background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)', padding: '4px 8px', borderRadius: 4, cursor: 'pointer', fontSize: 10 }}
                    >
                      Copy YAML
                    </button>
                    {`name: Deployify CI\non:\n  push:\n    branches: [ main ]\njobs:\n  deploy:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v3\n      - run: npm ci\n      - run: npm run build\n      - name: Deploy to Deployify\n        run: npx deployify-cli deploy --dir=dist --site=${siteName || 'YOUR_SITE_NAME'}\n        env:\n          DEPLOYIFY_TOKEN: \${{ secrets.DEPLOYIFY_TOKEN }}`}
                  </div>
                </div>
              )}

              {deployMode !== 'cicd' && (
                <button
                  onClick={handleSubmit}
                  disabled={(deployMode === 'upload' && !file) || (deployMode === 'github' && !githubRepo) || !siteName.trim() || isFetchingGithub}
                  style={{
                    width: '100%', padding: '12px', marginTop: 18,
                    borderRadius: 'var(--radius)', border: 'none',
                    background: 'var(--accent)', color: '#0a0b0d',
                    fontSize: 13, fontWeight: 700,
                    opacity: ((deployMode === 'upload' && !file) || (deployMode === 'github' && !githubRepo) || !siteName.trim() || isFetchingGithub) ? 0.4 : 1,
                    cursor: ((deployMode === 'upload' && !file) || (deployMode === 'github' && !githubRepo) || !siteName.trim() || isFetchingGithub) ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isFetchingGithub ? 'Fetching from GitHub...' : 'Deploy →'}
                </button>
              )}
            </>
          ) : (
            /* Deploy log */
            <div>
              {isRunning && (
                <div style={{ marginBottom: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: 'var(--text2)' }}>{phase === 'reading' ? 'Reading files...' : 'Uploading...'}</span>
                    <span style={{ fontSize: 12, color: 'var(--accent)', fontFamily: 'DM Mono, monospace' }}>{progress}%</span>
                  </div>
                  <div style={{ height: 4, background: 'var(--bg3)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: progress + '%', background: 'var(--accent)', borderRadius: 2, transition: 'width 0.3s' }} />
                  </div>
                </div>
              )}

              <div style={{
                background: '#0a0b0d', borderRadius: 'var(--radius)',
                padding: '16px', fontFamily: 'DM Mono, monospace',
                fontSize: 12, lineHeight: 1.8, maxHeight: 260, overflowY: 'auto',
                border: '1px solid var(--border)',
                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)',
                color: 'var(--text3)'
              }}>
                {log.map((l, i) => (
                  <div key={i} style={{
                    color: l.type === 'success' ? 'var(--accent)' : l.type === 'error' ? 'var(--red)' : 'var(--text2)',
                    display: 'flex', gap: 10
                  }}>
                    <span style={{ color: 'var(--text3)', userSelect: 'none' }}>~</span>
                    <span style={{ flex: 1, wordBreak: 'break-all' }}>{l.msg}</span>
                  </div>
                ))}

                {isRunning && <div style={{ color: 'var(--accent)', display: 'flex', gap: 10, marginTop: 4 }}>
                  <span>~</span>
                  <span className="blinking-cursor">_</span>
                </div>}
              </div>

              {isDone && (deployUrl || siteName) && (
                <div style={{ marginTop: 16, padding: '12px 14px', background: 'var(--accent-dim)', border: '1px solid rgba(61,255,192,0.2)', borderRadius: 'var(--radius)' }}>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <a href={deployUrl || `${window.location.origin}/site/${siteName}`} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ fontSize: 12, padding: '6px 12px' }}>
                      Visit
                    </a>
                    <button
                      onClick={onClose}
                      className="btn-secondary"
                      style={{ fontSize: 12, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                      Close
                    </button>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600, marginBottom: 6, marginTop: 12 }}>Your site is live at:</div>
                  <a href={deployUrl || `${window.location.origin}/site/${siteName}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: 'var(--accent)', fontFamily: 'DM Mono, monospace', wordBreak: 'break-all', textDecoration: 'none', fontWeight: 600 }}>
                    {deployUrl || `${window.location.origin}/site/${siteName}`}
                  </a>
                </div>
              )}

              {(isDone || phase === 'error') && (
                <button onClick={isDone ? onClose : reset} style={{
                  width: '100%', padding: '11px', marginTop: 14,
                  borderRadius: 'var(--radius)', border: 'none',
                  background: isDone ? 'var(--accent)' : 'var(--bg3)',
                  color: isDone ? '#0a0b0d' : 'var(--text)',
                  fontSize: 13, fontWeight: 700,
                }}>
                  {isDone ? 'Done' : 'Try again'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Section({ label, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>{label}</div>
      {children}
    </div>
  )
}

function StatusDot({ status }) {
  const color = { published: 'var(--accent)', building: 'var(--yellow)', failed: 'var(--red)', inactive: 'var(--text3)' }[status] || 'var(--text3)'
  return <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
}

function SkeletonCard() {
  return (
    <div style={{
      background: 'var(--bg2)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', padding: 18, width: 300,
      backgroundImage: 'linear-gradient(90deg, var(--bg2) 25%, var(--bg3) 50%, var(--bg2) 75%)',
      backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite',
    }}>
      <div style={{ height: 90, background: 'var(--bg3)', borderRadius: 6, marginBottom: 14 }} />
      <div style={{ height: 14, background: 'var(--bg3)', borderRadius: 4, marginBottom: 8, width: '60%' }} />
      <div style={{ height: 11, background: 'var(--bg3)', borderRadius: 4, width: '80%' }} />
    </div>
  )
}

function EmptyState({ onDeploy, isSearch }) {
  return (
    <div className="fade-up" style={{
      textAlign: 'center',
      padding: '80px 24px',
      background: 'var(--bg2)',
      border: '1px dashed var(--border2)',
      borderRadius: 'var(--radius-lg)'
    }}>
      <div style={{ fontSize: 48, marginBottom: 20 }}>{isSearch ? '🔍' : '🚀'}</div>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
        {isSearch ? 'No sites found' : 'No sites yet'}
      </h2>
      <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 24, maxWidth: 300, margin: '0 auto 24px' }}>
        {isSearch ? 'Try a different search term or clear the filter.' : 'Deploy your first project to see it here. It only takes a few seconds.'}
      </p>
      {!isSearch && (
        <button onClick={onDeploy} className="btn-primary" style={{ fontSize: 13, padding: '10px 24px' }}>
          Deploy Now
        </button>
      )}
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

function GithubIcon({ size = 16 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
}

// ─── GitHub Import Modal ────────────────────────────────────────────────────
function GithubImportModal({ onClose, onImport }) {
  const [repos, setRepos] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const { addToast } = useToast()

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.provider_token) {
          addToast('Please sign in with GitHub to access your repositories.', 'error')
          setLoading(false)
          return
        }

        const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100', {
          headers: {
            'Authorization': `token ${session.provider_token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        })

        if (!response.ok) throw new Error('Failed to fetch repositories')
        const data = await response.json()
        setRepos(data.map(r => ({
          name: r.name,
          full_name: r.full_name,
          lang: r.language || 'Unknown',
          stars: r.stargazers_count,
          url: r.html_url,
          default_branch: r.default_branch
        })))
      } catch (err) {
        addToast(err.message, 'error')
      } finally {
        setLoading(false)
      }
    }
    fetchRepos()
  }, [])

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="animate-reveal" style={{ background: 'var(--bg2)', width: '100%', maxWidth: 600, borderRadius: 24, border: '1px solid var(--border)', overflow: 'hidden' }}>
        <div style={{ padding: '32px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 4 }}>Import Repository</h2>
            <p style={{ fontSize: 13, color: 'var(--text3)' }}>{loading ? 'Connecting to GitHub...' : 'Connect your GitHub projects in seconds.'}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: 24 }}>×</button>
        </div>

        <div style={{ padding: '24px' }}>
          <div style={{ position: 'relative', marginBottom: 24 }}>
            <input
              type="text"
              placeholder="Search your repositories..."
              className="search-input"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 40 }}
            />
            <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 400, overflowY: 'auto' }}>
            {loading ? (
              [1, 2, 3].map(i => <div key={i} className="glass" style={{ height: 72, borderRadius: 16, animation: 'shimmer 1.5s infinite' }} />)
            ) : repos.filter(r => r.full_name.toLowerCase().includes(search.toLowerCase())).length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>No repositories found.</div>
            ) : (
              repos.filter(r => r.full_name.toLowerCase().includes(search.toLowerCase())).map(repo => (
                <div key={repo.full_name} className="glass card-hover" style={{ padding: '16px 20px', borderRadius: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <GithubIcon size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700 }}>{repo.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{repo.full_name} • {repo.lang}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => onImport(repo)}
                    className="btn-primary"
                    style={{ fontSize: 12, padding: '8px 16px' }}
                  >
                    Import
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Building Overlay ────────────────────────────────────────────────────────
function BuildingOverlay({ repo, onFinish }) {
  const [step, setStep] = useState(0)
  const steps = [
    { label: 'Initializing build pipeline...', dur: 1500 },
    { label: 'Cloning repository from GitHub...', dur: 2000 },
    { label: 'Analyzing project dependencies...', dur: 1500 },
    { label: 'Installing packages with npm...', dur: 3000 },
    { label: 'Compiling production bundle...', dur: 4000 },
    { label: 'Optimizing assets and static files...', dur: 2000 },
    { label: 'Deploying to edge network...', dur: 2000 },
    { label: 'Verifying deployment health...', dur: 1000 },
  ]

  useEffect(() => {
    let current = 0
    const runNext = () => {
      if (current < steps.length - 1) {
        setTimeout(() => {
          current++
          setStep(current)
          runNext()
        }, steps[current].dur)
      } else {
        setTimeout(onFinish, 1500)
      }
    }
    runNext()
  }, [])

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--bg)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 500, padding: 40 }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div className="spinner" style={{ width: 48, height: 48, marginBottom: 24, borderTopColor: 'var(--accent)' }} />
          <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8, letterSpacing: '-0.03em' }}>Deploying {repo.name}</h2>
          <p style={{ fontSize: 14, color: 'var(--text3)' }}>Pushing your code to the global edge...</p>
        </div>

        <div style={{ background: 'var(--bg2)', borderRadius: 20, border: '1px solid var(--border)', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', fontSize: 12, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Build Status
          </div>
          <div style={{ padding: '16px 0' }}>
            {steps.map((s, i) => (
              <div key={i} style={{
                padding: '12px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                opacity: i > step ? 0.2 : 1,
                transition: 'opacity 0.3s ease'
              }}>
                <div style={{
                  width: 18, height: 18, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: i < step ? 'var(--accent)' : (i === step ? 'var(--accent-dim)' : 'var(--bg3)'),
                  border: i === step ? '2px solid var(--accent)' : 'none'
                }}>
                  {i < step && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="4"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                  {i === step && <div className="spinner" style={{ width: 10, height: 10, borderTopColor: 'var(--accent)' }} />}
                </div>
                <span style={{ fontSize: 13, color: i === step ? 'var(--text)' : 'var(--text2)', fontWeight: i === step ? 600 : 400 }}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

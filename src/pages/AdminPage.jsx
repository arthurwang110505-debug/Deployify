import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../context/ToastContext'
import { supabase } from '../lib/supabase'
import { XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts'

export default function AdminPage() {
  const { user } = useAuth()
  const { addToast } = useToast()
  
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview') // overview, infra, governance, features

  // 🛡️ Strict Admin Check
  const isAdmin = user?.email === 'arthur0116.wang@gmail.com'

  useEffect(() => {
    if (isAdmin) {
      setTimeout(() => setLoading(false), 800) // Simulated load for the new heavy dashboard
    } else {
      setLoading(false)
    }
  }, [isAdmin])

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div className="spinner" style={{ width: 40, height: 40, marginBottom: 20, borderTopColor: 'var(--accent)' }} />
      <div style={{ color: 'var(--accent)', fontSize: 11, letterSpacing: '0.3em', fontWeight: 800, textTransform: 'uppercase', animation: 'pulse 2s infinite' }}>INITIALIZING PLATFORM COMMAND...</div>
    </div>
  )

  if (!isAdmin) {
    return (
      <div style={{ padding: 100, textAlign: 'center', minHeight: '100vh', background: 'var(--bg)' }}>
        <div style={{ fontSize: 80, marginBottom: 24 }}>🛑</div>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: 'var(--text)', marginBottom: 16 }}>Classified Level 5</h1>
        <p style={{ color: 'var(--text2)', maxWidth: 400, margin: '0 auto' }}>
          This terminal is restricted to platform engineers only.
        </p>
      </div>
    )
  }

  const isMobile = window.innerWidth <= 768

  return (
    <div style={{ minHeight: '100vh', background: '#050505', color: '#eaeaea' }}>
      <Helmet><title>SRE Console | Deployify</title></Helmet>

      {/* Top Navbar */}
      <div style={{ height: 60, borderBottom: '1px solid #222', display: 'flex', alignItems: 'center', padding: '0 24px', justifyContent: 'space-between', background: '#0a0a0a', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 24, height: 24, background: 'var(--accent)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 900, fontSize: 14 }}>D</div>
          <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.05em' }}>PLATFORM OPERATIONS</span>
          <span style={{ padding: '2px 8px', background: 'rgba(255, 60, 60, 0.1)', color: '#ff3c3c', borderRadius: 4, fontSize: 10, fontWeight: 800, letterSpacing: '0.1em' }}>GOD MODE</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, color: '#888' }}>{user.email}</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', minHeight: 'calc(100vh - 60px)' }}>
        
        {/* Sidebar */}
        <div style={{ width: isMobile ? '100%' : 260, borderRight: isMobile ? 'none' : '1px solid #222', borderBottom: isMobile ? '1px solid #222' : 'none', background: '#0a0a0a', padding: 20 }}>
          <div style={{ display: 'flex', flexDirection: isMobile ? 'row' : 'column', gap: 8, overflowX: isMobile ? 'auto' : 'visible' }}>
            <TabBtn id="overview" label="Global Overview" icon="🌍" active={activeTab} set={setActiveTab} />
            <TabBtn id="infra" label="Infrastructure" icon="⚡" active={activeTab} set={setActiveTab} />
            <TabBtn id="governance" label="Governance & Safety" icon="🛡️" active={activeTab} set={setActiveTab} />
            <TabBtn id="features" label="Feature Flags" icon="🎛️" active={activeTab} set={setActiveTab} />
          </div>
        </div>

        {/* Main Content Area */}
        <div style={{ flex: 1, padding: isMobile ? 20 : 40, overflowY: 'auto' }}>
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'infra' && <InfrastructureTab />}
          {activeTab === 'governance' && <GovernanceTab />}
          {activeTab === 'features' && <FeatureFlagsTab />}
        </div>
      </div>
    </div>
  )
}

function TabBtn({ id, label, icon, active, set }) {
  const isActive = active === id
  return (
    <button 
      onClick={() => set(id)}
      style={{ 
        display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '12px 16px', borderRadius: 8,
        background: isActive ? '#222' : 'transparent', border: 'none', cursor: 'pointer',
        color: isActive ? '#fff' : '#888', fontWeight: isActive ? 600 : 400,
        transition: 'all 0.2s', whiteSpace: 'nowrap'
      }}
    >
      <span style={{ fontSize: 16 }}>{icon}</span>
      <span style={{ fontSize: 13 }}>{label}</span>
    </button>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Overview Tab
// ─────────────────────────────────────────────────────────────────────────────
function OverviewTab() {
  const isMobile = window.innerWidth <= 768
  return (
    <div className="fade-in">
      <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>System Health</h2>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        <AdminStat title="Edge Nodes" value="142" status="Operational" color="#3dffc0" />
        <AdminStat title="Build Runners" value="84" status="2 Queued" color="#ffbd2e" />
        <AdminStat title="Global Requests/s" value="24.5k" status="+12%" color="#3dffc0" />
        <AdminStat title="Active Abuses" value="3" status="Action Required" color="#ff5f56" />
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap: 24 }}>
        <div style={{ background: '#111', border: '1px solid #222', borderRadius: 12, padding: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#888', marginBottom: 24, textTransform: 'uppercase' }}>Ingress Traffic (24h)</h3>
          <div style={{ height: 250 }}>
            {/* Mock Chart */}
            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(180deg, rgba(61, 255, 192, 0.1) 0%, transparent 100%)', borderBottom: '2px solid #3dffc0', position: 'relative' }}>
               <div style={{ position: 'absolute', bottom: 10, left: 10, fontSize: 10, color: '#3dffc0', fontFamily: 'DM Mono' }}>STABLE</div>
            </div>
          </div>
        </div>
        <div style={{ background: '#111', border: '1px solid #222', borderRadius: 12, padding: 24 }}>
           <h3 style={{ fontSize: 14, fontWeight: 700, color: '#888', marginBottom: 16, textTransform: 'uppercase' }}>Recent Incidents</h3>
           <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
             <Incident time="10m ago" level="warning" text="Elevated latency in AP-Northeast" />
             <Incident time="1h ago" level="error" text="DDoS mitigation triggered for site-x" />
             <Incident time="4h ago" level="info" text="Build runner pool auto-scaled (+10)" />
           </div>
        </div>
      </div>
    </div>
  )
}

function AdminStat({ title, value, status, color }) {
  return (
    <div style={{ background: '#111', border: '1px solid #222', borderRadius: 12, padding: 20 }}>
      <div style={{ fontSize: 11, color: '#888', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>{value}</div>
      <div style={{ fontSize: 11, color: color, fontWeight: 700 }}>{status}</div>
    </div>
  )
}

function Incident({ time, level, text }) {
  const color = level === 'error' ? '#ff5f56' : level === 'warning' ? '#ffbd2e' : '#3dffc0'
  return (
    <div style={{ padding: '12px 0', borderBottom: '1px solid #222' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
        <span style={{ fontSize: 10, color: '#666', fontFamily: 'DM Mono' }}>{time}</span>
      </div>
      <div style={{ fontSize: 13, color: '#ccc' }}>{text}</div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Infrastructure Tab
// ─────────────────────────────────────────────────────────────────────────────
function InfrastructureTab() {
  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800 }}>Infrastructure & Orchestration</h2>
        <button className="btn-secondary" style={{ fontSize: 12, padding: '6px 12px', background: '#111', border: '1px solid #333' }}>Deploy New Runner</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        
        {/* Node Map Simulation */}
        <div style={{ background: '#111', border: '1px solid #222', borderRadius: 12, padding: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#888', marginBottom: 16 }}>Edge Network Nodes</h3>
          <table style={{ width: '100%', fontSize: 12, textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ color: '#666', borderBottom: '1px solid #222' }}>
                <th style={{ paddingBottom: 8 }}>Region</th>
                <th style={{ paddingBottom: 8 }}>Status</th>
                <th style={{ paddingBottom: 8 }}>Load</th>
                <th style={{ paddingBottom: 8 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {['us-east (iad1)', 'us-west (pdx1)', 'eu-central (fra1)', 'ap-northeast (hnd1)'].map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #1a1a1a' }}>
                  <td style={{ padding: '12px 0', fontFamily: 'DM Mono', color: '#fff' }}>{r}</td>
                  <td style={{ padding: '12px 0', color: '#3dffc0' }}>Healthy</td>
                  <td style={{ padding: '12px 0' }}><div style={{ width: '60%', height: 4, background: '#222', borderRadius: 2 }}><div style={{ width: `${Math.random()*80}%`, height: '100%', background: '#3dffc0' }}/></div></td>
                  <td style={{ padding: '12px 0' }}><button style={{ background: 'none', border: '1px solid #333', color: '#888', borderRadius: 4, padding: '2px 8px', fontSize: 10, cursor: 'pointer' }}>Drain</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Build Queue */}
        <div style={{ background: '#111', border: '1px solid #222', borderRadius: 12, padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#888' }}>Live Build Queue</h3>
            <span style={{ fontSize: 10, background: 'rgba(255, 189, 46, 0.1)', color: '#ffbd2e', padding: '2px 6px', borderRadius: 4 }}>2 Active, 1 Queued</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <BuildJob repo="acme-corp/frontend" status="building" time="1m 24s" />
            <BuildJob repo="personal-blog" status="building" time="45s" />
            <BuildJob repo="ecommerce-api" status="queued" time="Waiting for runner" />
          </div>
        </div>
      </div>
    </div>
  )
}

function BuildJob({ repo, status, time }) {
  return (
    <div style={{ background: '#1a1a1a', padding: 12, borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 4 }}>{repo}</div>
        <div style={{ fontSize: 11, color: '#666', fontFamily: 'DM Mono' }}>{time}</div>
      </div>
      {status === 'building' ? (
        <div className="spinner" style={{ width: 14, height: 14, borderTopColor: '#3dffc0' }} />
      ) : (
        <span style={{ fontSize: 10, color: '#ffbd2e' }}>QUEUED</span>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Governance Tab
// ─────────────────────────────────────────────────────────────────────────────
function GovernanceTab() {
  return (
    <div className="fade-in">
      <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>User & Project Governance</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
        {/* Abuse Detection Radar */}
        <div style={{ background: '#111', border: '1px solid #222', borderRadius: 12, padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#ff5f56', display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontSize: 18 }}>🚨</span> Abuse & Fraud Radar</h3>
          </div>
          <table style={{ width: '100%', fontSize: 13, textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ color: '#666', borderBottom: '1px solid #222' }}>
                <th style={{ paddingBottom: 8 }}>Suspect Project</th>
                <th style={{ paddingBottom: 8 }}>Reason Triggered</th>
                <th style={{ paddingBottom: 8 }}>Risk Score</th>
                <th style={{ paddingBottom: 8, textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #1a1a1a' }}>
                <td style={{ padding: '16px 0', color: '#fff' }}>crypto-airdrop-free.deployify.app</td>
                <td style={{ padding: '16px 0', color: '#888' }}>Keyword match: "airdrop", "free" + rapid traffic spike</td>
                <td style={{ padding: '16px 0', color: '#ff5f56', fontWeight: 700 }}>98/100</td>
                <td style={{ padding: '16px 0', textAlign: 'right' }}>
                  <button style={{ background: '#ff5f56', color: '#000', border: 'none', padding: '6px 16px', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Suspend Immediately</button>
                </td>
              </tr>
              <tr>
                <td style={{ padding: '16px 0', color: '#fff' }}>test-phish-login.deployify.app</td>
                <td style={{ padding: '16px 0', color: '#888' }}>Heuristic: Fake login form detected in payload</td>
                <td style={{ padding: '16px 0', color: '#ffbd2e', fontWeight: 700 }}>75/100</td>
                <td style={{ padding: '16px 0', textAlign: 'right' }}>
                  <button style={{ background: '#333', color: '#fff', border: 'none', padding: '6px 16px', borderRadius: 6, fontSize: 11, cursor: 'pointer' }}>Review Code</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Shadow Management / God View */}
        <div style={{ background: '#111', border: '1px solid #222', borderRadius: 12, padding: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#888', marginBottom: 8 }}>Shadow Management (God View)</h3>
          <p style={{ fontSize: 12, color: '#666', marginBottom: 16 }}>Access restricted project logs and environment variables for support purposes without requiring user passwords.</p>
          
          <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
            <input type="text" placeholder="Enter Project ID or URL..." style={{ flex: 1, padding: '10px 14px', background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: 8, fontSize: 13 }} />
            <button style={{ padding: '10px 20px', background: '#333', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>Enter Shadow Mode</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Feature Flags Tab
// ─────────────────────────────────────────────────────────────────────────────
function FeatureFlagsTab() {
  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Feature Flags & Canary Rolls</h2>
          <p style={{ fontSize: 13, color: '#888' }}>Control global feature rollouts and A/B tests.</p>
        </div>
        <button className="btn-primary" style={{ fontSize: 12, padding: '8px 16px' }}>+ Create Flag</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <FeatureFlag name="enable_new_builder_v2" desc="Routes builds to the Rust-based compiler" status="Rolling Out" percentage={15} />
        <FeatureFlag name="beta_analytics_ui" desc="Enables the new Insights dashboard" status="Active" percentage={100} />
        <FeatureFlag name="ddos_strict_mode" desc="Aggressive rate limiting across all edge nodes" status="Disabled" percentage={0} />
      </div>
    </div>
  )
}

function FeatureFlag({ name, desc, status, percentage }) {
  const isEnabled = percentage > 0
  return (
    <div style={{ background: '#111', border: '1px solid #222', borderRadius: 12, padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#fff', fontFamily: 'DM Mono' }}>{name}</span>
          <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: isEnabled ? 'rgba(61, 255, 192, 0.1)' : 'rgba(255, 255, 255, 0.1)', color: isEnabled ? '#3dffc0' : '#888' }}>{status}</span>
        </div>
        <div style={{ fontSize: 13, color: '#666' }}>{desc}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <span style={{ fontSize: 11, color: '#888' }}>Rollout</span>
          <span style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>{percentage}%</span>
        </div>
        {/* Toggle UI Mock */}
        <div style={{ width: 44, height: 24, borderRadius: 12, background: isEnabled ? 'var(--accent)' : '#333', position: 'relative', cursor: 'pointer' }}>
          <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: isEnabled ? 22 : 2, transition: 'all 0.2s' }} />
        </div>
      </div>
    </div>
  )
}

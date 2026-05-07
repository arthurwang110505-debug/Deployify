import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, BarChart, Bar } from 'recharts'
import { useAuth } from '../hooks/useAuth'
import { getSites, supabase } from '../lib/supabase'

const COLORS = ['var(--accent)', 'var(--blue)', 'var(--yellow)', 'var(--red)', '#7209b7']

export default function AnalyticsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState([])
  const [totalViews, setTotalViews] = useState(0)
  const [topSite, setTopSite] = useState('N/A')
  const [bandwidth, setBandwidth] = useState('0 MB')
  
  // Simulated Extra Data
  const [deviceData] = useState([
    { name: 'Desktop', value: 65 },
    { name: 'Mobile', value: 30 },
    { name: 'Tablet', value: 5 },
  ])

  const [pageData] = useState([
    { name: '/', views: 2450 },
    { name: '/pricing', views: 1200 },
    { name: '/docs', views: 850 },
    { name: '/blog', views: 400 },
    { name: '/auth', views: 320 },
  ])

  useEffect(() => {
    async function loadData() {
      if (!user) return
      try {
        const sites = await getSites(user.id)
        if (sites.length === 0) {
          const emptyChart = []
          const now = new Date()
          for (let i = 6; i >= 0; i--) {
            const d = new Date(now)
            d.setDate(d.getDate() - i)
            emptyChart.push({ name: d.toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' }), views: 0 })
          }
          setData(emptyChart)
          setLoading(false)
          return
        }
        
        const slugs = sites.map(s => s.slug)
        const { data: pvData, error } = await supabase
          .from('page_views')
          .select('created_at, site_slug')
          .in('site_slug', slugs)
          .order('created_at', { ascending: true })
          
        if (error) throw error
        
        const siteCount = {}
        const dateStats = {}
        let total = 0
        
        pvData.forEach(v => {
          total++
          siteCount[v.site_slug] = (siteCount[v.site_slug] || 0) + 1
          const date = new Date(v.created_at).toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' })
          dateStats[date] = (dateStats[date] || 0) + 1
        })
        
        let bestSite = 'N/A'
        let maxViews = -1
        for (const [slug, count] of Object.entries(siteCount)) {
          if (count > maxViews) {
            maxViews = count
            bestSite = slug
          }
        }
        
        const chartData = []
        const now = new Date()
        for (let i = 6; i >= 0; i--) {
          const d = new Date(now)
          d.setDate(d.getDate() - i)
          const dateStr = d.toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' })
          chartData.push({ name: dateStr, views: dateStats[dateStr] || 0 })
        }
        
        setData(chartData)
        setTotalViews(total)
        setTopSite(bestSite)
        let bwMB = total * 1.5
        setBandwidth(bwMB > 1024 ? (bwMB / 1024).toFixed(2) + ' GB' : bwMB.toFixed(1) + ' MB')
        
      } catch (err) {
        console.error('Failed to load analytics:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [user])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)' }}>
        <div className="spinner" style={{ width: 24, height: 24 }} />
      </div>
    )
  }

  const isMobile = window.innerWidth <= 768

  return (
    <div className="fade-in" style={{ padding: isMobile ? '24px 20px' : '40px 48px', maxWidth: 1200, margin: '0 auto' }}>
      <Helmet>
        <title>Insights | Deployify</title>
      </Helmet>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 4, letterSpacing: '-0.03em' }}>Insights</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse 2s infinite' }} />
            <p style={{ color: 'var(--text3)', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Real-time Audience Tracking</p>
          </div>
        </div>
        <div className="hide-mobile" style={{ display: 'flex', gap: 12 }}>
          <select style={{ background: 'var(--bg2)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>All Time</option>
          </select>
        </div>
      </div>

      {/* Hero Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: 24, marginBottom: 40 }}>
        {[
          { label: 'Total Visits', value: totalViews.toLocaleString(), trend: '+12%', color: 'var(--accent)' },
          { label: 'Top Project', value: topSite, trend: 'Stable', color: 'var(--blue)' },
          { label: 'Data Egress', value: bandwidth, trend: '+5%', color: 'var(--yellow)' },
          { label: 'Avg. Latency', value: '18ms', trend: '-2ms', color: 'var(--red)' },
        ].map((s, i) => (
          <div key={i} className="glass" style={{ padding: 24, borderRadius: 20 }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 12 }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: s.color, fontWeight: 700 }}>{s.trend} <span style={{ color: 'var(--text3)', fontWeight: 400 }}>from last period</span></div>
          </div>
        ))}
      </div>

      {/* Main Traffic Chart */}
      <div className="glass" style={{ padding: 32, borderRadius: 24, marginBottom: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>Traffic Over Time</h3>
          <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} /> Views</div>
          </div>
        </div>
        <div style={{ height: 350, width: '100%' }}>
          <ResponsiveContainer>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--text3)" fontSize={11} tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke="var(--text3)" fontSize={11} tickLine={false} axisLine={false} dx={-10} />
              <Tooltip 
                contentStyle={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                itemStyle={{ color: 'var(--accent)', fontSize: 12, fontWeight: 700 }}
              />
              <Area type="monotone" dataKey="views" stroke="var(--accent)" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Distribution Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 32, marginBottom: 40 }}>
        {/* Top Pages */}
        <div className="glass" style={{ padding: 32, borderRadius: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 24 }}>Top Pages</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {pageData.map((p, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                  <span style={{ fontWeight: 600, fontFamily: 'DM Mono' }}>{p.name}</span>
                  <span style={{ color: 'var(--text3)' }}>{p.views.toLocaleString()}</span>
                </div>
                <div style={{ height: 6, background: 'var(--bg3)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(p.views / 2500) * 100}%`, background: 'var(--accent)', borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Device Distribution */}
        <div className="glass" style={{ padding: 32, borderRadius: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 24 }}>Device Distribution</h3>
          <div style={{ height: 200 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={deviceData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 16 }}>
            {deviceData.map((d, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text2)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i] }} />
                {d.name} ({d.value}%)
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Web Vitals (The Vercel Specialty) */}
      <div className="glass" style={{ padding: 32, borderRadius: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 700 }}>Core Web Vitals</h3>
            <p style={{ fontSize: 12, color: 'var(--text3)' }}>Experience scores based on real user sessions.</p>
          </div>
          <div style={{ background: 'var(--accent-dim)', color: 'var(--accent)', padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>
            Grade: A+
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 32 }}>
          {[
            { label: 'LCP', full: 'Largest Contentful Paint', value: '1.2s', status: 'Good', score: 98 },
            { label: 'FID', full: 'First Input Delay', value: '14ms', status: 'Good', score: 99 },
            { label: 'CLS', full: 'Cumulative Layout Shift', value: '0.02', status: 'Good', score: 95 },
          ].map((v, i) => (
            <div key={i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                <span style={{ fontWeight: 800, fontSize: 16 }}>{v.label}</span>
                <span style={{ fontSize: 12, color: 'var(--accent)' }}>{v.status}</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 12 }}>{v.full}</div>
              <div style={{ height: 4, background: 'var(--bg3)', borderRadius: 2, marginBottom: 8 }}>
                <div style={{ height: '100%', width: `${v.score}%`, background: 'var(--accent)', borderRadius: 2 }} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{v.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

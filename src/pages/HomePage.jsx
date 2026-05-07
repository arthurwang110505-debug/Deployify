import React, { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '../hooks/useAuth'
import PublicLayout from '../components/PublicLayout'

export default function HomePage() {
  const { user, loading } = useAuth()
  const isMobile = window.innerWidth <= 768
  
  if (!loading && user) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <PublicLayout>
      <div style={{ background: 'var(--bg)', color: 'var(--text)', overflowX: 'hidden' }}>
        <Helmet>
          <title>Deployify — The Next-Gen Web Hosting Platform</title>
          <meta name="description" content="Deploy your web apps in seconds with our high-performance frontend platform and global edge network." />
          <link rel="canonical" href="https://deployify-wheat.vercel.app/" />
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Deployify",
              "url": "https://deployify-wheat.vercel.app",
              "applicationCategory": "DeveloperApplication",
              "operatingSystem": "Web",
              "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
            })}
          </script>
        </Helmet>

        {/* Hero Section */}
        <section style={{ 
          padding: isMobile ? '80px 0 60px' : '140px 0 100px', 
          background: 'radial-gradient(circle at 50% -20%, var(--accent-dim) 0%, transparent 50%)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div className="section-container" style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1.2fr) minmax(0, 1fr)', 
            gap: isMobile ? 40 : 60, 
            alignItems: 'center' 
          }}>
            <div className="fade-up" style={{ textAlign: isMobile ? 'center' : 'left' }}>
              <div style={{ 
                display: 'inline-flex', alignItems: 'center', gap: 8, 
                padding: '6px 12px', background: 'var(--bg3)', 
                borderRadius: 20, border: '1px solid var(--border)',
                marginBottom: 24, fontSize: 12, fontWeight: 600, color: 'var(--accent)'
              }}>
                <span style={{ display: 'inline-block', width: 6, height: 6, background: 'var(--accent)', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
                CLI v1.0.3 is now live
              </div>
              <h1 style={{ 
                fontSize: isMobile ? 42 : 'clamp(40px, 6vw, 84px)', 
                fontWeight: 900, 
                lineHeight: 1.05, 
                letterSpacing: '-0.04em',
                marginBottom: 24
              }}>
                Ship at the speed of <span className="text-gradient">thought.</span>
              </h1>
              <p style={{ 
                fontSize: isMobile ? 18 : 22, 
                color: 'var(--text2)', 
                lineHeight: 1.6, 
                marginBottom: 40,
                maxWidth: isMobile ? '100%' : 540,
                margin: isMobile ? '0 auto 40px' : '0 0 40px 0'
              }}>
                The high-performance platform for static hosting. <br className="hide-mobile" />
                Deploy globally in <span style={{ color: 'var(--text)' }}>24ms</span> with zero configuration.
              </p>
              <div style={{ 
                display: 'flex', 
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: isMobile ? 'center' : 'flex-start', 
                gap: 16 
              }}>
                <Link to="/auth" className="btn-primary" style={{ padding: '16px 36px', fontSize: 17, justifyContent: 'center' }}>
                  Start Deploying
                </Link>
                <Link to="/docs" className="btn-secondary" style={{ padding: '16px 36px', fontSize: 17, justifyContent: 'center' }}>
                  Read Documentation
                </Link>
              </div>
            </div>

            <div className="fade-up-2" style={{ position: 'relative', maxWidth: isMobile ? '100%' : 1000, margin: '0 auto' }}>
              {/* Background Glow Effect */}
              <div style={{ 
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: isMobile ? '100%' : '120%', height: isMobile ? '100%' : '120%', 
                background: 'radial-gradient(circle, var(--accent-dim) 0%, transparent 70%)',
                opacity: 0.5, zIndex: -1, filter: 'blur(60px)'
              }} />

              <div className="animate-float" style={{
                background: 'var(--bg2)',
                borderRadius: isMobile ? 16 : 24,
                padding: '1px',
                border: '1px solid var(--border)',
                boxShadow: '0 40px 100px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
                overflow: 'hidden',
                position: 'relative'
              }}>
                {/* Window Header */}
                <div style={{ 
                  height: isMobile ? 32 : 40, background: 'var(--bg3)', borderBottom: '1px solid var(--border)', 
                  display: 'flex', alignItems: 'center', padding: '0 16px', gap: 8 
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff5f56' }} />
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ffbd2e' }} />
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#27c93f' }} />
                  <div style={{ flex: 1, textAlign: 'center', fontSize: isMobile ? 10 : 11, color: 'var(--text3)', fontWeight: 600, marginRight: 42 }}>
                    deployify.app — Dashboard
                  </div>
                </div>

                {/* Main Image */}
                <img 
                  src="/hero_terminal_mockup.png" 
                  alt="Deployify Terminal Interface" 
                  style={{ width: '100%', display: 'block', height: 'auto' }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section style={{ padding: isMobile ? '60px 0' : '100px 0', borderTop: '1px solid var(--border)' }}>
          <div className="section-container">
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <h2 style={{ fontSize: isMobile ? 28 : 40, fontWeight: 800, marginBottom: 16 }}>Everything you need to ship.</h2>
              <p style={{ color: 'var(--text2)', fontSize: 16 }}>Experience the fastest workflow on the planet.</p>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', 
              gap: 24 
            }}>
              {[
                { title: 'Global Edge Network', desc: 'Your apps are always close to your users, delivered from the edge.', icon: '🌍' },
                { title: 'Instant Rollbacks', desc: 'Made a mistake? Revert to any previous version in one click.', icon: '🔙' },
                { title: 'Git-based Workflow', desc: 'Connect your GitHub repo and we take care of the rest.', icon: '🌿' },
                { title: 'Custom Domains', desc: 'Automatic SSL and easy DNS management for all your domains.', icon: '🔗' },
                { title: 'Real-time Analytics', desc: 'Track your traffic and performance in real-time with insights.', icon: '📊' },
                { title: 'Team Collaboration', desc: 'Invite your teammates and work together on projects.', icon: '👥' },
              ].map((f, i) => (
                <div key={i} className="glass card-hover" style={{ padding: 32, borderRadius: 24 }}>
                  <div style={{ fontSize: 32, marginBottom: 20 }}>{f.icon}</div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>{f.title}</h3>
                  <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Animated Social Proof */}
        <section style={{ padding: '60px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.01)', overflow: 'hidden' }}>
          <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 40, textAlign: 'center' }}>
            Powering the next generation of web builders
          </div>
          <div className="animate-marquee">
            {[...Array(2)].map((_, group) => (
              <div key={group} style={{ display: 'flex', alignItems: 'center', gap: 80, paddingRight: 80 }}>
                {['LOGOTYPE', 'STACK', 'ORBIT', 'PULSE', 'NEXUS', 'PRISM', 'QUANTUM', 'VERTEX'].map((l, i) => (
                  <span key={i} style={{ fontSize: 24, fontWeight: 900, color: 'var(--text2)', opacity: 0.4, letterSpacing: '0.1em' }}>{l}</span>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" style={{ padding: isMobile ? '60px 0' : '120px 0' }}>
          <div className="section-container">
            <div style={{ textAlign: 'center', marginBottom: isMobile ? 40 : 80 }} className="fade-up">
              <h2 style={{ fontSize: isMobile ? 28 : 48, fontWeight: 900, marginBottom: 16, letterSpacing: '-0.02em' }}>Everything you need to ship.</h2>
              <p style={{ color: 'var(--text2)', fontSize: isMobile ? 16 : 19 }}>Powering your sites with high-performance infrastructure.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
              {[
                { title: 'Global Edge Network', desc: 'Your content is distributed across our worldwide storage nodes for sub-millisecond delivery.', icon: <GlobeIcon /> },
                { title: 'CLI First Workflow', desc: 'Deploy entire directories with a single command. Built for developers who love the terminal.', icon: <TerminalIcon /> },
                { title: 'GitHub Integration', desc: 'Connect your repositories and deploy instantly without leaving your workflow.', icon: <GithubIcon /> },
                { title: 'Free SSL Certificates', desc: "Every site gets automatic SSL encryption via Let's Encrypt. Secure by default.", icon: <ShieldIcon /> },
                { title: 'Instant Rollbacks', desc: 'Mistake? No problem. Revert to any previous deployment with a single click.', icon: <HistoryIcon /> },
                { title: 'Real-time Analytics', desc: 'Monitor your site traffic with our built-in, privacy-friendly analytics engine.', icon: <BarChartIcon /> }
              ].map((f, i) => (
                <div key={i} className="glass card-hover fade-up" style={{ padding: isMobile ? 24 : 40, borderRadius: 24, border: '1px solid var(--border)' }}>
                  <div style={{ color: 'var(--accent)', marginBottom: 24 }}>{f.icon}</div>
                  <h3 style={{ fontSize: isMobile ? 16 : 20, fontWeight: 700, marginBottom: 12 }}>{f.title}</h3>
                  <p style={{ color: 'var(--text2)', lineHeight: 1.6, fontSize: 15 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Dashboard Analytics Showcase */}
        <section style={{ padding: isMobile ? '60px 0' : '120px 0', background: 'var(--bg2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
          <div className="section-container" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.1fr 1fr', gap: isMobile ? 40 : 100, alignItems: 'center' }}>
            <div className="fade-up">
              <img 
                src="/analytics_mockup.png" 
                alt="Deployify Analytics Dashboard showing traffic charts and performance metrics" 
                loading="lazy"
                style={{ width: '100%', borderRadius: isMobile ? 16 : 24, boxShadow: '0 40px 80px rgba(0,0,0,0.4)', border: '1px solid var(--border2)' }} 
              />
            </div>
            <div className="fade-up-2">
              <h2 className="text-gradient" style={{ fontSize: isMobile ? 28 : 48, fontWeight: 900, marginBottom: 24, letterSpacing: '-0.02em' }}>Insight at your fingertips.</h2>
              <p style={{ color: 'var(--text2)', fontSize: isMobile ? 16 : 19, lineHeight: 1.8, marginBottom: 32 }}>
                All your analytics. Zero third-party tracking. Understand your traffic, monitor edge latency, and stay GDPR-compliant — without leaving the dashboard.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                <div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--accent)', marginBottom: 8 }}>24ms</div>
                  <div style={{ fontSize: 13, color: 'var(--text3)', fontWeight: 600 }}>AVG RESPONSE TIME</div>
                </div>
                <div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--accent)', marginBottom: 8 }}>99.99%</div>
                  <div style={{ fontSize: 13, color: 'var(--text3)', fontWeight: 600 }}>EDGE AVAILABILITY</div>
                </div>
              </div>
            </div>
          </div>
        </section>

      {/* Testimonials Marquee */}
      <section style={{ padding: '120px 0', overflow: 'hidden' }}>
        <div className="section-container" style={{ textAlign: 'center', marginBottom: 64 }}>
          <h2 className="text-gradient" style={{ fontSize: 40, fontWeight: 900, marginBottom: 16 }}>Loved by developers worldwide.</h2>
          <p style={{ color: 'var(--text2)', fontSize: 18 }}>Joining thousands of creators shipping faster with Deployify.</p>
        </div>
        
        <div className="animate-marquee" style={{ animationDuration: '60s' }}>
          {[...Array(2)].map((_, group) => (
            <div key={group} style={{ display: 'flex', gap: 32, paddingRight: 32 }}>
              {[
                { name: 'Sarah Chen', role: 'Lead Frontend', text: 'Deployify is exactly what I was looking for. No fluff, just fast.', color: '#3dffc0' },
                { name: 'Alex Rivera', role: 'Fullstack Dev', text: 'The CLI is a game changer. One command and it is live.', color: '#5b9bff' },
                { name: 'Marcus Holm', role: 'Designer', text: 'Cleanest dashboard I have ever used. Finally, a tool that respects DX.', color: '#ffc84a' },
                { name: 'Elena Vance', role: 'CTO @ Nexus', text: 'Our build times dropped by 70% after switching to Deployify Edge.', color: '#ff5b5b' },
                { name: 'David Kim', role: 'Indie Hacker', text: 'Pricing is transparent and performance is unbeatable. 10/10.', color: '#3dffc0' }
              ].map((t, i) => (
                <div key={i} className="glass" style={{ width: 420, padding: 40, borderRadius: 32, border: '1px solid var(--border)' }}>
                  <p style={{ fontSize: 17, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 32 }}>"{t.text}"</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#000', fontSize: 18 }}>{t.name[0]}</div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: 16, fontWeight: 700 }}>{t.name}</div>
                      <div style={{ fontSize: 13, color: 'var(--text3)' }}>{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

        {/* Pricing Section */}
        <section id="pricing" style={{ padding: isMobile ? '60px 0' : '120px 0', borderTop: '1px solid var(--border)' }}>
          <div className="section-container">
            <div style={{ textAlign: 'center', marginBottom: isMobile ? 40 : 80 }}>
              <h2 style={{ fontSize: isMobile ? 28 : 48, fontWeight: 900, marginBottom: 16 }}>Simple, predictable pricing.</h2>
              <p style={{ color: 'var(--text2)', fontSize: isMobile ? 16 : 19 }}>Scale from side projects to enterprise organizations.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32 }}>
              {[
                { name: 'Starter', price: '$0', desc: 'Perfect for hobbyists.', features: ['3 Active Sites', '1GB Storage', 'Standard Edge Network', 'Community Support'] },
                { name: 'Pro', price: '$19', desc: 'For professional developers.', features: ['Unlimited Sites', '10GB Storage', 'Priority Edge Routing', 'Advanced Analytics', 'Custom Domains'], active: true },
                { name: 'Enterprise', price: 'Custom', desc: 'For large organizations.', features: ['Dedicated Support', 'Custom SLA', 'SSO/SAML Integration', 'Unlimited Team Members'] }
              ].map((p, i) => (
                <div key={i} className="glass" style={{ 
                  padding: isMobile ? 32 : 48, borderRadius: 32, 
                  border: p.active ? '1px solid var(--accent)' : '1px solid var(--border)',
                  background: p.active ? 'var(--accent-dim2)' : 'transparent',
                  position: 'relative'
                }}>
                  {p.active && <div style={{ position: 'absolute', top: 20, right: 20, background: 'var(--accent)', color: '#000', fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 20 }}>MOST POPULAR</div>}
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>{p.name}</div>
                  <div style={{ fontSize: 48, fontWeight: 900, marginBottom: 12 }}>{p.price}<span style={{ fontSize: 16, color: 'var(--text3)', fontWeight: 500 }}>{p.price !== 'Custom' && '/mo'}</span></div>
                  <p style={{ color: 'var(--text3)', marginBottom: 40, fontSize: 15 }}>{p.desc}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 48 }}>
                    {p.features.map((f, j) => (
                      <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, color: 'var(--text2)' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        {f}
                      </div>
                    ))}
                  </div>
                  <Link to="/auth" className={p.active ? 'btn-primary' : 'btn-secondary'} style={{ width: '100%', textAlign: 'center', display: 'block', padding: '14px' }}>
                    {p.name === 'Enterprise' ? 'Contact Sales' : p.name === 'Starter' ? 'Start Free — No Credit Card' : 'Get Started'}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section style={{ padding: isMobile ? '60px 0' : '120px 0' }}>
          <div className="section-container" style={{ textAlign: 'center' }}>
            <div className="glass" style={{ padding: isMobile ? '60px 24px' : '100px 40px', borderRadius: isMobile ? 32 : 48, background: 'linear-gradient(135deg, var(--bg3) 0%, var(--bg) 100%)', border: '1px solid var(--border)' }}>
              <h2 style={{ fontSize: isMobile ? 28 : 48, fontWeight: 900, marginBottom: 24, letterSpacing: '-0.03em' }}>Ready to ship your next big idea?</h2>
              <p style={{ color: 'var(--text2)', fontSize: isMobile ? 16 : 20, marginBottom: 48, maxWidth: 600, margin: '0 auto 48px', lineHeight: 1.6 }}>
                Join the future of deployment. Simple, fast, and secure hosting for every developer.
              </p>
              <Link to="/auth" className="btn-primary" style={{ padding: isMobile ? '14px 32px' : '18px 48px', fontSize: isMobile ? 16 : 18 }}>
                Start Deploying Free
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  )
}

function GlobeIcon() {
  return <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
}
function TerminalIcon() {
  return <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>
}
function GithubIcon() {
  return <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
}
function ShieldIcon() {
  return <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
}
function HistoryIcon() {
  return <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline><path d="M3.3 7a9 9 0 1 1-1 4.9"></path><polyline points="1 7 5 7 5 3"></polyline></svg>
}
function BarChartIcon() {
  return <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
}

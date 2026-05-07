import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import PublicLayout from '../components/PublicLayout'
import { POSTS } from '../data/blogData'

export default function BlogPage() {
  const [search, setSearch] = useState('')

  return (
    <PublicLayout>
      <Helmet>
        <title>Blog | Deployify Insights & Engineering</title>
        <meta name="description" content="Stay updated with the latest in static site deployment, web performance, and developer tools. Read our engineering blog and tutorials." />
        <meta property="og:title" content="Deployify Blog" />
        <meta property="og:description" content="Technical guides and platform updates from the Deployify team." />
      </Helmet>
      <div className="section-container" style={{ padding: '80px 0' }}>
        <div className="fade-up" style={{ marginBottom: 64, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 24 }}>
          <div>
            <h1 className="text-gradient" style={{ fontSize: 48, fontWeight: 700, marginBottom: 16 }}>Deployify Blog</h1>
            <p style={{ color: 'var(--text2)', fontSize: 18 }}>Engineering insights, tutorials, and product updates.</p>
          </div>
          
          <div style={{ position: 'relative', width: '100%', maxWidth: 320 }}>
            <input 
              type="text" 
              placeholder="Search articles..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px 12px 40px',
                background: 'var(--bg2)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                color: 'var(--text)',
                fontSize: 14
              }}
            />
            <svg style={{ position: 'absolute', left: 14, top: 14, color: 'var(--text3)' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 32 }}>
          {POSTS.filter(p => 
            p.title.toLowerCase().includes(search.toLowerCase()) || 
            p.excerpt.toLowerCase().includes(search.toLowerCase())
          ).map((post, i) => (
            <Link to={`/blog/${post.slug}`} key={post.slug} style={{ textDecoration: 'none' }}>
              <div className={`glass fade-up-${i+2}`} style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ height: 200, background: 'var(--bg3)', position: 'relative' }}>
                  <img 
                  src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80" 
                  alt={`Cover image for: ${post.title}`} 
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} 
                />
                  <div style={{ 
                    position: 'absolute', 
                    top: 16, 
                    left: 16, 
                    padding: '4px 10px', 
                    background: 'var(--accent)', 
                    color: 'var(--bg)', 
                    fontSize: 10, 
                    fontWeight: 800, 
                    borderRadius: 4,
                    textTransform: 'uppercase'
                  }}>
                    {post.category}
                  </div>
                </div>
                <div style={{ padding: 24, flex: 1 }}>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 12 }}>{post.date}</div>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 12, lineHeight: 1.4 }}>{post.title}</h2>
                  <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 20 }}>{post.excerpt}</p>
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
                    {post.tags.map(tag => (
                      <span key={tag} style={{ 
                        fontSize: 10, 
                        color: 'var(--text3)', 
                        background: 'var(--bg3)', 
                        padding: '2px 8px', 
                        borderRadius: 4,
                        border: '1px solid var(--border)'
                      }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <div style={{ 
                    color: 'var(--accent)', 
                    fontSize: 13, 
                    fontWeight: 600, 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}>
                    Read more
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </PublicLayout>
  )
}

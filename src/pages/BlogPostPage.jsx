import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import ReactMarkdown from 'react-markdown'
import PublicLayout from '../components/PublicLayout'
import { POSTS } from '../data/blogData'

export default function BlogPostPage() {
  const { slug } = useParams()
  const post = POSTS.find(p => p.slug === slug)

  if (!post) {
    return (
      <PublicLayout>
        <div className="section-container" style={{ padding: '120px 0', textAlign: 'center' }}>
          <h1 style={{ color: 'var(--text)' }}>Post Not Found</h1>
          <Link to="/blog" style={{ color: 'var(--accent)', marginTop: 20, display: 'inline-block' }}>Back to Blog</Link>
        </div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      <Helmet>
        <title>{post.title} | Deployify Blog</title>
        <meta name="description" content={post.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
      </Helmet>
      <article className="section-container" style={{ padding: '80px 0', maxWidth: 800 }}>
        <Link to="/blog" style={{ 
          display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text3)', 
          textDecoration: 'none', fontSize: 14, marginBottom: 32, transition: 'color 0.2s'
        }} onMouseOver={e => e.target.style.color = 'var(--accent)'} onMouseOut={e => e.target.style.color = 'var(--text3)'}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Back to Blog
        </Link>

        <div className="fade-up" style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase' }}>{post.category}</span>
            <span style={{ fontSize: 12, color: 'var(--text3)' }}>•</span>
            <span style={{ fontSize: 12, color: 'var(--text3)' }}>{post.date}</span>
          </div>
          <h1 style={{ fontSize: 48, fontWeight: 800, color: 'var(--text)', lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 24 }}>
            {post.title}
          </h1>
          <div style={{ display: 'flex', gap: 8 }}>
            {post.tags.map(tag => (
              <span key={tag} style={{ fontSize: 12, color: 'var(--text3)', background: 'var(--bg2)', padding: '4px 12px', borderRadius: 20, border: '1px solid var(--border)' }}>
                #{tag}
              </span>
            ))}
          </div>
        </div>

        <div style={{ height: 400, borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: 64, border: '1px solid var(--border)' }}>
          <img src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80" alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        <div className="blog-content" style={{ color: 'var(--text2)', fontSize: 18, lineHeight: 1.8 }}>
          <ReactMarkdown 
            components={{
              h1: ({node, ...props}) => <h1 style={{ color: 'var(--text)', marginTop: 48, marginBottom: 24 }} {...props} />,
              h2: ({node, ...props}) => <h2 style={{ color: 'var(--text)', marginTop: 40, marginBottom: 20 }} {...props} />,
              h3: ({node, ...props}) => <h3 style={{ color: 'var(--text)', marginTop: 32, marginBottom: 16 }} {...props} />,
              p: ({node, ...props}) => <p style={{ marginBottom: 24 }} {...props} />,
              li: ({node, ...props}) => <li style={{ marginBottom: 12 }} {...props} />,
              code: ({node, inline, ...props}) => (
                <code style={{ 
                  background: 'var(--bg3)', padding: '2px 6px', borderRadius: 4, 
                  fontFamily: 'DM Mono, monospace', fontSize: '0.9em', color: 'var(--accent)'
                }} {...props} />
              ),
              blockquote: ({node, ...props}) => (
                <blockquote style={{ 
                  borderLeft: '4px solid var(--accent)', paddingLeft: 24, margin: '32px 0',
                  color: 'var(--text)', fontStyle: 'italic'
                }} {...props} />
              )
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>
      </article>
    </PublicLayout>
  )
}

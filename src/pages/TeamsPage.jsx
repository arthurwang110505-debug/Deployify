import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../context/ToastContext'

export default function TeamsPage() {
  const { user } = useAuth()
  const { addToast } = useToast()
  
  const [teams, setTeams] = useState([
    { 
      id: 1, 
      name: 'Design Alpha', 
      role: 'Owner', 
      members: [
        { email: 'you@example.com', role: 'Owner', status: 'Active' },
        { email: 'collab@deployify.app', role: 'Developer', status: 'Pending' }
      ] 
    }
  ])
  const [activeTeamId, setActiveTeamId] = useState(1)
  const [newTeamName, setNewTeamName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('Developer')

  const activeTeam = teams.find(t => t.id === activeTeamId)
  const isMobile = window.innerWidth <= 768

  const handleCreateTeam = (e) => {
    e.preventDefault()
    if (!newTeamName) return
    const newTeam = {
      id: Date.now(),
      name: newTeamName,
      role: 'Owner',
      members: [{ email: user?.email || 'user@example.com', role: 'Owner', status: 'Active' }]
    }
    setTeams(prev => [...prev, newTeam])
    setActiveTeamId(newTeam.id)
    setNewTeamName('')
    addToast(`Organization "${newTeamName}" created!`, 'success')
  }

  const handleInvite = async (e) => {
    e.preventDefault()
    if (!inviteEmail || !activeTeamId) return
    setTeams(prev => prev.map(t => {
      if (t.id === activeTeamId) {
        return { ...t, members: [...t.members, { email: inviteEmail, role: inviteRole, status: 'Pending' }] }
      }
      return t
    }))
    addToast(`Invitation sent to ${inviteEmail}`, 'success')
    setInviteEmail('')
  }

  return (
    <div className="fade-in" style={{ padding: isMobile ? '24px 20px' : '40px 48px', maxWidth: 1200, margin: '0 auto' }}>
      <Helmet>
        <title>Collaboration | Teams</title>
      </Helmet>

      <div style={{ marginBottom: 40, display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: 20 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 4, letterSpacing: '-0.03em' }}>Organizations</h1>
          <p style={{ color: 'var(--text3)', fontSize: 14 }}>Manage your team environment and project access.</p>
        </div>
        <button onClick={() => setActiveTeamId(null)} className="btn-primary" style={{ fontSize: 13 }}>
          + New Team
        </button>
      </div>

      {(!activeTeamId || teams.length === 0) ? (
        <div className="glass fade-up" style={{ padding: 60, textAlign: 'center', borderRadius: 24, border: '1px dashed var(--border2)' }}>
          <div style={{ fontSize: 48, marginBottom: 24 }}>🛡️</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>Launch your team</h2>
          <p style={{ color: 'var(--text2)', fontSize: 14, maxWidth: 420, margin: '0 auto 32px', lineHeight: 1.6 }}>
            Collaborate with developers, manage shared secrets, and scale your infrastructure together.
          </p>
          <form onSubmit={handleCreateTeam} style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 12, maxWidth: 400, margin: '0 auto' }}>
            <input 
              type="text" 
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              placeholder="Organization Name" 
              style={{ flex: 1, padding: '12px 16px', borderRadius: 12, background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)' }}
            />
            <button type="submit" className="btn-primary" disabled={!newTeamName}>Create</button>
          </form>
          {teams.length > 0 && (
            <button onClick={() => setActiveTeamId(teams[0].id)} style={{ marginTop: 24, background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer' }}>Back to existing teams</button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '260px 1fr', gap: 32 }}>
          
          {/* Sidebar Switcher */}
          <div style={{ display: 'flex', flexDirection: isMobile ? 'row' : 'column', gap: 8, overflowX: isMobile ? 'auto' : 'visible' }}>
            {teams.map(t => (
              <button 
                key={t.id}
                onClick={() => setActiveTeamId(t.id)}
                style={{ 
                  textAlign: 'left', padding: '12px 16px', borderRadius: 12, fontSize: 14, fontWeight: 700,
                  background: activeTeamId === t.id ? 'var(--accent-dim)' : 'transparent',
                  color: activeTeamId === t.id ? 'var(--accent)' : 'var(--text2)',
                  border: 'none', cursor: 'pointer', whiteSpace: 'nowrap'
                }}
              >
                {t.name}
              </button>
            ))}
          </div>

          {/* Main Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            
            {/* Invite Section */}
            <div className="glass" style={{ padding: 32, borderRadius: 24 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Invite Members</h3>
              <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 24 }}>Enter their email address to give them access to this organization.</p>
              
              <form onSubmit={handleInvite} style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 12 }}>
                <input 
                  type="email" 
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="name@company.com" 
                  style={{ flex: 1, padding: '12px 16px', borderRadius: 12, background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                />
                <select 
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  style={{ padding: '12px 16px', borderRadius: 12, background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 13 }}
                >
                  <option value="Admin">Admin</option>
                  <option value="Developer">Developer</option>
                  <option value="Viewer">Viewer</option>
                </select>
                <button type="submit" className="btn-secondary" disabled={!inviteEmail}>Send Invite</button>
              </form>
            </div>

            {/* Members List */}
            <div className="glass" style={{ borderRadius: 24, overflow: 'hidden' }}>
              <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border)', background: 'var(--bg3)' }}>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Member Directory</h3>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {activeTeam.members.map((m, i) => (
                  <div key={i} style={{ 
                    padding: '20px 32px', 
                    display: 'flex', 
                    flexDirection: isMobile ? 'column' : 'row',
                    justifyContent: 'space-between', 
                    alignItems: isMobile ? 'flex-start' : 'center', 
                    gap: 16,
                    borderBottom: i < activeTeam.members.length - 1 ? '1px solid var(--border)' : 'none'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ 
                        width: 44, height: 44, borderRadius: 14, 
                        background: 'linear-gradient(135deg, var(--accent), #3dffc0)', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        fontSize: 16, fontWeight: 900, color: '#000' 
                      }}>
                        {m.email[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>{m.email}</div>
                        <div style={{ fontSize: 11, color: 'var(--text3)' }}>{m.status === 'Active' ? 'Joined 2 days ago' : 'Invitation pending'}</div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: 24, width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'space-between' : 'flex-end' }}>
                      <div style={{ textAlign: isMobile ? 'left' : 'right' }}>
                        <div style={{ fontSize: 12, fontWeight: 700 }}>{m.role}</div>
                        <div style={{ fontSize: 11, color: m.status === 'Active' ? 'var(--accent)' : 'var(--yellow)' }}>{m.status}</div>
                      </div>
                      <button style={{ background: 'none', border: 'none', color: 'var(--red)', fontSize: 12, opacity: 0.6, cursor: 'pointer' }}>Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Team Settings (Owner Only) */}
            {activeTeam.role === 'Owner' && (
              <div style={{ marginTop: 20, padding: 32, borderRadius: 24, border: '1px solid var(--red)', background: 'rgba(255, 75, 75, 0.05)' }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--red)', marginBottom: 8 }}>Danger Zone</h3>
                <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 20 }}>Deleting this organization will permanently remove all associated projects and team data.</p>
                <button className="btn-secondary" style={{ color: 'var(--red)', borderColor: 'var(--red)' }}>Delete Organization</button>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  )
}

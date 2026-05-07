import React, { useState, createContext, useContext } from 'react'

const ToastContext = createContext()

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = (msg, type = 'success') => {
    const id = Math.random().toString(36).slice(2, 9)
    setToasts(prev => [...prev, { id, msg, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div style={{ 
        position: 'fixed', 
        bottom: 32, 
        right: 32, 
        zIndex: 10000, 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 12,
        pointerEvents: 'none'
      }}>
        {toasts.map(t => (
          <div key={t.id} className="animate-slide-in" style={{
            pointerEvents: 'auto',
            minWidth: 320,
            padding: '16px 20px',
            background: 'var(--bg2)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            color: 'var(--text)',
            fontSize: 14,
            fontWeight: 500
          }}>
            <div style={{
              width: 10, height: 10, borderRadius: '50%',
              background: t.type === 'success' ? 'var(--accent)' : t.type === 'error' ? 'var(--red)' : 'var(--blue)'
            }} />
            {t.msg}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)

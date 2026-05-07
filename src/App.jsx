import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { useAuth } from './hooks/useAuth'
import { ToastProvider } from './context/ToastContext'
import AuthPage from './pages/AuthPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import DashboardPage from './pages/DashboardPage'
import DeploysPage from './pages/DeploysPage'
import SettingsPage from './pages/SettingsPage'
import Layout from './components/Layout'

import HomePage from './pages/HomePage'
import BlogPage from './pages/BlogPage'
import BlogPostPage from './pages/BlogPostPage'
import DocsPage from './pages/DocsPage'
import PrivacyPage from './pages/PrivacyPage'
import TermsPage from './pages/TermsPage'
import MissionPage from './pages/MissionPage'
import ContactPage from './pages/ContactPage'
import SiteViewerPage from './pages/SiteViewerPage'
import NotFoundPage from './pages/NotFoundPage'
import DomainsPage from './pages/DomainsPage'
import AnalyticsPage from './pages/AnalyticsPage'
import TeamsPage from './pages/TeamsPage'
import AdminPage from './pages/AdminPage'

import React, { useEffect } from 'react'

function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)' }}>
      <div className="spinner" style={{ width: 24, height: 24 }} />
    </div>
  )
  return user ? children : <Navigate to="/auth" replace />
}

export default function App() {
  useEffect(() => {
    const hour = new Date().getHours()
    const isNight = hour >= 18 || hour < 6
    document.documentElement.setAttribute('data-theme', isNight ? 'dark' : 'light')
  }, [])

  return (
    <HelmetProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/docs" element={<DocsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/about" element={<MissionPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/site/:slug" element={<SiteViewerPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route element={<RequireAuth><Layout /></RequireAuth>}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/domains" element={<DomainsPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/teams" element={<TeamsPage />} />
              <Route path="/deploys" element={<DeploysPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </HelmetProvider>
  )
}

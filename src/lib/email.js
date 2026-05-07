import { supabase } from './supabase'

/**
 * Sends a high-end, professional email via Supabase Edge Functions / Resend
 */
export async function sendEmail({ to, subject, html, text }) {
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: { to, subject, html, text }
    })
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Email Error:', error)
    return { data: null, error }
  }
}

/**
 * Modern Password Reset Template
 * Features: Dark theme, Emerald accent, Premium typography, Mobile-responsive
 */
export async function sendPasswordResetEmail(email, resetLink) {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700&display=swap');
        body { font-family: 'Outfit', sans-serif; background: #0a0b0d; margin: 0; padding: 0; color: #ffffff; }
        .wrapper { padding: 60px 20px; background: #0a0b0d; text-align: center; }
        .card { max-width: 480px; margin: 0 auto; background: #111217; border: 1px solid #24262b; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
        .header { padding: 48px 32px 32px; background: linear-gradient(180deg, #16181d 0%, #111217 100%); }
        .body { padding: 0 40px 48px; }
        .footer { padding: 32px; background: #0d0f14; border-top: 1px solid #24262b; color: #64748b; font-size: 12px; }
        .btn { display: inline-block; padding: 16px 36px; background: #10b981; color: #000000 !important; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px; margin: 32px 0; box-shadow: 0 10px 20px rgba(16,185,129,0.2); }
        h2 { font-size: 26px; font-weight: 700; margin: 0 0 16px; color: #ffffff; letter-spacing: -0.02em; }
        p { font-size: 16px; color: #94a3b8; line-height: 1.6; margin: 0; }
        .logo { height: 32px; margin-bottom: 24px; filter: brightness(0) invert(1); }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="card">
          <div class="header">
            <img src="https://deployify-wheat.vercel.app/logo.png" alt="Deployify" class="logo">
            <h2>Reset your password</h2>
          </div>
          <div class="body">
            <p>We received a request to reset your password. Click the secure button below to choose a new one.</p>
            <a href="${resetLink}" class="btn">Confirm New Password</a>
            <p style="font-size: 13px; color: #475569;">If you didn't request this, you can ignore this email. Link expires in 1 hour.</p>
          </div>
          <div class="footer">
            © 2026 Deployify Technologies Inc.<br/>
            Security Infrastructure Team
          </div>
        </div>
      </div>
    </body>
    </html>
  `
  return sendEmail({
    to: email,
    subject: 'Secure Password Reset Request',
    html,
    text: `Reset your password by following this link: ${resetLink}`
  })
}

/**
 * Premium Update Notification Template
 */
export async function sendUpdateNotification(email, title, content) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, sans-serif; background: #0a0b0d; color: #ffffff; margin: 0; }
        .container { max-width: 600px; margin: 40px auto; background: #111217; border-radius: 24px; border: 1px solid #24262b; overflow: hidden; }
        .hero { padding: 60px 40px; text-align: center; background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
        .main { padding: 40px; }
        h1 { margin: 0; font-size: 32px; font-weight: 900; color: #000000; letter-spacing: -0.04em; }
        h3 { font-size: 20px; font-weight: 700; color: #ffffff; margin-bottom: 16px; }
        p { color: #94a3b8; line-height: 1.7; font-size: 16px; }
        .footer { padding: 32px; text-align: center; background: #0d0f14; color: #475569; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; }
        .badge { display: inline-block; padding: 4px 12px; background: rgba(0,0,0,0.1); border-radius: 20px; font-size: 12px; font-weight: 700; color: #000000; margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="hero">
          <div class="badge">PRODUCT UPDATE</div>
          <h1>${title}</h1>
        </div>
        <div class="main">
          <h3>Hello Builder,</h3>
          <p>${content}</p>
          <div style="margin-top: 40px; padding-top: 32px; border-top: 1px solid #24262b;">
            <p style="font-size: 14px;">Happy building,<br/>The Deployify Team</p>
          </div>
        </div>
        <div class="footer">
          Automated System Message &bull; Deployify Inc. &bull; <a href="#" style="color: #64748b;">Unsubscribe</a>
        </div>
      </div>
    </body>
    </html>
  `
  return sendEmail({ to: email, subject: `New Update: ${title}`, html, text: content })
}

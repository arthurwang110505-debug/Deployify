# Deployify — Setup Guide

A self-hosted Netlify clone. Upload ZIP files → auto-deploys to Supabase Storage → generates a public URL.

---

## Stack
- **Frontend**: React + Vite → deployed to Netlify
- **Backend**: Supabase (Auth + PostgreSQL + Storage)
- **Deploy logic**: Runs in the browser via JSZip (no server needed for MVP)

---

## Step 1 — Create Supabase project

1. Go to [supabase.com](https://supabase.com) → New project
2. Note your **Project URL** and **anon key** (Settings → API)
3. Go to **SQL Editor** → paste and run `supabase-schema.sql`

---

## Step 2 — Enable Auth providers

### Google OAuth
1. Supabase Dashboard → Authentication → Providers → Google → Enable
2. Create OAuth credentials at [console.cloud.google.com](https://console.cloud.google.com)
   - Authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`
3. Paste Client ID + Secret into Supabase

### Email/Password
1. Authentication → Providers → Email → Enable
2. (Optional) Disable email confirmation for easier dev: Auth → Settings → uncheck "Enable email confirmations"

---

## Step 3 — Set environment variables

Copy `.env.example` to `.env.local`:

```
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

---

## Step 4 — Run locally

```bash
npm install
npm run dev
```

Visit `http://localhost:5173`

---

## Step 5 — Deploy to Netlify

1. Push this repo to GitHub
2. Netlify → New site from Git → select your repo
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Environment variables → add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
5. Deploy!

### Update Google OAuth redirect URI
After deploying, add your Netlify URL to Google OAuth:
- `https://your-netlify-app.netlify.app` → Authorized JavaScript origins
- `https://your-project.supabase.co/auth/v1/callback` → Authorized redirect URIs (already set)

Also update Supabase:
- Authentication → URL Configuration → Site URL → your Netlify URL

---

## How deploying works

```
User uploads ZIP
  ↓
JSZip extracts files in browser
  ↓
Each file uploaded to Supabase Storage
  bucket: deployify-sites
  path:   sites/{unique-slug}/{filepath}
  ↓
Storage returns public URL
  e.g. https://xxx.supabase.co/storage/v1/object/public/deployify-sites/sites/my-site-a3b4/index.html
  ↓
Site record saved in PostgreSQL
  ↓
User sees live URL in dashboard
```

---

## Project structure

```
deployify/
├── src/
│   ├── components/
│   │   └── Layout.jsx          # Sidebar + nav
│   ├── hooks/
│   │   ├── useAuth.js          # Auth state
│   │   └── useDeploy.js        # Zip extract + upload logic
│   ├── lib/
│   │   └── supabase.js         # All Supabase calls
│   ├── pages/
│   │   ├── AuthPage.jsx        # Login / signup
│   │   ├── DashboardPage.jsx   # Sites grid + deploy modal
│   │   ├── DeploysPage.jsx     # Deploy history
│   │   └── SettingsPage.jsx    # Account settings
│   ├── App.jsx                 # Router + auth guard
│   ├── main.jsx
│   └── index.css
├── netlify.toml
├── supabase-schema.sql         # Run this in Supabase SQL editor
├── .env.example
└── package.json
```

---

## Limitations (MVP)

- Sites are hosted on Supabase Storage URLs (long URLs, not custom domains)
- No GitHub webhook integration (manual upload only)
- No build step (upload pre-built sites — Vite/CRA dist folder zipped)
- Free Supabase Storage: 1 GB per project

## Next steps (future upgrades)

- [ ] Custom subdomain routing (e.g. `mysite.deployify.app`)
- [ ] GitHub webhook → auto-deploy on push
- [ ] Build queue (run `npm run build` server-side via Netlify Functions)
- [ ] Teams + paid plan enforcement
- [ ] Analytics (page views via Supabase Edge Functions)

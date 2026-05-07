<p align="center">
  <a href="https://github.com/yourusername/deployify">
    <img src="https://img.shields.io/badge/React-18.2-blue?logo=react" alt="React" />
  </a>
  <a href="https://vitejs.dev/">
    <img src="https://img.shields.io/badge/Vite-5.0-purple?logo=vite" alt="Vite" />
  </a>
  <a href="https://supabase.com/">
    <img src="https://img.shields.io/badge/Supabase-PostgreSQL-green?logo=supabase" alt="Supabase" />
  </a>
  <a href="https://www.npmjs.com/package/deployify-cli-official">
    <img src="https://img.shields.io/npm/v/deployify-cli-official?logo=npm" alt="npm version" />
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT" />
  </a>
</p>
<h1 align="center">Deployify</h1>

<p align="center">
  <strong>Your Self-Hosted Netlify Alternative</strong><br/>
  Deploy static sites in seconds with a single click or command.
</p>

<p align="center">
  <a href="https://deployify-wheat.vercel.app/about">About</a> •
  <a href="#-features">Features</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-cli-tool">CLI Tool</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-deployment-flow">Deployment Flow</a> •
  <a href="#-setup-guide">Setup Guide</a> •
  <a href="#-security">Security</a>
</p>

---

## 🚀 What is Deployify?

**Deployify** is a production-ready, self-hosted static site deployment platform inspired by Vercel and Netlify. Built from the ground up to give you full control over your deployment infrastructure without vendor lock-in.

Upload a ZIP file or use our CLI tool, and Deployify automatically extracts, deploys to Supabase Storage, and generates a public URL for your static site — complete with custom domain support, analytics, and team collaboration features.

### ✨ Why Deployify?

- **🔒 Full Data Ownership**: Your code, your data, your infrastructure
- **⚡ Lightning Fast**: Browser-based extraction + edge functions for instant deployments
- **🛠️ Developer First**: CLI tool available on npm for seamless CI/CD integration
- **💰 Cost Effective**: Built on Supabase's generous free tier
- **🎯 Feature Rich**: Teams, analytics, custom domains, and more out of the box

---

## 🌟 Features

### For Developers

| Feature | Description |
|---------|-------------|
| **One-Click Deploy** | Upload ZIP files directly from the dashboard |
| **CLI Tool** | Deploy from terminal with `npx deployify-cli-official` |
| **Custom Domains** | Connect your own domains with automatic SSL |
| **Team Collaboration** | Invite team members and manage permissions |
| **Analytics Dashboard** | Real-time traffic insights for all deployments |
| **API Keys** | Generate and manage API keys for automation |
| **Deploy History** | Track all deployments with rollback capability |

### For Teams

- 👥 Multi-user team workspaces
- 🔐 Role-based access control (RBAC)
- 📊 Shared analytics and deployment logs
- 🌐 Centralized domain management


### Deploy on CLI tool

```bash
# Step 1: Login with your API key
npx deployify-cli-official login your-api-key-here

# Step 2: Initialize a new project
npx deployify-cli-official init "My Portfolio" "my-portfolio"

# Step 3: Deploy instantly
npx deployify-cli-official deploy

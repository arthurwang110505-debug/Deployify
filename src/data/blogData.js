export const POSTS = [
  { 
    slug: 'quick-setup-guide',
    title: 'Quick Setup for New Users: Deploy in 30 Seconds', 
    date: 'April 30, 2024', 
    excerpt: 'Ready to launch? Follow this simple guide to get your first static site live on Deployify.',
    category: 'Tutorial',
    tags: ['Onboarding', 'Tutorial', 'Quickstart'],
    content: `
# Quick Setup Guide

Welcome to **Deployify**! We've made it incredibly simple to get your static websites online. Follow these three steps to launch your first project.

## 1. Sign In or Create an Account
Head over to our [Auth Page](/auth) and sign in using your Google account or Email. Once you're in, you'll be redirected to your **Dashboard**.

## 2. Create a New Project
In the Dashboard, click the **"New Project"** button. You'll have three options:
- **Manual Upload**: Upload a folder or a ZIP file directly.
- **GitHub Import**: Paste a public GitHub repository URL.
- **CLI Deployment**: (New!) Deploy directly from your terminal using our professional CLI tool.

## 3. Configure and Launch
Enter a **Project Name** and a unique **URL Slug**. Click **"Deploy"**, and our system will handle the rest. Your files will be uploaded to Supabase Storage and served instantly.

### Pro Tip: Analytics
Once your site is live, visit the **Analytics** tab in the site detail panel to see live traffic data!

---
*Questions? Contact our support or check out the [Docs](/docs).*
    `
  },
  { 
    slug: 'static-sites-future',
    title: 'Why Static Sites are the Future', 
    date: 'April 18, 2024', 
    excerpt: 'Performance, security, and scalability. Why you should choose static for your next project.',
    category: 'Engineering',
    tags: ['Performance', 'Jamstack', 'Security'],
    content: `
# The Power of Static

Static Site Generation (SSG) has revolutionized the web. By pre-rendering pages at build time, you get:

- **Blazing Speed**: No database queries on page load.
- **Global Scalability**: Easily cached on CDNs.
- **Security**: No server-side vulnerabilities.

Deployify is built specifically to make this workflow seamless.
    `
  }
]

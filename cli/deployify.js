#!/usr/bin/env node
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const AdmZip = require('adm-zip');
const readline = require('readline');

// Hardcoded config for the platform
const SUPABASE_URL = 'https://nmujreqgiifuslafkpti.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tdWpyZXFnaWlmdXNsYWZrcHRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyOTg2NjksImV4cCI6MjA4ODg3NDY2OX0.Rnwza_QqjkQplduo8DsKp42r0HZe2x4Dfc147_KLYFA';

const CONFIG_FILE = path.join(process.cwd(), 'deployify.json');
const AUTH_FILE = path.join(require('os').homedir(), '.deployifyrc');

async function getAuth() {
  if (!(await fs.pathExists(AUTH_FILE))) {
    console.error('❌ Not logged in. Run "npx deployify-cli-official login" first.');
    process.exit(1);
  }
  return fs.readJson(AUTH_FILE);
}

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans);
  }));
}

const cli = {
  login: async () => {
    console.log('Deployify CLI Login');
    const token = await askQuestion('Enter your API Key(inside the Deployify dashboard settings): ');
    if (!token) {
      console.log('❌ Login aborted.');
      return;
    }
    await fs.writeJson(AUTH_FILE, { token });
    console.log('✅ Logged in successfully!');
  },

  deploy: async (dirArg) => {
    const { token } = await getAuth();
    let config;

    // Interactive Setup (Vercel-like)
    if (!(await fs.pathExists(CONFIG_FILE))) {
      console.log('Deployify CLI 1.0.2');
      const dirName = path.basename(process.cwd());

      const setup = await askQuestion(`? Set up and deploy "${process.cwd()}"? [Y/n] `);
      if (setup.toLowerCase() === 'n') {
        console.log('Aborted.');
        process.exit(0);
      }

      const defaultName = dirName;
      let name = await askQuestion(`? What's your project's name? (${defaultName}) `);
      name = name.trim() || defaultName;

      const defaultSlug = name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
      let slug = await askQuestion(`? What's your project's URL slug? (${defaultSlug}) `);
      slug = slug.trim() || defaultSlug;

      const defaultDir = dirArg || 'dist';
      let dir = await askQuestion(`? In which directory is your code located? (${defaultDir}) `);
      dir = dir.trim() || defaultDir;

      config = { name, slug, directory: dir };
      await fs.writeJson(CONFIG_FILE, config, { spaces: 2 });
      console.log(`✅ Linked to ${name} (created deployify.json)`);
    } else {
      config = await fs.readJson(CONFIG_FILE);
      console.log(`🔍 Inspecting project: ${config.name}...`);
    }

    const deployDir = dirArg || config.directory || '.';
    const targetPath = path.resolve(process.cwd(), deployDir);

    if (!(await fs.pathExists(targetPath))) {
      console.error(`❌ Build directory "${deployDir}" does not exist. Did you forget to run "npm run build"?`);
      process.exit(1);
    }

    console.log('📦 Preparing files...');
    const zip = new AdmZip();

    // Scan directory (excluding node_modules and hidden files)
    const files = await fs.readdir(targetPath);
    for (const file of files) {
      if (file === 'node_modules' || file.startsWith('.')) continue;
      const fullPath = path.join(targetPath, file);
      const stats = await fs.stat(fullPath);
      if (stats.isDirectory()) {
        zip.addLocalFolder(fullPath, file);
      } else {
        zip.addLocalFile(fullPath);
      }
    }

    const zipBuffer = zip.toBuffer();
    const storagePath = `sites/${config.slug}/index.html`; // Simplification

    console.log('⏳ Uploading to Deployify...');

    try {
      const response = await axios.post(
        `${SUPABASE_URL}/functions/v1/deploy`,
        zipBuffer,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/zip',
            'x-site-name': config.name,
            'x-site-slug': config.slug
          }
        }
      );

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      console.log(`✅ Production: https://${config.slug}.deployify.app`);
    } catch (err) {
      console.error('❌ Deployment failed:', err.response?.data || err.message);
    }
  }
};

const [, , cmd, ...args] = process.argv;

// Basic argument parsing to catch --dir=dist
let dirArg = null;
const parsedArgs = args.filter(a => {
  if (a.startsWith('--dir=')) {
    dirArg = a.split('=')[1];
    return false;
  }
  return true;
});

if (cmd === 'login') cli.login();
else if (cmd === 'deploy') cli.deploy(dirArg);
else {
  console.log(`
Deployify CLI v1.0.2

Usage:
  npx deployify-cli-official login                - Log in interactively
  npx deployify-cli-official deploy [--dir=dist]  - Deploy your project
  `);
}

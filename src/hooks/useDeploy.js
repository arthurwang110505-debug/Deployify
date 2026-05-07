import { useState, useCallback } from 'react'
import JSZip from 'jszip'
import {
  createSite,
  createDeployment,
  updateDeployment,
  updateSiteStatus,
  uploadFileToStorage,
  getPublicUrl,
} from '../lib/supabase'

const MIME_MAP = {
  'html': 'text/html',
  'htm': 'text/html',
  'css': 'text/css',
  'js': 'application/javascript',
  'mjs': 'application/javascript',
  'json': 'application/json',
  'png': 'image/png',
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'gif': 'image/gif',
  'svg': 'image/svg+xml',
  'ico': 'image/x-icon',
  'webp': 'image/webp',
  'woff': 'font/woff',
  'woff2': 'font/woff2',
  'ttf': 'font/ttf',
  'txt': 'text/plain',
  'xml': 'text/xml',
  'pdf': 'application/pdf',
}

function getMime(filename) {
  if (!filename || !filename.includes('.')) return 'application/octet-stream'
  const ext = filename.split('.').pop().toLowerCase()
  return MIME_MAP[ext] || 'application/octet-stream'
}

function generateSlug(name) {
  // Ensure we don't have spaces or special chars in the slug
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/[^a-z0-9-]/g, '') // Remove non-alphanumeric except hyphens
      .replace(/-+/g, '-') // Remove double hyphens
      .replace(/^-|-$/g, '') +
    '-' +
    Math.random().toString(36).slice(2, 10)
  )
}

export function useDeploy(userId, onSuccess) {
  const [state, setState] = useState({
    phase: 'idle', // idle | reading | uploading | done | error
    progress: 0,
    log: [],
    deployUrl: null,
    error: null,
  })

  const log = (msg, type = 'info') =>
    setState((s) => ({ ...s, log: [...s.log, { msg, type, ts: Date.now() }] }))

  const deploy = useCallback(
    async (input, siteName, renameTarget = null) => {
      setState({ phase: 'reading', progress: 0, log: [], deployUrl: null, error: null })

      try {
        let entries = []
        let isZip = false

        // 1. Detect input type
        if (input instanceof File && input.type === 'application/zip') {
          isZip = true
          log('Reading zip file...', 'info')
          const zip = await JSZip.loadAsync(input)
          zip.forEach((relativePath, zipEntry) => {
            if (!zipEntry.dir) entries.push({ relativePath, zipEntry })
          })
        } else {
          // Handle FileList, Array of Files, or single File
          const files = input instanceof File ? [input] : Array.from(input)
          log(`Processing ${files.length} files...`, 'info')
          for (const f of files) {
            // Use webkitRelativePath if available, otherwise just the name
            const path = f.webkitRelativePath || f.name
            entries.push({ relativePath: path, file: f })
          }
        }

        if (entries.length === 0) throw new Error('No files found to deploy')

        // Strip common top-level folder if all files share one
        const topDirs = new Set(entries.map((e) => e.relativePath.split('/')[0]))
        let stripPrefix =
          topDirs.size === 1 && entries.some((e) => e.relativePath.includes('/'))
            ? [...topDirs][0] + '/'
            : ''

        log(`Found ${entries.length} files`, 'success')

        // 2. Create site record
        const slug = generateSlug(siteName)
        log(`Creating site: ${slug}`, 'info')
        const site = await createSite({ userId, name: siteName, slug })

        // 3. Create deployment record (building)
        const deployment = await createDeployment({
          siteId: site.id,
          userId,
          status: 'building',
          deployUrl: null,
          logLines: [],
        })

        setState((s) => ({ ...s, phase: 'uploading' }))

        // 4. Upload each file
        let uploaded = 0
        for (const entry of entries) {
          const { relativePath, zipEntry, file: rawFile } = entry
          let cleanPath = relativePath.startsWith(stripPrefix)
            ? relativePath.slice(stripPrefix.length)
            : relativePath

          if (!cleanPath) continue

          // Handle automatic rename if requested
          if (renameTarget && cleanPath === renameTarget) {
            log(`Renaming ${cleanPath} to index.html as requested`, 'info')
            cleanPath = 'index.html'
          }

          let buffer
          if (isZip) {
            buffer = await zipEntry.async('arraybuffer')
          } else {
            buffer = await rawFile.arrayBuffer()
          }

          const mime = getMime(cleanPath)
          const contentType = mime.includes('text') ? `${mime}; charset=utf-8` : mime
          
          // Final safety: ensure we strip any potential BOM that might confuse browsers
          let finalBuffer = buffer
          const view = new Uint8Array(buffer)
          if (view[0] === 0xEF && view[1] === 0xBB && view[2] === 0xBF) {
            log(`Cleaning BOM from ${cleanPath}`, 'info')
            finalBuffer = buffer.slice(3)
          }

          const fileObj = new File([finalBuffer], cleanPath, { type: contentType })

          log(`Uploading ${cleanPath} (${contentType})`, 'info')
          await uploadFileToStorage(slug, cleanPath, fileObj, contentType)

          uploaded++
          setState((s) => ({ ...s, progress: Math.round((uploaded / entries.length) * 100) }))
        }

        // 5. Verify index.html existence and get public URL
        const hasIndex = entries.some(e => {
          const clean = e.relativePath.startsWith(stripPrefix) ? e.relativePath.slice(stripPrefix.length) : e.relativePath
          return clean === 'index.html' || (renameTarget && clean === renameTarget)
        })
        if (!hasIndex) {
          log('Warning: No index.html found at the root of your project.', 'error')
        }

        const deployUrl = getPublicUrl(slug)
        log('Finalizing deployment...', 'info')

        // 6. Update records
        await updateDeployment(deployment.id, {
          status: 'published',
          deploy_url: deployUrl,
          log: state.log.map((l) => l.msg),
        })
        await updateSiteStatus(site.id, 'published', deployUrl)

        log(`Deploy live at: ${deployUrl}`, 'success')

        setState((s) => ({ ...s, phase: 'done', deployUrl, progress: 100 }))
        onSuccess?.()
      } catch (err) {
        log(`Error: ${err.message}`, 'error')
        setState((s) => ({ ...s, phase: 'error', error: err.message }))
      }
    },
    [userId, onSuccess]
  )

  const reset = () =>
    setState({ phase: 'idle', progress: 0, log: [], deployUrl: null, error: null })

  return { ...state, deploy, reset }
}

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts"

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

serve(async (req) => {
  // CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' } })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Missing or invalid Authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    
    // 1. Validate Token
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    
    // Hash the token (SHA-256)
    const encoder = new TextEncoder()
    const data = encoder.encode(token)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const tokenHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    const { data: tokenData, error: tokenError } = await supabase
      .from('api_tokens')
      .select('user_id')
      .eq('token_hash', tokenHash)
      .single()

    if (tokenError || !tokenData) {
      throw new Error('Invalid API Token')
    }

    const userId = tokenData.user_id

    // 2. Parse Request Body
    const contentType = req.headers.get('content-type') || ''
    if (!contentType.includes('application/zip')) {
      throw new Error('Expected application/zip content type')
    }

    const zipBuffer = await req.arrayBuffer()
    const siteName = req.headers.get('x-site-name')
    const siteSlug = req.headers.get('x-site-slug')

    if (!siteName || !siteSlug) {
      throw new Error('Missing x-site-name or x-site-slug headers')
    }

    // 3. Create/Update Site Record
    const { data: site, error: siteError } = await supabase
      .from('sites')
      .upsert(
        { user_id: userId, name: siteName, slug: siteSlug, status: 'published', last_deployed_at: new Date().toISOString() },
        { onConflict: 'slug' }
      )
      .select()
      .single()

    if (siteError) throw siteError

    // 4. Upload ZIP to Storage (Simplification: just upload the ZIP for now as index.html to match current CLI logic, but we could unzip here)
    // To properly support static hosting, we'd want to unzip. 
    // For now, let's keep it compatible with what the user started with but fix the auth/RLS issue.
    const storagePath = `sites/${siteSlug}/index.html` 
    
    const { error: uploadError } = await supabase.storage
      .from('deployify-sites')
      .upload(storagePath, zipBuffer, {
        contentType: 'text/html', // The CLI was calling it index.html
        upsert: true
      })

    if (uploadError) throw uploadError

    // 5. Create Deployment Record
    const deployUrl = `${SUPABASE_URL}/storage/v1/object/public/deployify-sites/${storagePath}`
    const { data: deployment, error: deployError } = await supabase
      .from('deployments')
      .insert({
        site_id: site.id,
        user_id: userId,
        status: 'published',
        deploy_url: deployUrl,
        log: ['Deployment successful via CLI']
      })
      .select()
      .single()

    if (deployError) throw deployError

    return new Response(
      JSON.stringify({ success: true, siteId: site.id, deploymentId: deployment.id, url: `https://${siteSlug}.deployify.app` }),
      { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    )

  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    )
  }
})

import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// Auth helpers
export const signInWithGoogle = () =>
  supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/dashboard` },
  })

export const signInWithGithub = () =>
  supabase.auth.signInWithOAuth({
    provider: 'github',
    options: { 
      redirectTo: `${window.location.origin}/dashboard`,
      scopes: 'repo read:user'
    },
  })

export const signInWithEmail = (email, password) =>
  supabase.auth.signInWithPassword({ email, password })

export const signUpWithEmail = (email, password) =>
  supabase.auth.signUp({ email, password })

export const resetPasswordForEmail = (email) =>
  supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })

export const signOut = () => supabase.auth.signOut()

export const getUser = () => supabase.auth.getUser()

// Sites helpers
export const getSites = async (userId) => {
  const { data, error } = await supabase
    .from('sites')
    .select('*, deployments(id, status, deploy_url, created_at, log), env_vars(id, key, value), domains(id, domain, status)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export const createSite = async ({ userId, name, slug }) => {
  const { data, error } = await supabase
    .from('sites')
    .insert({ user_id: userId, name, slug, status: 'inactive' })
    .select()
    .single()
  if (error) throw error
  return data
}

export const updateSite = async (id, updates) => {
  const { data, error } = await supabase.from('sites').update(updates).eq('id', id).select()
  if (error) throw error
  return data[0]
}

export const rollbackToDeployment = async (siteId, deploymentId) => {
  const { data, error } = await supabase
    .from('sites')
    .update({ current_deployment_id: deploymentId })
    .eq('id', siteId)
    .select()
  
  if (error) throw error
  return data[0]
}

export const updateSiteSlug = async (siteId, oldSlug, newSlug) => {
  // 1. Update DB
  const { error: dbError } = await supabase
    .from('sites')
    .update({ slug: newSlug, deploy_url: null, status: 'inactive' }) // Reset status during migration
    .eq('id', siteId)
  
  if (dbError) throw dbError

  // 2. Migrate Storage Files (List & Move)
  try {
    const { data: files, error: listError } = await supabase.storage
      .from('deployify-sites')
      .list(`sites/${oldSlug}`, { limit: 1000 })
    
    if (listError) throw listError

    if (files && files.length > 0) {
      for (const file of files) {
        const oldPath = `sites/${oldSlug}/${file.name}`
        const newPath = `sites/${newSlug}/${file.name}`
        await supabase.storage.from('deployify-sites').move(oldPath, newPath)
      }
    }
    
    // 3. Update status back to published if everything moved
    await supabase.from('sites').update({ status: 'published' }).eq('id', siteId)
  } catch (err) {
    console.error('Storage migration failed:', err)
    throw new Error('Database updated but storage migration failed. Please redeploy.')
  }
}

export const deleteSite = async (siteId) => {
  const { error } = await supabase.from('sites').delete().eq('id', siteId)
  if (error) throw error
}

export const getPageViews = async (siteSlug) => {
  const { count, error } = await supabase
    .from('page_views')
    .select('*', { count: 'exact', head: true })
    .eq('site_slug', siteSlug)
  if (error) throw error
  return count || 0
}

export const getPageViewsStats = async (siteSlug) => {
  const { data, error } = await supabase
    .from('page_views')
    .select('created_at')
    .eq('site_slug', siteSlug)
    .order('created_at', { ascending: true })
  
  if (error) throw error

  // Group by date
  const stats = {}
  data.forEach(v => {
    const date = new Date(v.created_at).toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' })
    stats[date] = (stats[date] || 0) + 1
  })

  return Object.entries(stats).map(([name, views]) => ({ name, views }))
}

export const seedPageViews = async (siteSlug) => {
  const now = new Date()
  const dummyData = []
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(now)
    date.setDate(now.getDate() - i)
    const count = Math.floor(Math.random() * 20) + 5
    for (let j = 0; j < count; j++) {
      dummyData.push({ site_slug: siteSlug, created_at: date.toISOString() })
    }
  }
  
  const { error } = await supabase.from('page_views').insert(dummyData)
  if (error) throw error
}

// Env Vars helpers
export const getEnvVars = async (siteId) => {
  const { data, error } = await supabase.from('env_vars').select('*').eq('site_id', siteId)
  if (error) throw error
  return data
}

export const createEnvVar = async ({ siteId, userId, key, value }) => {
  const { data, error } = await supabase
    .from('env_vars')
    .insert({ site_id: siteId, user_id: userId, key, value })
    .select()
    .single()
  if (error) throw error
  return data
}

export const deleteEnvVar = async (id) => {
  const { error } = await supabase.from('env_vars').delete().eq('id', id)
  if (error) throw error
}

// Domains helpers
export const getDomains = async (siteId) => {
  const { data, error } = await supabase.from('domains').select('*').eq('site_id', siteId)
  if (error) throw error
  return data
}

export const createDomain = async ({ siteId, userId, domain }) => {
  const { data, error } = await supabase
    .from('domains')
    .insert({ site_id: siteId, user_id: userId, domain, status: 'pending_verification' })
    .select()
    .single()
  if (error) throw error
  return data
}

export const deleteDomain = async (id) => {
  const { error } = await supabase.from('domains').delete().eq('id', id)
  if (error) throw error
}

// API Tokens helpers
export const getApiTokens = async (userId) => {
  const { data, error } = await supabase.from('api_tokens').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export const createApiToken = async ({ userId, name, tokenHash, tokenPrefix }) => {
  const { data, error } = await supabase
    .from('api_tokens')
    .insert({ user_id: userId, name, token_hash: tokenHash, token_prefix: tokenPrefix })
    .select()
    .single()
  if (error) throw error
  return data
}

export const deleteApiToken = async (id) => {
  const { error } = await supabase.from('api_tokens').delete().eq('id', id)
  if (error) throw error
}

// Deployments helpers
export const getDeployments = async (userId) => {
  const { data, error } = await supabase
    .from('deployments')
    .select('*, sites(name, slug)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) throw error
  return data
}

export const createDeployment = async ({ siteId, userId, status, deployUrl, logLines }) => {
  const { data, error } = await supabase
    .from('deployments')
    .insert({ site_id: siteId, user_id: userId, status, deploy_url: deployUrl, log: logLines })
    .select()
    .single()
  if (error) throw error
  return data
}

export const updateDeployment = async (id, updates) => {
  const { error } = await supabase.from('deployments').update(updates).eq('id', id)
  if (error) throw error
}

export const updateSiteStatus = async (siteId, status, deployUrl) => {
  const { error } = await supabase
    .from('sites')
    .update({ status, deploy_url: deployUrl, last_deployed_at: new Date().toISOString() })
    .eq('id', siteId)
  if (error) throw error
}

export const promoteDeployment = async (siteId, deployUrl) => {
  const { data, error } = await supabase
    .from('sites')
    .update({ 
      deploy_url: deployUrl, 
      status: 'published',
      last_deployed_at: new Date().toISOString() 
    })
    .eq('id', siteId)
    .select()
    .single()
  if (error) throw error
  return data
}

// Storage helpers — upload a single file buffer to Supabase Storage
export const uploadFileToStorage = async (slug, filePath, fileBuffer, contentType) => {
  const storagePath = `sites/${slug}/${filePath}`
  console.log(`Uploading to bucket [deployify-sites] path [${storagePath}]`)
  const { error } = await supabase.storage
    .from('deployify-sites')
    .upload(storagePath, fileBuffer, {
      contentType: contentType,
      upsert: true,
      cacheControl: '0',
    })
  if (error) {
    console.error('Storage upload error:', error)
    throw new Error(`Storage error: ${error.message}`)
  }
}

export const getPublicUrl = (slug, filePath = 'index.html') => {
  const { data } = supabase.storage
    .from('deployify-sites')
    .getPublicUrl(`sites/${slug}/${filePath}`)
  return data.publicUrl
}

export const deleteStorageSite = async (slug) => {
  const { data: files, error: listError } = await supabase.storage
    .from('deployify-sites')
    .list(`sites/${slug}`, { limit: 1000 })
  
  if (listError) throw listError

  if (files && files.length > 0) {
    const paths = files.map((f) => `sites/${slug}/${f.name}`)
    const { error: delError } = await supabase.storage.from('deployify-sites').remove(paths)
    if (delError) throw delError
  }
}

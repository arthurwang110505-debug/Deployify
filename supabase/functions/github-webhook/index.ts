import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

async function verifyGithubSignature(req: Request, rawBody: string): Promise<boolean> {
  const signature = req.headers.get('x-hub-signature-256');
  if (!signature) return false;
  
  const secret = Deno.env.get('GITHUB_WEBHOOK_SECRET') ?? '';
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );

  const sigHex = signature.replace(/^sha256=/, '');
  const sigBytes = new Uint8Array(sigHex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []);

  try {
    return await crypto.subtle.verify('HMAC', key, sigBytes, encoder.encode(rawBody));
  } catch {
    return false;
  }
}

serve(async (req) => {
  try {
    const rawBody = await req.text();
    if (!(await verifyGithubSignature(req, rawBody))) {
      return new Response(JSON.stringify({ error: "Unauthorized: Invalid Signature" }), { status: 401 });
    }
    
    const payload = JSON.parse(rawBody);
    const { repository, ref, after } = payload

    // 1. 只處理 main 分支的推送
    if (ref !== 'refs/heads/main') {
      return new Response(JSON.stringify({ message: "Not main branch, skipping." }), { status: 200 })
    }

    // 2. 初始化 Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 3. 尋找對應的站點 (github_repo 格式為 "user/repo")
    const { data: site, error: siteError } = await supabase
      .from('sites')
      .select('*')
      .eq('github_repo', repository.full_name)
      .single()

    if (siteError || !site) {
      console.error("Site not found for repo:", repository.full_name)
      return new Response(JSON.stringify({ error: "Site not found" }), { status: 404 })
    }

    // 4. 建立一筆新的 Deployment 紀錄
    const { data: deploy, error: deployError } = await supabase
      .from('deployments')
      .insert({
        site_id: site.id,
        user_id: site.user_id,
        status: 'building',
        commit_hash: after.substring(0, 7),
        log: ['Webhook received: Triggering automated build...']
      })
      .select()
      .single()

    // 5. 觸發 GitHub Action (Repository Dispatch)
    const githubResponse = await fetch(`https://api.github.com/repos/${repository.full_name}/dispatches`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${Deno.env.get('GITHUB_ACCESS_TOKEN')}`,
        'Accept': 'application/vnd.github.v3+json'
      },
      body: JSON.stringify({
        event_type: 'deployify_build',
        client_payload: {
          site_id: site.id,
          deployment_id: deploy.id,
          slug: site.slug
        }
      })
    })

    return new Response(JSON.stringify({ success: true, dispatch: githubResponse.status }), { 
      status: 200,
      headers: { "Content-Type": "application/json" }
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})

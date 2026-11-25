export type GitHubUser = { login: string; avatar_url: string; name?: string | null }
export type GitHubRepo = { id: number; name: string; full_name: string; description: string | null; default_branch: string; html_url: string; updated_at: string; private: boolean; owner: { login: string } }
export type DeviceCode = { device_code: string; user_code: string; verification_uri: string; expires_in: number; interval: number }
const API = 'https://api.github.com'
const CLIENT_ID = (import.meta.env.VITE_GITHUB_CLIENT_ID as string | undefined) || 'Ov23liq5pfc8zc6T0VZu'
const SCOPES = 'gist,read:user'
export const githubClientConfigured = Boolean(CLIENT_ID)
async function request<T>(url: string, token?: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers)
  headers.set('Accept', 'application/vnd.github+json')
  headers.set('X-GitHub-Api-Version', '2022-11-28')
  if (token) headers.set('Authorization', 'Bearer ' + token)
  const response = await fetch(url, { ...init, headers })
  if (!response.ok) { const body = await response.text(); throw new Error(response.status + ' GitHub API: ' + (body || response.statusText)) }
  return response.json() as Promise<T>
}
export async function startDeviceFlow(): Promise<DeviceCode> {
  if (!CLIENT_ID) throw new Error('GitHub OAuth client ID is not configured. Set VITE_GITHUB_CLIENT_ID in your environment.')
  const response = await fetch('/.netlify/functions/github-device', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: CLIENT_ID, scope: SCOPES })
  })
  const raw = await response.text()
  let data: (DeviceCode & { error?: string; detail?: string }) | null = null
  try { data = JSON.parse(raw) } catch {}
  if (!response.ok || !data || data.error) {
    const detail = data?.detail || data?.error || raw.slice(0, 180).replace(/\\s+/g, ' ')
    throw new Error('Device endpoint returned HTTP ' + response.status + ': ' + detail)
  }
  return data
}
export async function pollDeviceToken(device: DeviceCode): Promise<string> {
  if (!CLIENT_ID) throw new Error('GitHub OAuth client ID is not configured.')
  const response = await fetch('/.netlify/functions/github-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      device_code: device.device_code,
      grant_type: 'urn:ietf:params:oauth:grant-type:device_code'
    })
  })
  const raw = await response.text()
  let result: {access_token?:string;error?:string;interval?:number;detail?:string} = {}
  try { result = JSON.parse(raw) } catch {}
  if (!response.ok && !result.error) throw new Error('Token endpoint returned HTTP ' + response.status + ': ' + raw.slice(0, 180).replace(/\\s+/g, ' '))
  if (result.access_token) return result.access_token
  if (result.error === 'authorization_pending') throw new Error('authorization_pending')
  if (result.error === 'slow_down') throw new Error('slow_down')
  if (result.error === 'expired_token') throw new Error('expired_token')
  if (result.error === 'access_denied') throw new Error('access_denied')
  throw new Error(result.detail || result.error || 'GitHub authorization failed')
}
export const getUser = (token:string) => request<GitHubUser>(API+'/user',token)
export const getRepos = (token:string) => request<GitHubRepo[]>(API+'/user/repos?visibility=public&sort=updated&per_page=100',token)
export type Gist = { id:string; description:string; files:Record<string,{content:string}>; public:boolean }
export const listGists = (token:string) => request<Gist[]>(API+'/gists?per_page=100',token)
export async function saveGist(token:string, gistId:string|null, content:string):Promise<Gist>{
 const payload={description:'RepoPulse personal configuration — selected repositories and preferences',public:false,files:{'repopulse-config.json':{content}}}
 if(gistId) return request<Gist>(API+'/gists/'+gistId,token,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)})
 return request<Gist>(API+'/gists',token,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)})
}
export async function findConfigGist(token:string):Promise<Gist|null>{ const gists=await listGists(token); const match=gists.find(g=>Object.keys(g.files||{}).includes('repopulse-config.json') && !g.public); if(!match)return null; return request<Gist>(API+'/gists/'+match.id,token) }
export async function readTextFile(token:string, repo:GitHubRepo, path:string):Promise<string|null>{
 const url=API+'/repos/'+repo.owner.login+'/'+repo.name+'/contents/'+path.split('/').map(encodeURIComponent).join('/')+'?ref='+encodeURIComponent(repo.default_branch)
 try{ const item=await request<{type:string;content?:string;encoding?:string}>(url,token); if(item.type!=='file'||!item.content)return null; return new TextDecoder().decode(Uint8Array.from(atob(item.content.replace(/\n/g,'')),c=>c.charCodeAt(0))) }catch{return null}
}
export async function readRepoPlan(token:string,repo:GitHubRepo):Promise<{plan:string;log:string;planPath:string;logPath:string|null}>{
 const tree=await request<{tree:{path:string;type:string}[]}>(API+'/repos/'+repo.owner.login+'/'+repo.name+'/git/trees/'+encodeURIComponent(repo.default_branch)+'?recursive=1',token)
 const paths=tree.tree.filter(x=>x.type==='blob').map(x=>x.path)
 const planCandidates=['PLAN.md','plan.md','ROADMAP.md','roadmap.md','TODO.md','TASKS.md','tasks.md']
 const planPath=planCandidates.map(name=>paths.find(p=>p.toLowerCase()===name.toLowerCase())).find(Boolean) ?? paths.find(p=>/plan|roadmap|task/i.test(p.split('/').pop()||'')) ?? paths.find(p=>p.toLowerCase()==='readme.md')
 const logPath=paths.find(p=>/logbook|devlog|development-log/i.test(p.split('/').pop()||'')) ?? null
 const plan=planPath?await readTextFile(token,repo,planPath):null; const log=logPath?await readTextFile(token,repo,logPath):null
 return {plan:plan??'',log:log??'',planPath:planPath??'',logPath}
}
export async function getLatestCommit(token:string,repo:GitHubRepo):Promise<string>{const c=await request<{sha:string}[]>(API+'/repos/'+repo.owner.login+'/'+repo.name+'/commits?per_page=1',token);return c[0]?.sha??''}

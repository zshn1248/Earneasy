// Allow runtime override by setting window.__API_BASE__ in the deployed index.html
const runtimeBase = (typeof window !== 'undefined' && window.__API_BASE__) ? window.__API_BASE__ : null

// Derive a sensible default backend base URL in this order:
// 1) runtime override (window.__API_BASE__)
// 2) build-time env VITE_API_URL
// 3) if running in a browser, assume the same host but backend on port 4000
// 4) fallback to localhost:4000 for local development
let configured = runtimeBase || import.meta.env.VITE_API_URL || null
if(!configured && typeof window !== 'undefined'){
  // build host-based URL so a frontend served from srv1247782 can call srv1247782:4000
  const proto = window.location.protocol || 'http:'
  const host = window.location.hostname
  configured = `${proto}//${host}:4000`
  console.warn('[api] no VITE_API_URL/runtime override; defaulting to', configured)
}
if(!configured) configured = 'http://localhost:4000'
const BASE = configured.endsWith('/api') ? configured : configured + '/api'

let token = localStorage.getItem('de_token') || null
let adminSecret = null

function authHeaders(){
  return token ? { 'Authorization': 'Bearer ' + token } : {}
}

export async function signup({name,email,phone,password}){
  const res = await fetch(BASE + '/auth/signup', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({name,email,phone,password}) })
  return res.json()
}

export async function login({email,password}){
  const res = await fetch(BASE + '/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({email,password}) })
  return res.json()
}

export async function me(){
  const res = await fetch(BASE + '/auth/me', { headers: { ...authHeaders() } })
  return res.json()
}

export async function getPackages(){
  const res = await fetch(BASE + '/packages')
  return res.json()
}

export async function buyPackage(packageId){
  const res = await fetch(BASE + '/packages/buy', { method:'POST', headers: { 'Content-Type':'application/json', ...authHeaders() }, body: JSON.stringify({ packageId }) })
  return res.json()
}

export async function getTasks(){
  const res = await fetch(BASE + '/tasks')
  return res.json()
}

export async function completeTask(taskId){
  const res = await fetch(BASE + '/tasks/complete', { method:'POST', headers: { 'Content-Type':'application/json', ...authHeaders() }, body: JSON.stringify({ taskId }) })
  return res.json()
}

export async function getBalance(){
  const res = await fetch(BASE + '/wallet/balance', { headers: { ...authHeaders() } })
  return res.json()
}

export async function getTransactions(){
  const res = await fetch(BASE + '/wallet/transactions', { headers: { ...authHeaders() } })
  return res.json()
}

export async function withdraw({amount,method,account}){
  const res = await fetch(BASE + '/wallet/withdraw', { method:'POST', headers: { 'Content-Type':'application/json', ...authHeaders() }, body: JSON.stringify({ amount, method, account }) })
  return res.json()
}

export async function claimDaily(){
  const res = await fetch(BASE + '/wallet/claim', { method: 'POST', headers: { ...authHeaders() } })
  return res.json()
}

export async function submitDeposit({accountHolder, transactionId, amount, method, screenshotFile}){
  const form = new FormData()
  form.append('accountHolder', accountHolder)
  form.append('transactionId', transactionId)
  form.append('amount', amount)
  form.append('method', method)
  if(arguments[0].packageId) form.append('packageId', arguments[0].packageId)
  if(screenshotFile) form.append('screenshot', screenshotFile)
  const res = await fetch(BASE + '/deposits', { method:'POST', headers: { ...authHeaders() }, body: form })
  return res.json()
}

export async function getMyDeposits(){
  const res = await fetch(BASE + '/deposits', { headers: { ...authHeaders() } })
  return res.json()
}

// admin
export async function adminApproveDeposit(id){
  const res = await fetch(BASE + `/admin/deposits/${id}/approve`, { method:'POST', headers: { ...authHeaders() } })
  return res.json()
}

export async function adminRejectDeposit(id){
  const res = await fetch(BASE + `/admin/deposits/${id}/reject`, { method:'POST', headers: { ...authHeaders() } })
  return res.json()
}

export function setAdminSecret(s){ adminSecret = s }

function adminHeaders(){
  const h = { ...authHeaders() }
  if(adminSecret) h['x-admin-secret'] = adminSecret
  return h
}

// override admin APIs to include adminHeaders
export async function adminGetDeposits(){
  const res = await fetch(BASE + '/admin/deposits', { headers: { ...adminHeaders() } })
  return res.json()
}

export async function adminGetBlocked(){
  const res = await fetch(BASE + '/admin/blocked', { headers: { ...adminHeaders() } })
  return res.json()
}

export async function adminUnblock(ip){
  const res = await fetch(BASE + `/admin/blocked/${encodeURIComponent(ip)}/unblock`, { method:'POST', headers: { ...adminHeaders() } })
  return res.json()
}

export async function adminGetWhitelist(){
  const res = await fetch(BASE + '/admin/whitelist', { headers: { ...adminHeaders() } })
  return res.json()
}

export async function adminAddWhitelist({ip,note}){
  const res = await fetch(BASE + '/admin/whitelist', { method: 'POST', headers: { 'Content-Type':'application/json', ...adminHeaders() }, body: JSON.stringify({ ip, note }) })
  return res.json()
}

export async function adminRemoveWhitelist(ip){
  const res = await fetch(BASE + `/admin/whitelist/${encodeURIComponent(ip)}/remove`, { method: 'POST', headers: { ...adminHeaders() } })
  return res.json()
}

export async function adminGetUsers(){
  const res = await fetch(BASE + '/admin/users', { headers: { ...adminHeaders() } })
  return res.json()
}

export async function adminGetTransactions(){
  const res = await fetch(BASE + '/admin/transactions', { headers: { ...adminHeaders() } })
  return res.json()
}

export async function adminApproveWithdraw(id){
  const res = await fetch(BASE + `/admin/withdraws/${id}/approve`, { method:'POST', headers: { ...adminHeaders() } })
  return res.json()
}

export async function adminRejectWithdraw(id){
  const res = await fetch(BASE + `/admin/withdraws/${id}/reject`, { method:'POST', headers: { ...adminHeaders() } })
  return res.json()
}

export async function adminGetWithdraws(){
  const res = await fetch(BASE + '/admin/withdraws', { headers: { ...adminHeaders() } })
  return res.json()
}

export async function adminMarkWithdrawSent(id){
  const res = await fetch(BASE + `/admin/withdraws/${id}/sent`, { method:'POST', headers: { ...adminHeaders() } })
  return res.json()
}

export async function adminConfirmWithdraw(id){
  const res = await fetch(BASE + `/admin/withdraws/${id}/complete`, { method:'POST', headers: { ...adminHeaders() } })
  return res.json()
}

export function setToken(t){ token = t; if(t) localStorage.setItem('de_token', t); else localStorage.removeItem('de_token') }

export default {
  signup, login, me, getPackages, buyPackage, getTasks, completeTask,
  getBalance, getTransactions, withdraw, submitDeposit, getMyDeposits,
  claimDaily,
  // admin helpers
  adminGetDeposits, adminApproveDeposit, adminRejectDeposit,
  adminGetBlocked, adminUnblock, adminGetUsers, adminGetTransactions,
  adminGetWhitelist, adminAddWhitelist, adminRemoveWhitelist,
  adminGetWithdraws, adminMarkWithdrawSent, adminConfirmWithdraw,
  adminApproveWithdraw, adminRejectWithdraw,
  // secrets & auth
  setAdminSecret, setToken
}

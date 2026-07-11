// src/lib/api.js — Centralized API client
import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || ''

const http = axios.create({
  baseURL: `${BASE}/api/admin`,
  timeout: 20_000,
})

// ── Request interceptor — token qo'shish ────────────────────────────────────
http.interceptors.request.use(cfg => {
  const token = localStorage.getItem('bp_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

// ── Response interceptor — 401 → refresh token ───────────────────────────────
let _refreshing = null

http.interceptors.response.use(
  r => r,
  async err => {
    const status = err.response?.status
    const isLogin = window.location.pathname === '/login'

    if (status === 401 && !isLogin && !err.config._retry) {
      if (!_refreshing) {
        _refreshing = (async () => {
          const refresh = localStorage.getItem('bp_refresh')
          if (!refresh) throw new Error('No refresh token')
          const r = await axios.post(`${BASE}/api/admin/refresh`, { refresh })
          const token = r.data?.data?.token
          if (!token) throw new Error('No token in refresh response')
          localStorage.setItem('bp_token', token)
          return token
        })().finally(() => { _refreshing = null })
      }

      try {
        const token = await _refreshing
        err.config._retry = true
        err.config.headers.Authorization = `Bearer ${token}`
        return http(err.config)
      } catch {
        localStorage.removeItem('bp_token')
        localStorage.removeItem('bp_refresh')
        window.location.href = '/login'
      }
    }

    return Promise.reject(
      err.response?.data?.error || err.message || 'Server xatosi'
    )
  }
)

// ── Helper ─────────────────────────────────────────────────────────────────────
const q = (method, url, data, params) =>
  http({ method, url, data, params }).then(r => r.data?.data ?? r.data)

// ── Auth ──────────────────────────────────────────────────────────────────────
export const login = async (email, password) => {
  const r = await http.post('/login', { email, password })
  return r.data
}

// ── Shops ─────────────────────────────────────────────────────────────────────
export const getShops    = p      => q('get',    '/shops', null, p)
export const getShop     = id     => q('get',    `/shops/${id}`)
export const createShop  = data   => q('post',   '/shops', data)
export const updateShop  = (id,d) => q('put',    `/shops/${id}`, d)
export const deleteShop  = id     => q('delete', `/shops/${id}`)
export const toggleShop  = id     => q('patch',  `/shops/${id}/toggle`)
export const restartBot  = id     => q('post',   `/shops/${id}/restart`)
export const activateShop= id     => q('post',   `/shops/${id}/activate`)

// ── Addons ────────────────────────────────────────────────────────────────────
export const getAddons    = id         => q('get',  `/shops/${id}/addons`)
export const enableAddon  = (id,addon) => q('post', `/shops/${id}/addons/${addon}/enable`)
export const disableAddon = (id,addon) => q('post', `/shops/${id}/addons/${addon}/disable`)

// ── Workers ───────────────────────────────────────────────────────────────────
export const getWorkers   = shopId         => q('get',    `/shops/${shopId}/workers`)
export const createWorker = (shopId,d)     => q('post',   `/shops/${shopId}/workers`, d)
export const updateWorker = (shopId,wId,d) => q('put',    `/shops/${shopId}/workers/${wId}`, d)
export const deleteWorker = (shopId,wId)   => q('delete', `/shops/${shopId}/workers/${wId}`)

// ── Customers ─────────────────────────────────────────────────────────────────
export const getCustomers  = (shopId,p)    => q('get',   `/shops/${shopId}/customers`, null, p)
export const blockCustomer = (shopId,cId)  => q('patch', `/shops/${shopId}/customers/${cId}/block`)

// ── Stats ─────────────────────────────────────────────────────────────────────
export const getStats     = ()  => q('get', '/stats')
export const getBotStatus = ()  => q('get', '/bots/status')
export const getAudit     = p   => q('get', '/audit', null, p)
export const getOpenAICost= p   => q('get', '/openai/cost', null, p)
export const getPlans     = ()  => q('get', '/plans')

// ── Backup ────────────────────────────────────────────────────────────────────
export const getBackupStatus = ()    => q('get',  '/backup/status')
export const triggerBackup   = ()    => q('post', '/backup/trigger')
export const restoreBackup   = data  => q('post', '/backup/restore', data)

export default http

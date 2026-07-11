// src/pages/Login.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../lib/api.js'
import { Spinner } from '../components/UI.jsx'

export default function Login() {
  const [email,   setEmail]   = useState(import.meta.env.VITE_ADMIN_EMAIL || 'admin@botpos.uz')
  const [pass,    setPass]    = useState('')
  const [err,     setErr]     = useState('')
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()

  async function submit(e) {
    e.preventDefault()
    setErr(''); setLoading(true)
    try {
      const json = await login(email.trim(), pass)
      if (!json.ok) { setErr(json.error || 'Login yoki parol xato'); return }
      const token   = json.data?.token
      const refresh = json.data?.refresh
      if (!token) { setErr("Token kelmadi — server xatosi"); return }
      localStorage.setItem('bp_token',   token)
      localStorage.setItem('bp_refresh', refresh || '')
      nav('/')
    } catch (e) {
      setErr(typeof e === 'string' ? e : "Server bilan ulanib bo'lmadi")
    } finally {
      setLoading(false)
    }
  }

  const inp = {
    width: '100%', padding: '11px 14px',
    borderRadius: 'var(--r)',
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    color: 'var(--text)', fontSize: 14,
    outline: 'none', fontFamily: 'inherit',
    boxSizing: 'border-box',
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)',
    }}>
      <div style={{
        width: 380,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r3)',
        padding: 40,
        boxShadow: '0 8px 40px rgba(0,0,0,.25)',
        animation: 'fadeIn .3s ease',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--gold)' }}/>
            <span style={{ fontWeight: 800, fontSize: 19, letterSpacing: -.4 }}>BOT·POS Admin</span>
          </div>
          <div style={{ color: 'var(--text2)', fontSize: 13 }}>Super Admin kirishi</div>
        </div>

        <form onSubmit={submit} autoComplete="on" noValidate>
          <div style={{ marginBottom: 16 }}>
            <label style={{
              display: 'block', fontSize: 11, color: 'var(--text2)',
              marginBottom: 6, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: .6,
            }}>Email</label>
            <input
              type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@botpos.uz"
              autoComplete="email"
              required style={inp}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: 'block', fontSize: 11, color: 'var(--text2)',
              marginBottom: 6, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: .6,
            }}>Parol</label>
            <input
              type="password" value={pass}
              onChange={e => setPass(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required style={inp}
            />
          </div>

          {err && (
            <div style={{
              color: 'var(--red)', fontSize: 13,
              marginBottom: 16, padding: '10px 14px',
              background: 'var(--red2)', borderRadius: 'var(--r)',
              lineHeight: 1.5,
            }}>
              ⚠ {err}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email || !pass}
            style={{
              width: '100%', padding: 13,
              borderRadius: 'var(--r)',
              background: loading || !email || !pass ? 'var(--surface3)' : 'var(--gold)',
              color: '#000', fontWeight: 700, fontSize: 15,
              border: 'none',
              cursor: loading || !email || !pass ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'background .15s',
            }}
          >
            {loading && <Spinner size={16} color="#000"/>}
            {loading ? 'Kirmoqda...' : 'Kirish →'}
          </button>
        </form>

        <div style={{ marginTop: 20, fontSize: 10, color: 'var(--text3)', textAlign: 'center' }}>
          API: {import.meta.env.VITE_API_URL || 'http://localhost:6060'}
        </div>
      </div>
    </div>
  )
}

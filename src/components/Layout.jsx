// src/components/Layout.jsx
import { useState } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'

const NAV = [
  { to: '/',       icon: '📊', label: 'Dashboard',   end: true },
  { to: '/shops',  icon: '🏪', label: "Do'konlar" },
  { to: '/openai', icon: '🤖', label: 'OpenAI xarajat' },
  { to: '/audit',  icon: '📋', label: 'Audit Log' },
  { to: '/backup', icon: '💾', label: 'Backup' },
]

export default function Layout() {
  const nav = useNavigate()
  const loc = useLocation()
  const [col, setCol] = useState(false)

  // Breadcrumb
  const crumbs = loc.pathname.split('/').filter(Boolean)
  const breadcrumb = crumbs.length > 0
    ? crumbs.map((c,i) => (
        <span key={i} style={{ color: i === crumbs.length-1 ? 'var(--text)' : 'var(--text2)' }}>
          {i > 0 && <span style={{ margin: '0 6px', opacity: .4 }}>/</span>}
          {c}
        </span>
      ))
    : null

  const W = col ? 60 : 220

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: W, minHeight: '100vh',
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        transition: 'width .2s', overflow: 'hidden',
        flexShrink: 0, position: 'sticky', top: 0, height: '100vh',
      }}>
        {/* Logo */}
        <div
          onClick={() => setCol(c => !c)}
          style={{
            display: 'flex', alignItems: 'center',
            gap: 10, padding: col ? '20px 18px' : '20px',
            borderBottom: '1px solid var(--border)',
            cursor: 'pointer', userSelect: 'none',
            transition: 'padding .2s',
          }}
        >
          <span style={{
            width: 10, height: 10, borderRadius: '50%',
            background: 'var(--gold)', flexShrink: 0,
          }}/>
          {!col && (
            <>
              <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: -.3 }}>BOT·POS</span>
              <span style={{
                fontSize: 10, padding: '2px 8px', borderRadius: 99,
                background: 'var(--gold2)', color: 'var(--gold)',
                fontWeight: 700, letterSpacing: .5,
              }}>
                Admin
              </span>
            </>
          )}
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV.map(n => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              title={col ? n.label : undefined}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center',
                gap: 10, padding: col ? '10px 18px' : '10px 12px',
                borderRadius: 'var(--r)',
                color: isActive ? 'var(--gold)' : 'var(--text2)',
                background: isActive ? 'var(--gold2)' : 'transparent',
                fontWeight: isActive ? 600 : 400,
                fontSize: 14, whiteSpace: 'nowrap',
                transition: 'all .15s',
                textDecoration: 'none',
              })}
            >
              <span style={{ fontSize: 16, flexShrink: 0 }}>{n.icon}</span>
              {!col && <span>{n.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: 8, borderTop: '1px solid var(--border)' }}>
          <button
            onClick={() => { localStorage.clear(); nav('/login') }}
            title={col ? 'Chiqish' : undefined}
            style={{
              display: 'flex', alignItems: 'center',
              gap: 10, width: '100%',
              padding: col ? '10px 18px' : '10px 12px',
              borderRadius: 'var(--r)',
              background: 'var(--red2)', color: 'var(--red)',
              fontSize: 14, transition: 'opacity .15s',
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ flexShrink: 0 }}>🚪</span>
            {!col && <span>Chiqish</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* Topbar */}
        <header style={{
          height: 52, borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center',
          padding: '0 24px', background: 'var(--surface)',
          flexShrink: 0, gap: 8,
        }}>
          <span style={{ fontSize: 12, color: 'var(--text3)' }}>BOT·POS</span>
          {breadcrumb}
        </header>

        {/* Content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: 28 }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

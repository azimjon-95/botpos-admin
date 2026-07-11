// src/components/UI.jsx — BOT·POS Admin Design System
import { useState } from 'react'

// ── Token helpers ──────────────────────────────────────────────────────────────
const COLOR = {
  gold:   'var(--gold)',   gold2:   'var(--gold2)',
  green:  'var(--green)',  green2:  'var(--green2)',
  red:    'var(--red)',    red2:    'var(--red2)',
  blue:   'var(--blue)',   blue2:   'var(--blue2)',
  purple: 'var(--purple)', purple2: 'var(--purple2)',
  orange: 'var(--orange)', orange2: 'var(--orange2)',
  gray:   'var(--text2)',  gray2:   'var(--surface2)',
}
const c  = k => COLOR[k]    || k
const c2 = k => COLOR[k+'2']|| COLOR[k] || k

// ── Spinner ────────────────────────────────────────────────────────────────────
export function Spinner({ size = 18, color = 'var(--gold)' }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      border: `2px solid ${color}30`,
      borderTopColor: color,
      animation: 'spin .7s linear infinite',
      flexShrink: 0,
    }} />
  )
}

// ── Button ─────────────────────────────────────────────────────────────────────
export function Btn({ children, onClick, color='gold', size='md', disabled, loading, style={}, type='button' }) {
  const pad = size==='sm' ? '6px 14px' : size==='lg' ? '13px 28px' : '9px 20px'
  const fz  = size==='sm' ? 12 : 14
  const col = c(color), bg = c2(color)
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: pad, borderRadius: 'var(--r)',
        fontSize: fz, fontWeight: 600,
        background: bg, color: col,
        border: `1px solid ${col}33`,
        opacity: (disabled || loading) ? .5 : 1,
        cursor: (disabled || loading) ? 'not-allowed' : 'pointer',
        transition: 'all .15s',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {loading && <Spinner size={12} color={col}/>}
      {children}
    </button>
  )
}

// ── Badge ──────────────────────────────────────────────────────────────────────
export function Badge({ children, color = 'gray' }) {
  const col = c(color), bg = c2(color)
  return (
    <span style={{
      fontSize: 11, padding: '3px 9px', borderRadius: 99,
      background: bg, color: col, fontWeight: 600,
      whiteSpace: 'nowrap', display: 'inline-block',
    }}>
      {children}
    </span>
  )
}

// ── Card ───────────────────────────────────────────────────────────────────────
export function Card({ children, style={}, p=24 }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--r3)',
      padding: p,
      ...style,
    }}>
      {children}
    </div>
  )
}

// ── StatCard ──────────────────────────────────────────────────────────────────
export function StatCard({ icon, label, value, color='gray', sub }) {
  const col = c(color), bg = c2(color)
  return (
    <Card p={18} style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', top: -10, right: -10,
        width: 60, height: 60, borderRadius: '50%',
        background: bg, opacity: .6,
      }}/>
      <div style={{ fontSize: 22, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: col, letterSpacing: -.5 }}>
        {value ?? <Spinner size={20} color={col}/>}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{sub}</div>}
    </Card>
  )
}

// ── Section title ─────────────────────────────────────────────────────────────
export function SectionTitle({ children, sub, action }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', letterSpacing: -.3 }}>{children}</h1>
        {sub && <p style={{ color: 'var(--text2)', fontSize: 13, marginTop: 3 }}>{sub}</p>}
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  )
}

// ── Input ──────────────────────────────────────────────────────────────────────
export function Input({ label, value, onChange, placeholder, type='text', required, hint, rows, style={} }) {
  const base = {
    width: '100%', padding: '10px 14px',
    borderRadius: 'var(--r)',
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    color: 'var(--text)', fontSize: 14,
    outline: 'none', fontFamily: 'inherit',
    transition: 'border-color .15s',
    ...style,
  }
  return (
    <div style={{ marginBottom: 14 }}>
      {label && (
        <label style={{
          display: 'block', fontSize: 11, color: 'var(--text2)',
          marginBottom: 6, fontWeight: 600,
          textTransform: 'uppercase', letterSpacing: .6,
        }}>
          {label}{required && <span style={{ color: 'var(--red)', marginLeft: 3 }}>*</span>}
        </label>
      )}
      {rows
        ? <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows} style={{ ...base, resize: 'vertical' }}/>
        : <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} required={required} style={base}/>
      }
      {hint && <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 5 }}>{hint}</p>}
    </div>
  )
}

// ── Select ─────────────────────────────────────────────────────────────────────
export function Select({ label, value, onChange, options = [], required }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && (
        <label style={{
          display: 'block', fontSize: 11, color: 'var(--text2)',
          marginBottom: 6, fontWeight: 600,
          textTransform: 'uppercase', letterSpacing: .6,
        }}>
          {label}{required && <span style={{ color: 'var(--red)', marginLeft: 3 }}>*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', padding: '10px 14px',
          borderRadius: 'var(--r)',
          background: 'var(--surface2)',
          border: '1px solid var(--border)',
          color: 'var(--text)', fontSize: 14,
          outline: 'none',
        }}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}

// ── Table ──────────────────────────────────────────────────────────────────────
export function Table({ cols, rows, loading, emptyText = 'Ma\'lumot yo\'q' }) {
  if (loading) return (
    <Card>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', color: 'var(--text2)', fontSize: 13, padding: 8 }}>
        <Spinner size={16}/> Yuklanmoqda...
      </div>
    </Card>
  )
  return (
    <Card p={0} style={{ overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {cols.map(col => (
                <th key={col.label} style={{
                  padding: '10px 16px', textAlign: 'left',
                  fontSize: 11, color: 'var(--text2)',
                  fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: .7, whiteSpace: 'nowrap',
                }}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={cols.length} style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>
                  {emptyText}
                </td>
              </tr>
            ) : rows.map((row, i) => (
              <tr key={row._id || i} style={{
                borderBottom: '1px solid var(--border)',
                transition: 'background .1s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {cols.map(col => (
                  <td key={col.label} style={{ padding: '12px 16px', fontSize: 13, verticalAlign: 'middle' }}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

// ── Pagination ─────────────────────────────────────────────────────────────────
export function Pagination({ page, pages, onPage }) {
  if (pages <= 1) return null
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 16 }}>
      <Btn size='sm' color='gray' onClick={() => onPage(page-1)} disabled={page<=1}>← Oldingi</Btn>
      <span style={{ padding: '6px 14px', fontSize: 13, color: 'var(--text2)', whiteSpace: 'nowrap' }}>
        {page} / {pages}
      </span>
      <Btn size='sm' color='gray' onClick={() => onPage(page+1)} disabled={page>=pages}>Keyingi →</Btn>
    </div>
  )
}

// ── Modal ──────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, width = 480 }) {
  if (!open) return null
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 500,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%', maxWidth: width,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r3)',
          boxShadow: 'var(--shadow)',
          animation: 'fadeIn .2s ease',
        }}
        onClick={e => e.stopPropagation()}
      >
        {title && (
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '16px 20px', borderBottom: '1px solid var(--border)',
          }}>
            <h2 style={{ fontSize: 15, fontWeight: 700 }}>{title}</h2>
            <button onClick={onClose} style={{
              width: 28, height: 28, borderRadius: 'var(--r)',
              background: 'var(--surface2)',
              color: 'var(--text2)', fontSize: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>✕</button>
          </div>
        )}
        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>
  )
}

// ── Alert ──────────────────────────────────────────────────────────────────────
export function Alert({ children, color = 'red', onClose }) {
  if (!children) return null
  const col = c(color)
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      padding: '10px 14px', borderRadius: 'var(--r)',
      background: c2(color), border: `1px solid ${col}33`,
      color: col, fontSize: 13, marginBottom: 14, gap: 8,
    }}>
      <span style={{ flex: 1 }}>⚠ {children}</span>
      {onClose && (
        <button onClick={onClose} style={{ color: col, opacity: .6, fontSize: 12, flexShrink: 0 }}>✕</button>
      )}
    </div>
  )
}

// ── Status dot ─────────────────────────────────────────────────────────────────
export function StatusDot({ on, label }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
      <span style={{
        width: 7, height: 7, borderRadius: '50%',
        background: on ? 'var(--green)' : 'var(--red)',
        display: 'inline-block',
      }}/>
      {label ?? (on ? 'Faol' : 'Nofaol')}
    </span>
  )
}

// ── Toggle ─────────────────────────────────────────────────────────────────────
export function Toggle({ on, onChange, label }) {
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}>
      <div
        onClick={() => onChange(!on)}
        style={{
          width: 40, height: 22, borderRadius: 99,
          background: on ? 'var(--green)' : 'var(--surface3)',
          position: 'relative', transition: 'background .2s',
          flexShrink: 0,
        }}
      >
        <div style={{
          position: 'absolute', top: 3,
          left: on ? 21 : 3, width: 16, height: 16,
          borderRadius: '50%', background: '#fff',
          transition: 'left .2s',
        }}/>
      </div>
      {label && <span style={{ fontSize: 13, color: 'var(--text2)' }}>{label}</span>}
    </label>
  )
}

// ── Empty state ────────────────────────────────────────────────────────────────
export function Empty({ emoji = '📭', title = 'Ma\'lumot yo\'q', sub, action }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px' }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>{emoji}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>{title}</div>
      {sub && <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: action ? 20 : 0 }}>{sub}</div>}
      {action}
    </div>
  )
}

// ── Skeleton ───────────────────────────────────────────────────────────────────
export function Skeleton({ h = 16, w = '100%', r = 'var(--r)' }) {
  return (
    <div style={{
      height: h, width: w, borderRadius: r,
      background: 'linear-gradient(90deg, var(--surface2) 0%, var(--surface3) 50%, var(--surface2) 100%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.4s infinite',
    }}/>
  )
}

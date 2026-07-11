// src/pages/ShopForm.jsx — Yangi do'kon yaratish / tahrirlash
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createShop, getShop, updateShop } from '../lib/api.js'
import { Btn, Alert, Spinner } from '../components/UI.jsx'

// ── Step config ───────────────────────────────────────────────────────────────
const STEPS = [
  {
    key:   'basic',
    icon:  '🏪',
    label: 'Asosiy',
    title: "Do'kon ma'lumotlari",
    desc:  "Do'kon nomi, egasi va aloqa",
  },
  {
    key:   'bot',
    icon:  '🤖',
    label: 'Bot',
    title: 'Telegram bot sozlamalari',
    desc:  'Bot token va guruh ID',
  },
  {
    key:   'plan',
    icon:  '💎',
    label: 'Tarif',
    title: 'Tarif va qo\'shimcha',
    desc:  "Tarif rejasi va kengaytirilgan sozlamalar",
  },
]

const PLANS = [
  { value: 'starter',  label: '🌱 Boshlanish',  price: '99,000',  desc: 'Sotuv, chiqim, kassa, hisobot (3 xodim)' },
  { value: 'standart', label: '⭐ Standart',     price: '149,000', desc: '+ Dashboard (10 xodim)' },
  { value: 'pro',      label: '💎 Pro',           price: '249,000', desc: '+ Addon yoqish (cheksiz xodim)' },
  { value: 'biznes',   label: '🏆 Biznes',        price: '399,000', desc: 'Hammasi bepul' },
]

// ── Field component ───────────────────────────────────────────────────────────
function Field({ label, value, onChange, placeholder, type='text', required, hint, disabled, show, onShow }) {
  const isPassword = type === 'password'
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', fontSize: 11, fontWeight: 700,
        color: 'var(--text2)', marginBottom: 7,
        textTransform: 'uppercase', letterSpacing: .7,
      }}>
        <span>{label}{required && <span style={{ color:'var(--red)', marginLeft:3 }}>*</span>}</span>
        {isPassword && onShow && (
          <button type='button' onClick={onShow}
            style={{ background:'none', border:'none', fontSize:11,
              color:'var(--blue)', cursor:'pointer', textTransform:'none',
              letterSpacing:0, fontWeight:500 }}>
            {show ? '🙈 Yashirish' : '👁 Ko\'rish'}
          </button>
        )}
      </label>
      <input
        type={isPassword && !show ? 'password' : 'text'}
        value={disabled ? '' : (value || '')}
        onChange={e => onChange(e.target.value)}
        placeholder={disabled ? '— o\'zgartirilmaydi —' : placeholder}
        required={required && !disabled}
        disabled={disabled}
        style={{
          width: '100%', padding: '11px 14px',
          borderRadius: 10, fontSize: 14,
          background: disabled ? 'var(--surface3)' : 'var(--surface2)',
          border: `1.5px solid var(--border)`,
          color: disabled ? 'var(--text3)' : 'var(--text)',
          outline: 'none', fontFamily: 'inherit',
          transition: 'border-color .15s',
          boxSizing: 'border-box',
        }}
        onFocus={e => !disabled && (e.target.style.borderColor = 'var(--gold)')}
        onBlur={e => e.target.style.borderColor = 'var(--border)'}
      />
      {hint && <p style={{ fontSize:11, color:'var(--text3)', marginTop:5, lineHeight:1.5 }}>{hint}</p>}
    </div>
  )
}

// ── Step 1: Asosiy ────────────────────────────────────────────────────────────
function StepBasic({ form, set }) {
  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 20px' }}>
        <Field
          label="Do'kon nomi" required
          value={form.name} onChange={v=>set('name',v)}
          placeholder="Totli Tortlar"
        />
        <Field
          label="Egasi ismi" required
          value={form.ownerName} onChange={v=>set('ownerName',v)}
          placeholder="Azimjon Mirzo"
        />
        <Field
          label="Telefon" required
          value={form.phone} onChange={v=>set('phone',v)}
          placeholder="+998901234567"
        />
        <Field
          label="Soha"
          value={form.sector} onChange={v=>set('sector',v)}
          placeholder="Tort, Restoran, Dorixona..."
        />
      </div>
      <Field
        label="Manzil"
        value={form.address} onChange={v=>set('address',v)}
        placeholder="Toshkent, Chilonzor 14"
      />
      <Field
        label="Izoh"
        value={form.notes} onChange={v=>set('notes',v)}
        placeholder="Qo'shimcha ma'lumot..."
      />
    </div>
  )
}

// ── Step 2: Bot ───────────────────────────────────────────────────────────────
function StepBot({ form, set, isEdit, editSecret, setEditSecret }) {
  const [showTokens, setShowTokens] = useState({})
  const toggle = k => setShowTokens(p => ({ ...p, [k]: !p[k] }))
  const disabled = k => isEdit && !editSecret && ['botToken','customerBotToken','openaiKey'].includes(k)

  return (
    <div>
      {isEdit && (
        <div style={{
          display:'flex', alignItems:'center', gap:10,
          padding:'12px 14px', borderRadius:10,
          background:'var(--gold2)', border:'1px solid var(--gold)33',
          marginBottom:18,
        }}>
          <input
            type='checkbox' id='editSecret'
            checked={editSecret}
            onChange={e=>setEditSecret(e.target.checked)}
            style={{ width:16, height:16, accentColor:'var(--gold)', cursor:'pointer' }}
          />
          <label htmlFor='editSecret' style={{ fontSize:13, color:'var(--gold)', cursor:'pointer', fontWeight:600 }}>
            🔑 Tokenlarni yangilash
          </label>
          <span style={{ fontSize:12, color:'var(--text2)' }}>
            (belgilanmasa — avvalgi tokenlar saqlanadi)
          </span>
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 20px' }}>
        <div style={{ gridColumn:'span 2' }}>
          <Field
            label="Bot token (asosiy) 🔑" required={!isEdit}
            value={form.botToken} onChange={v=>set('botToken',v)}
            placeholder="123456789:ABCDEF..."
            type='password'
            disabled={disabled('botToken')}
            show={showTokens.botToken}
            onShow={()=>toggle('botToken')}
            hint="🔒 AES-256 bilan shifrlangan saqlanadi"
          />
        </div>
        <Field
          label="Guruh Chat ID" required
          value={form.groupChatId} onChange={v=>set('groupChatId',v)}
          placeholder="-1001234567890"
        />
        <Field
          label="Admin Telegram ID"
          value={form.adminTgId} onChange={v=>set('adminTgId',v)}
          placeholder="123456789"
        />
        <Field
          label="Cashback bot token 🔑"
          value={form.customerBotToken} onChange={v=>set('customerBotToken',v)}
          placeholder="654321:ZYXWV..."
          type='password'
          disabled={disabled('customerBotToken')}
          show={showTokens.customerBotToken}
          onShow={()=>toggle('customerBotToken')}
        />
        <Field
          label="Cashback bot @username"
          value={form.customerBotUsername} onChange={v=>set('customerBotUsername',v)}
          placeholder="@totli_rewards_bot"
        />
        <Field
          label="OpenAI API key 🔑"
          value={form.openaiKey} onChange={v=>set('openaiKey',v)}
          placeholder="sk-..."
          type='password'
          disabled={disabled('openaiKey')}
          show={showTokens.openaiKey}
          onShow={()=>toggle('openaiKey')}
          hint="AI ovozli sotuv uchun (ixtiyoriy)"
        />
        <Field
          label="Bot paroli (pincode)"
          value={form.botPassword} onChange={v=>set('botPassword',v)}
          placeholder="1234"
          hint="Xodimlar bot ga kirish kodi"
        />
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 20px' }}>
        <Field
          label="Backup Chat ID"
          value={form.backupChatId} onChange={v=>set('backupChatId',v)}
          placeholder="-1009876543210"
        />
        <Field
          label="Tortchi Telegram ID"
          value={form.bakerTgId} onChange={v=>set('bakerTgId',v)}
          placeholder="987654321"
        />
      </div>
    </div>
  )
}

// ── Step 3: Tarif ─────────────────────────────────────────────────────────────
function StepPlan({ form, set }) {
  return (
    <div>
      {/* Plan cards */}
      <p style={{ fontSize:12, color:'var(--text2)', marginBottom:14,
        fontWeight:700, textTransform:'uppercase', letterSpacing:.7 }}>
        Tarif rejasi *
      </p>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:20 }}>
        {PLANS.map(p => {
          const active = form.plan === p.value
          return (
            <div key={p.value} onClick={()=>set('plan',p.value)}
              style={{
                padding:'14px 16px', borderRadius:12, cursor:'pointer',
                border:`2px solid ${active ? 'var(--gold)' : 'var(--border)'}`,
                background: active ? 'var(--gold2)' : 'var(--surface2)',
                transition:'all .15s',
              }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
                <span style={{ fontWeight:700, fontSize:14, color: active ? 'var(--gold)' : 'var(--text)' }}>
                  {p.label}
                </span>
                <span style={{ fontSize:12, fontWeight:800, color: active ? 'var(--gold)' : 'var(--text2)' }}>
                  {p.price} so'm
                </span>
              </div>
              <p style={{ fontSize:11, color:'var(--text2)', lineHeight:1.4 }}>{p.desc}</p>
              {active && <div style={{ marginTop:8, fontSize:10, color:'var(--gold)', fontWeight:700 }}>✓ TANLANDI</div>}
            </div>
          )
        })}
      </div>

      {/* Extra fields */}
      <div style={{ borderTop:'1px solid var(--border)', paddingTop:18 }}>
        <p style={{ fontSize:12, color:'var(--text2)', marginBottom:14,
          fontWeight:700, textTransform:'uppercase', letterSpacing:.7 }}>
          Kengaytirilgan sozlamalar
        </p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 20px' }}>
          <Field
            label="Min cashback summasi (so'm)"
            value={form.minQrPaid} onChange={v=>set('minQrPaid',v)}
            placeholder="70000"
            type='number'
            hint="Cashback faollashadigan minimal summa"
          />
          <div/>
        </div>
      </div>
    </div>
  )
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function ShopForm() {
  const { id } = useParams()
  const nav    = useNavigate()
  const isEdit = !!id

  const [step,  setStep]  = useState(0)
  const [form,  setForm]  = useState({ plan:'starter', botPassword:'1234', minQrPaid:'70000' })
  const [load,  setLoad]  = useState(isEdit)
  const [saving,setSaving]= useState(false)
  const [err,   setErr]   = useState('')
  const [editSecret, setEditSecret] = useState(!isEdit)

  useEffect(() => {
    if (!isEdit) return
    getShop(id)
      .then(s => setForm({ ...s, botPassword: s.botPassword||'1234', minQrPaid: s.minQrPaid||70000 }))
      .catch(e => setErr(String(e)))
      .finally(() => setLoad(false))
  }, [id])

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function submit() {
    setErr(''); setSaving(true)
    try {
      const data = { ...form }
      if (isEdit && !editSecret) {
        delete data.botToken
        delete data.customerBotToken
        delete data.openaiKey
      }
      if (isEdit) await updateShop(id, data)
      else        await createShop(data)
      nav('/shops')
    } catch(e) { setErr(String(e)) }
    finally { setSaving(false) }
  }

  // Validation per step
  function canNext() {
    if (step === 0) return !!(form.name?.trim() && form.ownerName?.trim() && form.phone?.trim())
    if (step === 1) return isEdit || !!form.botToken?.trim()
    return !!form.plan
  }

  if (load) return (
    <div style={{ display:'flex', alignItems:'center', gap:12,
      padding:40, color:'var(--text2)', fontSize:14 }}>
      <Spinner/> Yuklanmoqda...
    </div>
  )

  return (
    <div style={{ maxWidth: 720 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize:22, fontWeight:800, letterSpacing:-.4, color:'var(--text)' }}>
          {isEdit ? "✏️ Do'konni tahrirlash" : "➕ Yangi do'kon"}
        </h1>
        <p style={{ color:'var(--text2)', fontSize:13, marginTop:4 }}>
          {STEPS[step].title} — {STEPS[step].desc}
        </p>
      </div>

      {/* Step indicator */}
      <div style={{ display:'flex', gap:0, marginBottom:28,
        background:'var(--surface)', borderRadius:12,
        border:'1px solid var(--border)', overflow:'hidden', padding:4 }}>
        {STEPS.map((s, i) => {
          const done   = i < step
          const active = i === step
          return (
            <button key={s.key} type='button'
              onClick={() => i < step && setStep(i)}
              disabled={i > step}
              style={{
                flex:1, padding:'10px 8px', borderRadius:9,
                background: active ? 'var(--gold)' : done ? 'var(--green2)' : 'transparent',
                color: active ? '#000' : done ? 'var(--green)' : 'var(--text3)',
                fontWeight: active ? 700 : 500,
                fontSize: 13, border:'none', cursor: i<step ? 'pointer' : 'default',
                display:'flex', alignItems:'center', justifyContent:'center', gap:6,
                transition:'all .2s',
              }}>
              <span style={{ fontSize:16 }}>{done ? '✓' : s.icon}</span>
              <span>{s.label}</span>
            </button>
          )
        })}
      </div>

      {/* Content card */}
      <div style={{
        background:'var(--surface)', borderRadius:16,
        border:'1px solid var(--border)',
        padding:28, marginBottom:16,
      }}>
        {/* Section title */}
        <div style={{ marginBottom:22, paddingBottom:14,
          borderBottom:'1px solid var(--border)' }}>
          <h2 style={{ fontSize:16, fontWeight:700, color:'var(--text)', marginBottom:3 }}>
            {STEPS[step].icon} {STEPS[step].title}
          </h2>
          <p style={{ fontSize:12, color:'var(--text2)' }}>{STEPS[step].desc}</p>
        </div>

        {step === 0 && <StepBasic form={form} set={set}/>}
        {step === 1 && (
          <StepBot
            form={form} set={set}
            isEdit={isEdit}
            editSecret={editSecret}
            setEditSecret={setEditSecret}
          />
        )}
        {step === 2 && <StepPlan form={form} set={set}/>}
      </div>

      {/* Error */}
      {err && <Alert onClose={()=>setErr('')}>{err}</Alert>}

      {/* Navigation */}
      <div style={{ display:'flex', gap:10, alignItems:'center' }}>
        <Btn color='gray' onClick={()=> step===0 ? nav('/shops') : setStep(s=>s-1)}>
          {step === 0 ? '← Bekor' : '← Orqaga'}
        </Btn>

        {/* Progress */}
        <div style={{ flex:1, display:'flex', alignItems:'center', gap:8, justifyContent:'center' }}>
          {STEPS.map((_,i) => (
            <div key={i} style={{
              width: i===step ? 20 : 6, height:6, borderRadius:99,
              background: i<=step ? 'var(--gold)' : 'var(--border)',
              transition:'all .2s',
            }}/>
          ))}
        </div>

        {step < STEPS.length - 1 ? (
          <Btn
            onClick={() => setStep(s=>s+1)}
            disabled={!canNext()}
          >
            Keyingi →
          </Btn>
        ) : (
          <Btn
            onClick={submit}
            loading={saving}
            disabled={saving || !canNext()}
            style={{ minWidth:200 }}
          >
            {isEdit ? '💾 Saqlash' : '🚀 Yaratish va botni ishga tushirish'}
          </Btn>
        )}
      </div>

      {/* Step counter */}
      <p style={{ textAlign:'center', fontSize:11,
        color:'var(--text3)', marginTop:12 }}>
        {step + 1} / {STEPS.length} qadam
      </p>
    </div>
  )
}

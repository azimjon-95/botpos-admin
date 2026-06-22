// Umumiy UI komponentlar

export function Btn({ children, onClick, color="gold", size="md", disabled, style={} }) {
    const colors = { gold:"var(--gold)", green:"var(--green)", red:"var(--red)", blue:"var(--blue)", gray:"var(--text2)" };
    const c = colors[color] || color;
    const pad = size === "sm" ? "6px 14px" : size === "lg" ? "13px 28px" : "9px 20px";
    return (
        <button onClick={onClick} disabled={disabled} style={{
            padding:pad, borderRadius:"var(--r)", fontSize: size==="sm"?12:14, fontWeight:600,
            background:`${c}22`, color:c, border:`1px solid ${c}33`,
            opacity: disabled ? .5 : 1, cursor: disabled ? "not-allowed" : "pointer",
            transition:"all .15s", ...style
        }}>{children}</button>
    );
}

export function Badge({ children, color="gray" }) {
    const colors = { gold:"var(--gold)", green:"var(--green)", red:"var(--red)", blue:"var(--blue)", gray:"var(--text2)", purple:"var(--purple)", orange:"var(--orange)" };
    const c = colors[color] || color;
    return <span style={{ fontSize:11, padding:"3px 9px", borderRadius:99, background:`${c}22`, color:c, fontWeight:600, whiteSpace:"nowrap" }}>{children}</span>;
}

export function Card({ children, style={} }) {
    return <div style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"var(--r2)", padding:24, ...style }}>{children}</div>;
}

export function SectionTitle({ children, sub, action }) {
    return (
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
            <div>
                <div style={{ fontSize:20, fontWeight:700 }}>{children}</div>
                {sub && <div style={{ color:"var(--text2)", fontSize:13, marginTop:3 }}>{sub}</div>}
            </div>
            {action && <div>{action}</div>}
        </div>
    );
}

export function Input({ label, value, onChange, placeholder, type="text", required, hint, style={} }) {
    return (
        <div style={{ marginBottom:16 }}>
            {label && <label style={{ display:"block", fontSize:12, color:"var(--text2)", marginBottom:6, textTransform:"uppercase", letterSpacing:.5 }}>
                {label}{required && <span style={{ color:"var(--red)" }}> *</span>}
            </label>}
            <input type={type} value={value||""} onChange={e=>onChange(e.target.value)} placeholder={placeholder} required={required}
                style={{ width:"100%", padding:"10px 14px", borderRadius:"var(--r)", background:"var(--surface2)", border:"1px solid var(--border)", color:"var(--text)", fontSize:14, ...style }} />
            {hint && <div style={{ fontSize:11, color:"var(--text3)", marginTop:4 }}>{hint}</div>}
        </div>
    );
}

export function Select({ label, value, onChange, options, required }) {
    return (
        <div style={{ marginBottom:16 }}>
            {label && <label style={{ display:"block", fontSize:12, color:"var(--text2)", marginBottom:6, textTransform:"uppercase", letterSpacing:.5 }}>
                {label}{required && <span style={{ color:"var(--red)" }}> *</span>}
            </label>}
            <select value={value||""} onChange={e=>onChange(e.target.value)} required={required}
                style={{ width:"100%", padding:"10px 14px", borderRadius:"var(--r)", background:"var(--surface2)", border:"1px solid var(--border)", color:"var(--text)", fontSize:14 }}>
                {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
        </div>
    );
}

export function Table({ cols, rows, loading, empty="Ma'lumot yo'q" }) {
    const th = { padding:"11px 16px", fontSize:11, color:"var(--text2)", textTransform:"uppercase", letterSpacing:.5, textAlign:"left", borderBottom:"1px solid var(--border)", background:"var(--surface2)", whiteSpace:"nowrap" };
    const td = { padding:"13px 16px", fontSize:14, borderBottom:"1px solid var(--border)", verticalAlign:"middle" };
    return (
        <div style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"var(--r2)", overflow:"hidden" }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead><tr>{cols.map((c,i)=><th key={i} style={th}>{c.label}</th>)}</tr></thead>
                <tbody>
                    {loading && <tr><td colSpan={cols.length} style={{ ...td, textAlign:"center", color:"var(--text3)" }}>⏳ Yuklanmoqda...</td></tr>}
                    {!loading && rows.length === 0 && <tr><td colSpan={cols.length} style={{ ...td, textAlign:"center", color:"var(--text3)" }}>{empty}</td></tr>}
                    {!loading && rows.map((row,ri) => (
                        <tr key={ri} style={{ transition:"background .1s" }}
                            onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.03)"}
                            onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                            {cols.map((c,ci) => <td key={ci} style={td}>{typeof c.render === "function" ? c.render(row) : row[c.key]}</td>)}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export function Modal({ open, onClose, title, children, width=480 }) {
    if (!open) return null;
    return (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.65)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:20 }} onClick={onClose}>
            <div style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"var(--r3)", padding:28, width:"100%", maxWidth:width, maxHeight:"90vh", overflowY:"auto" }} onClick={e=>e.stopPropagation()}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                    <div style={{ fontSize:17, fontWeight:700 }}>{title}</div>
                    <button onClick={onClose} style={{ background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:"var(--r)", padding:"4px 12px", color:"var(--text2)", fontSize:14 }}>✕</button>
                </div>
                {children}
            </div>
        </div>
    );
}

export function StatCard({ icon, label, value, sub, color="text" }) {
    const colors = { gold:"var(--gold)", green:"var(--green)", red:"var(--red)", blue:"var(--blue)", purple:"var(--purple)", text:"var(--text)" };
    const c = colors[color] || color;
    return (
        <div style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"var(--r2)", padding:"20px 22px" }}>
            <div style={{ fontSize:22, marginBottom:8 }}>{icon}</div>
            <div style={{ fontSize:11, color:"var(--text2)", textTransform:"uppercase", letterSpacing:.5, marginBottom:6 }}>{label}</div>
            <div style={{ fontSize:26, fontWeight:700, color:c }}>{value ?? "—"}</div>
            {sub && <div style={{ fontSize:12, color:"var(--text3)", marginTop:4 }}>{sub}</div>}
        </div>
    );
}

export function Spinner() {
    return <div style={{ display:"flex", justifyContent:"center", padding:60, color:"var(--text3)" }}>⏳ Yuklanmoqda...</div>;
}

export function Alert({ type="error", children }) {
    const c = type==="error" ? "var(--red)" : type==="success" ? "var(--green)" : "var(--gold)";
    return <div style={{ padding:"11px 16px", borderRadius:"var(--r)", background:`${c}18`, color:c, fontSize:13, marginBottom:16 }}>{children}</div>;
}

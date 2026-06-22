import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api";

export default function Login() {
    const [email, setEmail] = useState("admin@botpos.uz");
    const [pass,  setPass]  = useState("");
    const [err,   setErr]   = useState("");
    const [loading, setLoading] = useState(false);
    const nav = useNavigate();

    async function submit(e) {
        e.preventDefault(); setErr(""); setLoading(true);
        try {
            const r = await login(email, pass);
            localStorage.setItem("bp_token",   r.data.data.token);
            localStorage.setItem("bp_refresh",  r.data.data.refresh);
            nav("/");
        } catch(e) { setErr(String(e)); }
        finally { setLoading(false); }
    }

    return (
        <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--bg)" }}>
            <div style={{ width:380, background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"var(--r3)", padding:40 }}>
                <div style={{ textAlign:"center", marginBottom:32 }}>
                    <div style={{ display:"inline-flex", alignItems:"center", gap:8, marginBottom:12 }}>
                        <span style={{ width:12, height:12, borderRadius:"50%", background:"var(--gold)", display:"inline-block" }}/>
                        <span style={{ fontWeight:700, fontSize:18 }}>BOT·POS Admin</span>
                    </div>
                    <div style={{ color:"var(--text2)", fontSize:13 }}>Super Admin kirishi</div>
                </div>
                <form onSubmit={submit}>
                    {[["Email","email",email,setEmail,"admin@botpos.uz"],["Parol","password",pass,setPass,"••••••••"]].map(([l,t,v,s,p])=>(
                        <div key={t} style={{ marginBottom:16 }}>
                            <label style={{ display:"block", fontSize:12, color:"var(--text2)", marginBottom:6, textTransform:"uppercase", letterSpacing:.5 }}>{l}</label>
                            <input type={t} value={v} onChange={e=>s(e.target.value)} placeholder={p} required
                                style={{ width:"100%", padding:"11px 14px", borderRadius:"var(--r)", background:"var(--surface2)", border:"1px solid var(--border)", color:"var(--text)", fontSize:14 }} />
                        </div>
                    ))}
                    {err && <div style={{ color:"var(--red)", fontSize:13, marginBottom:12, padding:"9px 14px", background:"var(--red2)", borderRadius:"var(--r)" }}>⚠ {err}</div>}
                    <button type="submit" disabled={loading}
                        style={{ width:"100%", padding:13, borderRadius:"var(--r)", background:"var(--gold)", color:"#000", fontWeight:700, fontSize:15, marginTop:4 }}>
                        {loading ? "Kirmoqda..." : "Kirish →"}
                    </button>
                </form>
            </div>
        </div>
    );
}

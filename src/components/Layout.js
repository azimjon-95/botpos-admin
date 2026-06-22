import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

const NAV = [
    { to:"/",       icon:"📊", label:"Dashboard",      end:true },
    { to:"/shops",  icon:"🏪", label:"Do'konlar" },
    { to:"/openai", icon:"🤖", label:"OpenAI xarajat" },
    { to:"/audit",  icon:"📋", label:"Audit Log" },
];

export default function Layout() {
    const nav = useNavigate();
    const loc = useLocation();
    const [col, setCol] = useState(false);

    const W = col ? 64 : 220;
    const sb = { width:W, minHeight:"100vh", background:"var(--surface)", borderRight:"1px solid var(--border)", display:"flex", flexDirection:"column", transition:"width .2s", overflow:"hidden", flexShrink:0 };
    const lk = (a) => ({ display:"flex", alignItems:"center", gap:10, padding: col ? "10px 20px" : "10px 12px", borderRadius:"var(--r)", color: a?"var(--gold)":"var(--text2)", background: a?"var(--gold2)":"transparent", fontWeight:a?600:400, fontSize:14, whiteSpace:"nowrap", transition:"all .15s" });

    return (
        <div style={{ display:"flex", minHeight:"100vh" }}>
            <aside style={sb}>
                <div style={{ display:"flex", alignItems:"center", gap:10, padding: col?"20px 16px":"20px 20px", borderBottom:"1px solid var(--border)", cursor:"pointer" }} onClick={()=>setCol(c=>!c)}>
                    <span style={{ width:10, height:10, borderRadius:"50%", background:"var(--gold)", flexShrink:0 }}/>
                    {!col && <><span style={{ fontWeight:700, fontSize:15 }}>BOT·POS</span><span style={{ fontSize:10, padding:"2px 7px", borderRadius:99, background:"var(--gold2)", color:"var(--gold)" }}>Admin</span></>}
                </div>
                <nav style={{ flex:1, padding:"12px 8px", display:"flex", flexDirection:"column", gap:2 }}>
                    {NAV.map(n=>(
                        <NavLink key={n.to} to={n.to} end={n.end} style={({isActive})=>lk(isActive)}>
                            <span style={{ fontSize:16, flexShrink:0 }}>{n.icon}</span>
                            {!col && <span>{n.label}</span>}
                        </NavLink>
                    ))}
                </nav>
                <div style={{ padding:"8px", borderTop:"1px solid var(--border)" }}>
                    <button style={{ display:"flex", alignItems:"center", gap:10, width:"100%", padding: col?"10px 16px":"10px 12px", borderRadius:"var(--r)", background:"var(--red2)", color:"var(--red)", fontSize:14 }} onClick={()=>{localStorage.clear();nav("/login");}}>
                        <span>🚪</span>{!col && <span>Chiqish</span>}
                    </button>
                </div>
            </aside>
            <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
                <div style={{ height:52, borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", padding:"0 24px", background:"var(--surface)", fontSize:13, color:"var(--text2)" }}>
                    BOT·POS {loc.pathname !== "/" && "/ " + loc.pathname.split("/").filter(Boolean).join(" / ")}
                </div>
                <div style={{ flex:1, overflowY:"auto", padding:28 }}>
                    <Outlet />
                </div>
            </div>
        </div>
    );
}

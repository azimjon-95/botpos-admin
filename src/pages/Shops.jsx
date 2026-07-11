import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getShops, toggleShop, restartBot, deleteShop } from "../lib/api.js";
import { Table, Badge, Btn, SectionTitle, Modal, Alert } from "../components/UI.jsx";

const PLAN_COLOR = { starter:"gray", pro:"blue", business:"gold" };

export default function Shops() {
    const [shops,  setShops]  = useState([]);
    const [total,  setTotal]  = useState(0);
    const [page,   setPage]   = useState(1);
    const [search, setSearch] = useState("");
    const [plan,   setPlan]   = useState("");
    const [activeFilter, setActiveFilter] = useState("");
    const [load,   setLoad]   = useState(true);
    const [acting, setActing] = useState(null);
    const [confirm, setConfirm] = useState(null); // { type, shop }
    const [err, setErr]       = useState("");
    const nav = useNavigate();
    const LIMIT = 15;

    const load_ = useCallback(async () => {
        setLoad(true);
        try {
            const p = { page, limit: LIMIT };
            if (search) p.search = search;
            if (plan)   p.plan   = plan;
            if (activeFilter !== "") p.isActive = activeFilter;
            const r = await getShops(p);
            setShops(r.shops || []); setTotal(r.total || 0);
        } catch(e) { setErr(String(e)); }
        finally { setLoad(false); }
    }, [page, search, plan, activeFilter]);

    useEffect(() => { load_(); }, [load_]);

    async function doToggle(shop) {
        setActing(shop._id);
        try { await toggleShop(shop._id); await load_(); }
        catch(e) { setErr(String(e)); }
        finally { setActing(null); setConfirm(null); }
    }

    async function doDelete(shop) {
        setActing(shop._id);
        try { await deleteShop(shop._id); await load_(); }
        catch(e) { setErr(String(e)); }
        finally { setActing(null); setConfirm(null); }
    }

    async function doRestart(shopId) {
        setActing(shopId);
        try { await restartBot(shopId); setErr(""); alert("✅ Bot restart qilindi"); }
        catch(e) { setErr(String(e)); }
        finally { setActing(null); }
    }

    const cols = [
        { label:"Do'kon", render: s => (
            <div>
                <div style={{ fontWeight:600, cursor:"pointer", color:"var(--blue)" }} onClick={()=>nav(`/shops/${s._id}`)}>{s.name}</div>
                <div style={{ fontSize:12, color:"var(--text3)", marginTop:2 }}>{s.address || s._id?.slice(-8)}</div>
            </div>
        )},
        { label:"Egasi", render: s => (
            <div>
                <div>{s.ownerName}</div>
                <div style={{ fontSize:12, color:"var(--text3)" }}>{s.phone}</div>
            </div>
        )},
        { label:"Tarif",  render: s => <Badge color={PLAN_COLOR[s.plan]}>{s.plan || "—"}</Badge> },
        { label:"Holat",  render: s => (
            <span style={{ display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ width:8, height:8, borderRadius:"50%", background: s.isActive?"var(--green)":"var(--red)", display:"inline-block" }}/>
                {s.isActive ? "Faol" : "To'xtatilgan"}
            </span>
        )},
        { label:"Bot", render: s => (
            <span style={{ display:"flex", alignItems:"center", gap:5, fontSize:12, color: s.botRunning?"var(--green)":"var(--text3)" }}>
                <span style={{ width:7, height:7, borderRadius:"50%", background: s.botRunning?"var(--green)":"#444", display:"inline-block" }}/>
                {s.botRunning ? "Aktiv" : "Nofaol"}
            </span>
        )},
        { label:"Amallar", render: s => (
            <div style={{ display:"flex", gap:6 }} onClick={e=>e.stopPropagation()}>
                <Btn size="sm" color="blue"   onClick={()=>nav(`/shops/${s._id}`)}>Ko'rish</Btn>
                <Btn size="sm" color="gold"   onClick={()=>nav(`/shops/${s._id}/edit`)}>✏️</Btn>
                <Btn size="sm" color="purple" onClick={()=>doRestart(s._id)} disabled={acting===s._id}>🔄</Btn>
                <Btn size="sm" color={s.isActive?"red":"green"} onClick={()=>setConfirm({type:"toggle",shop:s})} disabled={acting===s._id}>
                    {s.isActive ? "🛑" : "▶️"}
                </Btn>
                <Btn size="sm" color="red" onClick={()=>setConfirm({type:"delete",shop:s})} disabled={acting===s._id}>🗑</Btn>
            </div>
        )},
    ];

    const pages = Math.ceil(total / LIMIT);

    return (
        <div>
            <SectionTitle sub={`Jami: ${total} ta do'kon`}
                action={<Btn onClick={()=>nav("/shops/new")}>+ Yangi do'kon</Btn>}>
                🏪 Do'konlar
            </SectionTitle>

            {/* Filterlar */}
            <div style={{ display:"flex", gap:10, marginBottom:18, flexWrap:"wrap" }}>
                <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="🔍 Nomi bo'yicha..."
                    style={{ flex:1, minWidth:180, padding:"9px 14px", borderRadius:"var(--r)", background:"var(--surface)", border:"1px solid var(--border)", color:"var(--text)", fontSize:13 }} />
                {[["","Barcha tarif"],["starter","Starter"],["pro","Pro"],["business","Business"]].map(([v,l])=>(
                    <button key={v} onClick={()=>{setPlan(v);setPage(1);}}
                        style={{ padding:"9px 16px", borderRadius:"var(--r)", fontSize:13, background: plan===v?"var(--gold2)":"var(--surface)", color: plan===v?"var(--gold)":"var(--text2)", border:"1px solid var(--border)" }}>
                        {l}
                    </button>
                ))}
                {[["","Barchasi"],["true","Faol"],["false","Nofaol"]].map(([v,l])=>(
                    <button key={v} onClick={()=>{setActiveFilter(v);setPage(1);}}
                        style={{ padding:"9px 16px", borderRadius:"var(--r)", fontSize:13, background: activeFilter===v?"var(--blue2)":"var(--surface)", color: activeFilter===v?"var(--blue)":"var(--text2)", border:"1px solid var(--border)" }}>
                        {l}
                    </button>
                ))}
            </div>

            {err && <Alert>{err}</Alert>}
            <Table cols={cols} rows={shops} loading={load} />

            {/* Sahifalash */}
            {pages > 1 && (
                <div style={{ display:"flex", justifyContent:"center", gap:8, marginTop:16 }}>
                    {page>1 && <Btn size="sm" onClick={()=>setPage(p=>p-1)}>← Oldingi</Btn>}
                    <span style={{ padding:"6px 14px", fontSize:13, color:"var(--text2)" }}>{page}/{pages}</span>
                    {page<pages && <Btn size="sm" onClick={()=>setPage(p=>p+1)}>Keyingi →</Btn>}
                </div>
            )}

            {/* Confirm modal */}
            <Modal open={!!confirm} onClose={()=>setConfirm(null)} title={confirm?.type==="delete" ? "O'chirishni tasdiqlang" : confirm?.shop?.isActive ? "To'xtatishni tasdiqlang" : "Faollashtirishni tasdiqlang"}>
                {confirm && (
                    <div>
                        <div style={{ marginBottom:20, color:"var(--text2)", fontSize:14 }}>
                            {confirm.type === "delete"
                                ? `"${confirm.shop.name}" do'konini va barcha ma'lumotlarini o'chirmoqchimisiz? Bu amal qaytarib bo'lmaydi!`
                                : confirm.shop.isActive
                                    ? `"${confirm.shop.name}" do'konini to'xtatmoqchimisiz? Bot ham to'xtatiladi.`
                                    : `"${confirm.shop.name}" do'konini faollashtirib, botni ishga tushirmoqchimisiz?`
                            }
                        </div>
                        <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
                            <Btn color="gray" onClick={()=>setConfirm(null)}>Bekor</Btn>
                            <Btn color={confirm.type==="delete" ? "red" : confirm.shop.isActive ? "red" : "green"}
                                onClick={()=>confirm.type==="delete" ? doDelete(confirm.shop) : doToggle(confirm.shop)}
                                disabled={acting === confirm.shop._id}>
                                {confirm.type==="delete" ? "🗑 O'chirish" : confirm.shop.isActive ? "🛑 To'xtatish" : "▶️ Faollashtirish"}
                            </Btn>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getShop, toggleShop, restartBot } from "../api";
import { Card, Badge, Btn, SectionTitle, StatCard, Spinner, Alert } from "../components/UI";

const PLAN_COLOR = { starter:"gray", pro:"blue", business:"gold" };

export default function ShopView() {
    const { id } = useParams();
    const nav    = useNavigate();
    const [shop, setShop] = useState(null);
    const [load, setLoad] = useState(true);
    const [acting, setActing] = useState(false);
    const [err, setErr] = useState("");
    const [msg, setMsg] = useState("");

    useEffect(() => {
        getShop(id).then(setShop).catch(e=>setErr(String(e))).finally(()=>setLoad(false));
    }, [id]);

    async function handleToggle() {
        if (!window.confirm(shop.isActive ? "Do'konni to'xtatmoqchimisiz?" : "Faollashtirishmoqchimisiz?")) return;
        setActing(true);
        try { await toggleShop(id); setShop(s=>({...s,isActive:!s.isActive})); setMsg(shop.isActive?"🛑 To'xtatildi":"✅ Faollashtirildi"); }
        catch(e) { setErr(String(e)); }
        finally { setActing(false); }
    }

    async function handleRestart() {
        setActing(true);
        try { await restartBot(id); setMsg("✅ Bot restart qilindi"); }
        catch(e) { setErr(String(e)); }
        finally { setActing(false); }
    }

    if (load) return <Spinner />;
    if (!shop) return <Alert>Do'kon topilmadi</Alert>;

    return (
        <div style={{ maxWidth:800 }}>
            <SectionTitle
                sub={`${shop.ownerName} · ${shop.phone} · ${shop.plan?.toUpperCase()}`}
                action={
                    <div style={{ display:"flex", gap:8 }}>
                        <Btn size="sm" color="blue"   onClick={()=>nav(`/shops/${id}/workers`)}>👥 Xodimlar</Btn>
                        <Btn size="sm" color="purple" onClick={()=>nav(`/shops/${id}/customers`)}>🎁 Mijozlar</Btn>
                        <Btn size="sm" color="gold"   onClick={()=>nav(`/shops/${id}/edit`)}>✏️ Tahrirlash</Btn>
                        <Btn size="sm" color="blue"   onClick={handleRestart} disabled={acting}>🔄 Restart</Btn>
                        <Btn size="sm" color={shop.isActive?"red":"green"} onClick={handleToggle} disabled={acting}>
                            {shop.isActive ? "🛑 To'xtat" : "▶️ Faollashtir"}
                        </Btn>
                    </div>
                }>
                <span style={{ display:"inline-flex", alignItems:"center", gap:8 }}>
                    <span style={{ width:10, height:10, borderRadius:"50%", background: shop.isActive?"var(--green)":"var(--red)", display:"inline-block" }}/>
                    {shop.name}
                </span>
            </SectionTitle>

            {err && <Alert>{err}</Alert>}
            {msg && <Alert type="success">{msg}</Alert>}

            {/* Info kartalar */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))", gap:12, marginBottom:20 }}>
                <StatCard icon="📦" label="Tarif" value={<Badge color={PLAN_COLOR[shop.plan]}>{shop.plan}</Badge>} />
                <StatCard icon="💰" label="Min cashback" value={Number(shop.minQrPaid||0).toLocaleString()} sub="so'm" />
                <StatCard icon="🔑" label="Bot paroli" value={shop.botPassword || "—"} />
                <StatCard icon="📅" label="Yaratilgan" value={shop.createdAt ? new Date(shop.createdAt).toLocaleDateString("uz") : "—"} />
            </div>

            {/* Asosiy ma'lumotlar */}
            <Card style={{ marginBottom:16 }}>
                <div style={{ fontSize:14, fontWeight:600, marginBottom:14 }}>📋 Ma'lumotlar</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px 24px" }}>
                    {[
                        ["Do'kon nomi",shop.name],["Egasi",shop.ownerName],
                        ["Telefon",shop.phone],["Manzil",shop.address||"—"],
                        ["Guruh Chat ID",shop.groupChatId],["Cashback bot",shop.customerBotUsername||"—"],
                        ["Admin TG ID",shop.adminTgId||"—"],["Tortchi TG ID",shop.bakerTgId||"—"],
                        ["Stats Chat",shop.statsChatId||"—"],["Backup Chat",shop.backupChatId||"—"],
                    ].map(([l,v])=>(
                        <div key={l}>
                            <div style={{ fontSize:11, color:"var(--text3)", textTransform:"uppercase", letterSpacing:.5, marginBottom:3 }}>{l}</div>
                            <div style={{ fontSize:14, fontFamily:"'JetBrains Mono',monospace" }}>{v}</div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* WebApp URL */}
            <Card style={{ marginBottom:16 }}>
                <div style={{ fontSize:14, fontWeight:600, marginBottom:10 }}>🌐 WebApp URL</div>
                <div style={{ background:"var(--surface2)", borderRadius:"var(--r)", padding:"10px 14px", fontFamily:"'JetBrains Mono',monospace", fontSize:13, color:"var(--blue)", wordBreak:"break-all" }}>
                    {shop.webappUrl || `https://botpos.uz?shop=${shop._id}`}
                </div>
                <div style={{ marginTop:10, display:"flex", gap:8 }}>
                    <Btn size="sm" color="blue" onClick={()=>window.open(shop.webappUrl||`/webapp?shop=${shop._id}`)}>🔗 Ochish</Btn>
                    <Btn size="sm" color="gray" onClick={()=>navigator.clipboard.writeText(shop.webappUrl||`https://botpos.uz?shop=${shop._id}`)}>📋 Nusxa</Btn>
                </div>
            </Card>

            {shop.notes && (
                <Card>
                    <div style={{ fontSize:14, fontWeight:600, marginBottom:8 }}>📝 Izoh</div>
                    <div style={{ color:"var(--text2)", fontSize:14 }}>{shop.notes}</div>
                </Card>
            )}
        </div>
    );
}

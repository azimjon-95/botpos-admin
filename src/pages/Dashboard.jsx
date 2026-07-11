import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStats, getBotStatus } from "../lib/api.js";
import { StatCard, Card, Badge, Btn } from "../components/UI.jsx";
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function Dashboard() {
    const [stats, setStats]   = useState(null);
    const [bots,  setBots]    = useState([]);
    const [load,  setLoad]    = useState(true);
    const nav = useNavigate();

    useEffect(() => {
        Promise.all([getStats(), getBotStatus()])
            .then(([s, b]) => { setStats(s); setBots(b || []); })
            .finally(() => setLoad(false));
        const t = setInterval(() => getBotStatus().then(b => setBots(b || [])).catch(()=>{}), 15000);
        return () => clearInterval(t);
    }, []);

    const planColors = { starter:"gray", pro:"blue", business:"gold" };

    return (
        <div>
            <div style={{ marginBottom:28 }}>
                <div style={{ fontSize:22, fontWeight:700 }}>📊 Dashboard</div>
                <div style={{ color:"var(--text2)", fontSize:13, marginTop:3 }}>BOT·POS SaaS — umumiy ko'rinish</div>
            </div>

            {/* Stat cards */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:14, marginBottom:24 }}>
                <StatCard icon="🏪" label="Jami do'konlar"   value={stats?.shops?.total}   color="blue" />
                <StatCard icon="✅" label="Faol"              value={stats?.shops?.active}  color="green" />
                <StatCard icon="🛑" label="To'xtatilgan"      value={stats?.shops?.stopped} color="red" />
                <StatCard icon="🤖" label="Ishlab turgan bot" value={stats?.botsRunning}    color="gold" />
                <StatCard icon="⭐" label="Starter"           value={stats?.plans?.starter} />
                <StatCard icon="💎" label="Pro"               value={stats?.plans?.pro}     color="blue" />
                <StatCard icon="🏆" label="Business"          value={stats?.plans?.business} color="gold" />
            </div>

            {/* Botlar holati */}
            <Card>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                    <div style={{ fontSize:15, fontWeight:600 }}>🤖 Botlar holati <span style={{ fontSize:12, color:"var(--text2)" }}>({bots.length} ta aktiv)</span></div>
                    <Btn size="sm" onClick={() => getBotStatus().then(b=>setBots(b||[]))}>🔄 Yangilash</Btn>
                </div>
                {load ? <div style={{ color:"var(--text3)", fontSize:13 }}>Yuklanmoqda...</div> : (
                    bots.length === 0
                        ? <div style={{ color:"var(--text3)", fontSize:13, textAlign:"center", padding:20 }}>Hozircha ishlab turgan bot yo'q</div>
                        : (
                            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:12 }}>
                                {bots.map(b => (
                                    <div key={b.shopId} style={{ background:"var(--surface2)", borderRadius:"var(--r)", padding:"14px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", cursor:"pointer" }}
                                        onClick={() => nav(`/shops/${b.shopId}`)}>
                                        <div>
                                            <div style={{ fontWeight:600, fontSize:14 }}>{b.shopName}</div>
                                            <div style={{ fontSize:11, color:"var(--text2)", marginTop:3 }}>
                                                {b.shopId?.slice(-8)}
                                            </div>
                                        </div>
                                        <div style={{ display:"flex", flexDirection:"column", gap:4, alignItems:"flex-end" }}>
                                            <span style={{ display:"flex", alignItems:"center", gap:5, fontSize:12 }}>
                                                <span style={{ width:7, height:7, borderRadius:"50%", background: b.botActive ? "var(--green)" : "var(--red)", display:"inline-block" }}/>
                                                Admin bot
                                            </span>
                                            <span style={{ display:"flex", alignItems:"center", gap:5, fontSize:12 }}>
                                                <span style={{ width:7, height:7, borderRadius:"50%", background: b.customerBotActive ? "var(--green)" : "#444", display:"inline-block" }}/>
                                                Cashback bot
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                )}
            </Card>
        </div>
    );
}

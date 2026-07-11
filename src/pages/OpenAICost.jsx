import { useState, useEffect } from "react";
import { getShops } from "../lib/api.js";
import { Card, SectionTitle, StatCard, Spinner, Alert, Badge } from "../components/UI.jsx";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";

// OpenAI billing API — real ma'lumotlar
async function fetchOpenAICost(apiKey, year, month) {
    const start = `${year}-${String(month).padStart(2,"0")}-01`;
    const endDate = new Date(year, month, 1);
    const end = `${endDate.getFullYear()}-${String(endDate.getMonth()+1).padStart(2,"0")}-01`;
    try {
        const r = await fetch(`https://api.openai.com/v1/usage?date=${start}`, {
            headers: { Authorization: `Bearer ${apiKey}`, "Content-Type":"application/json" }
        });
        if (!r.ok) throw new Error(`OpenAI API xato: ${r.status}`);
        return await r.json();
    } catch(e) { throw new Error(e.message); }
}

// GPT-4 narxlari ($/1K token)
const PRICES = {
    "gpt-4":           { input: 0.03,   output: 0.06   },
    "gpt-4-turbo":     { input: 0.01,   output: 0.03   },
    "gpt-4o":          { input: 0.005,  output: 0.015  },
    "gpt-3.5-turbo":   { input: 0.001,  output: 0.002  },
    "whisper-1":       { input: 0.006,  output: 0       },
    "tts-1":           { input: 0.015,  output: 0       },
    "default":         { input: 0.002,  output: 0.002  },
};

function calcCost(usage) {
    if (!usage?.data) return { totalUSD: 0, days: [], models: {} };
    let totalUSD = 0;
    const models = {};
    const daysMap = {};

    usage.data.forEach(d => {
        const model = d.snapshot_id || "unknown";
        const p = Object.entries(PRICES).find(([k]) => model.startsWith(k))?.[1] || PRICES.default;
        const inTok  = (d.n_context_tokens_total || 0);
        const outTok = (d.n_generated_tokens_total || 0);
        const cost   = (inTok / 1000) * p.input + (outTok / 1000) * p.output;
        totalUSD += cost;

        if (!models[model]) models[model] = { requests:0, tokens:0, cost:0 };
        models[model].requests += (d.n_requests || 0);
        models[model].tokens   += inTok + outTok;
        models[model].cost     += cost;

        const day = d.aggregation_timestamp ? new Date(d.aggregation_timestamp*1000).toLocaleDateString("uz") : "—";
        if (!daysMap[day]) daysMap[day] = { day, cost:0, tokens:0 };
        daysMap[day].cost   += cost;
        daysMap[day].tokens += inTok + outTok;
    });

    return {
        totalUSD,
        models,
        days: Object.values(daysMap).sort((a,b) => a.day.localeCompare(b.day)),
    };
}

export default function OpenAICost() {
    const [shops, setShops]     = useState([]);
    const [selected, setSelected] = useState("");
    const [apiKey, setApiKey]   = useState("");
    const [month, setMonth]     = useState(new Date().getMonth()+1);
    const [year, setYear]       = useState(new Date().getFullYear());
    const [data, setData]       = useState(null);
    const [load, setLoad]       = useState(false);
    const [err, setErr]         = useState("");
    const USD_TO_UZS = 12800;

    useEffect(() => {
        getShops({ limit:100 }).then(r => setShops(r.shops || [])).catch(()=>{});
    }, []);

    async function fetchCost() {
        if (!apiKey.trim()) { setErr("OpenAI API key kiriting"); return; }
        setLoad(true); setErr(""); setData(null);
        try {
            const usage = await fetchOpenAICost(apiKey.trim(), year, month);
            setData(calcCost(usage));
        } catch(e) { setErr(String(e)); }
        finally { setLoad(false); }
    }

    const totalUZS = (data?.totalUSD || 0) * USD_TO_UZS;

    const months = Array.from({length:12},(_,i)=>({ value:i+1, label:new Date(2024,i).toLocaleString("uz",{month:"long"}) }));

    return (
        <div>
            <SectionTitle sub="Do'kon bo'yicha OpenAI API xarajatlar tahlili">
                🤖 OpenAI Xarajatlar
            </SectionTitle>

            {/* Kirish formasi */}
            <Card style={{ marginBottom:20 }}>
                <div style={{ fontSize:14, fontWeight:600, marginBottom:16 }}>🔑 API sozlamalar</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr auto auto auto", gap:12, alignItems:"end" }}>
                    <div>
                        <label style={{ display:"block", fontSize:11, color:"var(--text2)", marginBottom:6, textTransform:"uppercase", letterSpacing:.5 }}>OpenAI API Key</label>
                        <input type="password" value={apiKey} onChange={e=>setApiKey(e.target.value)} placeholder="sk-..."
                            style={{ width:"100%", padding:"10px 14px", borderRadius:"var(--r)", background:"var(--surface2)", border:"1px solid var(--border)", color:"var(--text)", fontSize:14 }} />
                    </div>
                    <div>
                        <label style={{ display:"block", fontSize:11, color:"var(--text2)", marginBottom:6, textTransform:"uppercase", letterSpacing:.5 }}>Oy</label>
                        <select value={month} onChange={e=>setMonth(Number(e.target.value))}
                            style={{ padding:"10px 14px", borderRadius:"var(--r)", background:"var(--surface2)", border:"1px solid var(--border)", color:"var(--text)", fontSize:14 }}>
                            {months.map(m=><option key={m.value} value={m.value}>{m.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={{ display:"block", fontSize:11, color:"var(--text2)", marginBottom:6, textTransform:"uppercase", letterSpacing:.5 }}>Yil</label>
                        <select value={year} onChange={e=>setYear(Number(e.target.value))}
                            style={{ padding:"10px 14px", borderRadius:"var(--r)", background:"var(--surface2)", border:"1px solid var(--border)", color:"var(--text)", fontSize:14 }}>
                            {[2024,2025,2026].map(y=><option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    <button onClick={fetchCost} disabled={load}
                        style={{ padding:"10px 24px", borderRadius:"var(--r)", background:"var(--gold)", color:"#000", fontWeight:700, fontSize:14 }}>
                        {load ? "⏳..." : "🔍 Tekshirish"}
                    </button>
                </div>
                <div style={{ fontSize:11, color:"var(--text3)", marginTop:8 }}>
                    ⚠️ API key admin panelda saqlanmaydi — faqat so'rov vaqtida ishlatiladi
                </div>
            </Card>

            {err && <Alert>{err}</Alert>}

            {load && <Spinner />}

            {data && (
                <>
                    {/* Umumiy natija */}
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))", gap:14, marginBottom:20 }}>
                        <StatCard icon="💵" label="Jami xarajat (USD)"
                            value={`$${data.totalUSD.toFixed(4)}`}
                            sub={`≈ ${Math.round(data.totalUSD * USD_TO_UZS).toLocaleString()} so'm`}
                            color="gold" />
                        <StatCard icon="📊" label="Modellar soni" value={Object.keys(data.models).length} color="blue" />
                        <StatCard icon="📅" label="Kunlar" value={data.days.length} />
                        <StatCard icon="💱" label="Kurs (USD)" value={`${USD_TO_UZS.toLocaleString()} so'm`} />
                    </div>

                    {/* Kunlik grafik */}
                    {data.days.length > 0 && (
                        <Card style={{ marginBottom:20 }}>
                            <div style={{ fontSize:14, fontWeight:600, marginBottom:16 }}>📈 Kunlik xarajat ($)</div>
                            <ResponsiveContainer width="100%" height={220}>
                                <LineChart data={data.days}>
                                    <XAxis dataKey="day" tick={{ fontSize:11, fill:"var(--text2)" }} tickLine={false} axisLine={false} />
                                    <YAxis tick={{ fontSize:11, fill:"var(--text2)" }} tickLine={false} axisLine={false} tickFormatter={v=>`$${v.toFixed(3)}`} width={70} />
                                    <Tooltip formatter={(v)=>`$${Number(v).toFixed(4)}`}
                                        contentStyle={{ background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:"var(--r)", fontSize:12 }} />
                                    <Line type="monotone" dataKey="cost" stroke="var(--gold)" strokeWidth={2} dot={false} name="Xarajat ($)" />
                                </LineChart>
                            </ResponsiveContainer>
                        </Card>
                    )}

                    {/* Modellar breakdown */}
                    <Card>
                        <div style={{ fontSize:14, fontWeight:600, marginBottom:16 }}>🧠 Model bo'yicha xarajat</div>
                        <table style={{ width:"100%", borderCollapse:"collapse" }}>
                            <thead>
                                <tr>
                                    {["Model","So'rovlar","Tokenlar","Xarajat ($)","Xarajat (so'm)"].map(h=>(
                                        <th key={h} style={{ padding:"10px 14px", fontSize:11, color:"var(--text2)", textTransform:"uppercase", letterSpacing:.5, textAlign:"left", borderBottom:"1px solid var(--border)", background:"var(--surface2)" }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(data.models)
                                    .sort((a,b)=>b[1].cost-a[1].cost)
                                    .map(([model,m])=>(
                                    <tr key={model}>
                                        <td style={{ padding:"12px 14px", borderBottom:"1px solid var(--border)", fontFamily:"monospace", fontSize:13 }}>{model}</td>
                                        <td style={{ padding:"12px 14px", borderBottom:"1px solid var(--border)" }}>{m.requests.toLocaleString()}</td>
                                        <td style={{ padding:"12px 14px", borderBottom:"1px solid var(--border)" }}>{m.tokens.toLocaleString()}</td>
                                        <td style={{ padding:"12px 14px", borderBottom:"1px solid var(--border)", color:"var(--gold)", fontWeight:600 }}>${m.cost.toFixed(4)}</td>
                                        <td style={{ padding:"12px 14px", borderBottom:"1px solid var(--border)", color:"var(--text2)" }}>{Math.round(m.cost*USD_TO_UZS).toLocaleString()} so'm</td>
                                    </tr>
                                ))}
                                <tr style={{ background:"var(--surface2)" }}>
                                    <td colSpan={3} style={{ padding:"12px 14px", fontWeight:700 }}>JAMI</td>
                                    <td style={{ padding:"12px 14px", fontWeight:700, color:"var(--gold)", fontSize:16 }}>${data.totalUSD.toFixed(4)}</td>
                                    <td style={{ padding:"12px 14px", fontWeight:700, color:"var(--gold)" }}>{Math.round(totalUZS).toLocaleString()} so'm</td>
                                </tr>
                            </tbody>
                        </table>
                    </Card>
                </>
            )}
        </div>
    );
}

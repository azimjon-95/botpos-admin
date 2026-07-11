import { useState, useEffect, useCallback } from "react";
import { getAudit } from "../lib/api.js";
import { Table, SectionTitle, Badge, Spinner, Alert, Btn } from "../components/UI.jsx";

const ACTION_MAP = {
    "shop.create":   { icon:"🟢", label:"Yaratildi",      color:"green" },
    "shop.edit":     { icon:"✏️", label:"Tahrirlandi",    color:"blue" },
    "shop.stop":     { icon:"🛑", label:"To'xtatildi",    color:"red" },
    "shop.activate": { icon:"▶️", label:"Faollashtirildi",color:"green" },
    "shop.restart":  { icon:"🔄", label:"Bot restart",    color:"purple" },
    "shop.delete":   { icon:"🗑", label:"O'chirildi",     color:"red" },
};

export default function AuditLog() {
    const [logs, setLogs]     = useState([]);
    const [page, setPage]     = useState(1);
    const [load, setLoad]     = useState(true);
    const [err, setErr]       = useState("");
    const LIMIT = 25;

    const reload = useCallback(async () => {
        setLoad(true);
        try {
            const r = await getAudit({ page, limit: LIMIT });
            setLogs(r || []);
        } catch(e) { setErr(String(e)); }
        finally { setLoad(false); }
    }, [page]);

    useEffect(() => { reload(); }, [reload]);

    const cols = [
        { label:"Vaqt", render: l => (
            <span style={{ fontSize:13, fontFamily:"monospace", color:"var(--text2)" }}>
                {l.createdAt ? new Date(l.createdAt).toLocaleString("uz") : "—"}
            </span>
        )},
        { label:"Amal", render: l => {
            const a = ACTION_MAP[l.action] || { icon:"•", label:l.action, color:"gray" };
            return <Badge color={a.color}>{a.icon} {a.label}</Badge>;
        }},
        { label:"Do'kon", render: l => <span style={{ fontWeight:500 }}>{l.shopName || "—"}</span> },
        { label:"Admin",  render: l => <span style={{ color:"var(--text2)", fontSize:13 }}>{l.adminEmail}</span> },
        { label:"IP",     render: l => <span style={{ fontFamily:"monospace", fontSize:12, color:"var(--text3)" }}>{l.ip||"—"}</span> },
        { label:"Tafsilot", render: l => (
            l.details && Array.isArray(l.details) && l.details.length > 0
                ? <span style={{ fontSize:12, color:"var(--text3)" }}>{l.details.slice(0,3).join(", ")}{l.details.length>3?`... +${l.details.length-3}`:""}</span>
                : "—"
        )},
    ];

    return (
        <div>
            <SectionTitle sub="Barcha admin amallari — o'zgartirib bo'lmaydi"
                action={<Btn size="sm" onClick={reload}>🔄 Yangilash</Btn>}>
                📋 Audit Log
            </SectionTitle>

            {err && <Alert>{err}</Alert>}
            {load ? <Spinner /> : <Table cols={cols} rows={logs} empty="Log yo'q" />}

            <div style={{ display:"flex", justifyContent:"center", gap:8, marginTop:16 }}>
                {page>1 && <Btn size="sm" onClick={()=>setPage(p=>p-1)}>← Oldingi</Btn>}
                <span style={{ padding:"6px 14px", fontSize:13, color:"var(--text2)" }}>Sahifa {page}</span>
                {logs.length === LIMIT && <Btn size="sm" onClick={()=>setPage(p=>p+1)}>Keyingi →</Btn>}
            </div>
        </div>
    );
}

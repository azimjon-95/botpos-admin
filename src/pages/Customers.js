import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCustomers, blockCustomer } from "../api";
import { Table, Btn, Badge, Alert, SectionTitle, Spinner, Modal } from "../components/UI";

export default function Customers() {
    const { id: shopId } = useParams();
    const nav = useNavigate();
    const [customers, setCustomers] = useState([]);
    const [total, setTotal]   = useState(0);
    const [page, setPage]     = useState(1);
    const [search, setSearch] = useState("");
    const [load, setLoad]     = useState(true);
    const [acting, setActing] = useState(null);
    const [confirm, setConfirm] = useState(null);
    const [err, setErr]       = useState("");
    const LIMIT = 20;

    const reload = useCallback(async () => {
        setLoad(true);
        try {
            const r = await getCustomers(shopId, { page, limit:LIMIT, search:search||undefined });
            setCustomers(r.customers || r || []); setTotal(r.total || 0);
        } catch(e) { setErr(String(e)); }
        finally { setLoad(false); }
    }, [shopId, page, search]);

    useEffect(() => { reload(); }, [reload]);

    async function doBlock(c) {
        setActing(c._id);
        try { await blockCustomer(shopId, c._id); await reload(); }
        catch(e) { setErr(String(e)); }
        finally { setActing(null); setConfirm(null); }
    }

    const cols = [
        { label:"TG ID",   render: c => <span style={{ fontFamily:"monospace", color:"var(--blue)", fontSize:13 }}>{c.tgId}</span> },
        { label:"Ism",     render: c => <div><div>{c.tgName||"—"}</div></div> },
        { label:"Bonus",   render: c => <span style={{ color:"var(--gold)", fontWeight:600 }}>{Number(c.points||0).toLocaleString()} so'm</span> },
        { label:"Referal", render: c => <span>{c.refCount||0} ta</span> },
        { label:"Holat",   render: c => <Badge color={c.isBlocked?"red":"green"}>{c.isBlocked?"Bloklangan":"Faol"}</Badge> },
        { label:"Sana",    render: c => c.updatedAt ? new Date(c.updatedAt).toLocaleDateString("uz") : "—" },
        { label:"Amallar", render: c => (
            <Btn size="sm" color={c.isBlocked?"green":"red"} onClick={()=>setConfirm(c)} disabled={acting===c._id}>
                {c.isBlocked ? "✅ Blokdan chiqar" : "🚫 Bloklash"}
            </Btn>
        )},
    ];

    const pages = Math.ceil(total / LIMIT);

    return (
        <div>
            <SectionTitle sub={`Jami: ${total} ta mijoz`}
                action={<Btn size="sm" color="gray" onClick={()=>nav(`/shops/${shopId}`)}>← Orqaga</Btn>}>
                🎁 Mijozlar
            </SectionTitle>

            <div style={{ marginBottom:16 }}>
                <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="🔍 TG ID yoki ism..."
                    style={{ padding:"9px 14px", borderRadius:"var(--r)", background:"var(--surface)", border:"1px solid var(--border)", color:"var(--text)", fontSize:13, width:260 }} />
            </div>

            {err && <Alert>{err}</Alert>}
            {load ? <Spinner /> : <Table cols={cols} rows={customers} empty="Mijozlar yo'q" />}

            {pages > 1 && (
                <div style={{ display:"flex", justifyContent:"center", gap:8, marginTop:16 }}>
                    {page>1 && <Btn size="sm" onClick={()=>setPage(p=>p-1)}>← Oldingi</Btn>}
                    <span style={{ padding:"6px 14px", fontSize:13, color:"var(--text2)" }}>{page}/{pages}</span>
                    {page<pages && <Btn size="sm" onClick={()=>setPage(p=>p+1)}>Keyingi →</Btn>}
                </div>
            )}

            <Modal open={!!confirm} onClose={()=>setConfirm(null)} title={confirm?.isBlocked?"Blokdan chiqarish":"Mijozni bloklash"}>
                {confirm && (
                    <div>
                        <div style={{ marginBottom:20, color:"var(--text2)", fontSize:14 }}>
                            {confirm.isBlocked
                                ? `${confirm.tgName||confirm.tgId} ni blokdan chiqarishni tasdiqlaysizmi?`
                                : `${confirm.tgName||confirm.tgId} ni bloklashni tasdiqlaysizmi? Bonus boti foydalana olmaydi.`
                            }
                        </div>
                        <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
                            <Btn color="gray" onClick={()=>setConfirm(null)}>Bekor</Btn>
                            <Btn color={confirm.isBlocked?"green":"red"} onClick={()=>doBlock(confirm)} disabled={acting===confirm._id}>
                                {confirm.isBlocked ? "✅ Blokdan chiqar" : "🚫 Bloklash"}
                            </Btn>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}

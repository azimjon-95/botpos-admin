import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getWorkers, createWorker, updateWorker, deleteWorker } from "../lib/api.js";
import { Table, Btn, Badge, Modal, Input, Select, Alert, SectionTitle, Spinner } from "../components/UI.jsx";

const EMPTY = { tgId:"", fullName:"", username:"", role:"worker", canUseWebApp:true, isActive:true };

export default function Workers() {
    const { id: shopId } = useParams();
    const nav = useNavigate();
    const [workers, setWorkers] = useState([]);
    const [load, setLoad]       = useState(true);
    const [modal, setModal]     = useState(false);
    const [form, setForm]       = useState(EMPTY);
    const [saving, setSaving]   = useState(false);
    const [acting, setActing]   = useState(null);
    const [err, setErr]         = useState("");

    const reload = useCallback(async () => {
        setLoad(true);
        try { setWorkers(await getWorkers(shopId) || []); }
        catch(e) { setErr(String(e)); }
        finally { setLoad(false); }
    }, [shopId]);

    useEffect(() => { reload(); }, [reload]);

    function openNew()  { setForm(EMPTY); setModal(true); }
    function openEdit(w){ setForm({ ...w, tgId: String(w.tgId||"") }); setModal(true); }

    async function save(e) {
        e.preventDefault(); setSaving(true); setErr("");
        try {
            if (form._id) await updateWorker(shopId, form._id, form);
            else await createWorker(shopId, { ...form, tgId: Number(form.tgId) });
            setModal(false); await reload();
        } catch(e) { setErr(String(e)); }
        finally { setSaving(false); }
    }

    async function del(w) {
        if (!window.confirm(`"${w.fullName||w.username}" xodimni o'chirishni tasdiqlaysizmi?`)) return;
        setActing(w._id);
        try { await deleteWorker(shopId, w._id); await reload(); }
        catch(e) { setErr(String(e)); }
        finally { setActing(null); }
    }

    const cols = [
        { label:"Telegram ID", render: w => <span style={{ fontFamily:"monospace", color:"var(--blue)" }}>{w.tgId}</span> },
        { label:"Ism",         render: w => <div><div>{w.fullName||"—"}</div><div style={{ fontSize:12, color:"var(--text3)" }}>@{w.username||"—"}</div></div> },
        { label:"Rol",         render: w => <Badge color={w.role==="admin"?"gold":"gray"}>{w.role}</Badge> },
        { label:"WebApp",      render: w => <Badge color={w.canUseWebApp?"green":"gray"}>{w.canUseWebApp?"Ruxsat":"Yopiq"}</Badge> },
        { label:"Holat",       render: w => <Badge color={w.isActive?"green":"red"}>{w.isActive?"Faol":"Bloklangan"}</Badge> },
        { label:"Amallar",     render: w => (
            <div style={{ display:"flex", gap:6 }}>
                <Btn size="sm" color="gold" onClick={()=>openEdit(w)}>✏️</Btn>
                <Btn size="sm" color="red"  onClick={()=>del(w)} disabled={acting===w._id}>🗑</Btn>
            </div>
        )},
    ];

    return (
        <div>
            <SectionTitle sub="Do'kon xodimlari — CRUD"
                action={<div style={{ display:"flex", gap:8 }}>
                    <Btn size="sm" color="gray" onClick={()=>nav(`/shops/${shopId}`)}>← Orqaga</Btn>
                    <Btn onClick={openNew}>+ Xodim qo'shish</Btn>
                </div>}>
                👥 Xodimlar
            </SectionTitle>

            {err && <Alert>{err}</Alert>}
            {load ? <Spinner /> : <Table cols={cols} rows={workers} empty="Xodimlar yo'q" />}

            <Modal open={modal} onClose={()=>setModal(false)} title={form._id ? "Xodimni tahrirlash" : "Yangi xodim"}>
                <form onSubmit={save}>
                    <Input label="Telegram ID" value={form.tgId} onChange={v=>setForm(f=>({...f,tgId:v}))} placeholder="123456789" required type="number" />
                    <Input label="To'liq ism"  value={form.fullName} onChange={v=>setForm(f=>({...f,fullName:v}))} placeholder="Azimjon Mirzo" />
                    <Input label="Username"    value={form.username}  onChange={v=>setForm(f=>({...f,username:v}))} placeholder="azimjon_m" />
                    <Select label="Rol" value={form.role} onChange={v=>setForm(f=>({...f,role:v}))}
                        options={[{value:"worker",label:"Xodim"},{value:"admin",label:"Admin"}]} />
                    <div style={{ display:"flex", gap:16, marginBottom:16 }}>
                        <label style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, cursor:"pointer" }}>
                            <input type="checkbox" checked={form.canUseWebApp} onChange={e=>setForm(f=>({...f,canUseWebApp:e.target.checked}))} />
                            WebApp kirish ruxsati
                        </label>
                        <label style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, cursor:"pointer" }}>
                            <input type="checkbox" checked={form.isActive} onChange={e=>setForm(f=>({...f,isActive:e.target.checked}))} />
                            Faol (bloklangan emas)
                        </label>
                    </div>
                    {err && <Alert>{err}</Alert>}
                    <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
                        <Btn color="gray" onClick={()=>setModal(false)} type="button">Bekor</Btn>
                        <Btn type="submit" disabled={saving}>{saving?"Saqlanmoqda...":form._id?"💾 Saqlash":"➕ Qo'shish"}</Btn>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

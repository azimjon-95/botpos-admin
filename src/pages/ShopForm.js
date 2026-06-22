import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createShop, getShop, updateShop } from "../api";
import { Input, Select, Btn, Alert, Card } from "../components/UI";

const SECTIONS = [
    { title:"📋 Asosiy ma'lumotlar", fields:[
        { key:"name",        label:"Do'kon nomi",     required:true,  ph:"Totli Tortlar" },
        { key:"ownerName",   label:"Egasi ismi",      required:true,  ph:"Azimjon Mirzo" },
        { key:"phone",       label:"Telefon",         required:true,  ph:"+998901234567" },
        { key:"address",     label:"Manzil",                          ph:"Toshkent, Chilonzor" },
    ]},
    { title:"🤖 Bot sozlamalari", fields:[
        { key:"botToken",         label:"Bot token (asosiy) 🔑", required:true, ph:"123456:ABCDEF...", secret:true, hint:"🔒 AES-256 shifrlangan saqlanadi" },
        { key:"groupChatId",      label:"Guruh Chat ID",          required:true, ph:"-1001234567890" },
        { key:"customerBotToken", label:"Cashback bot token 🔑",                ph:"654321:ZYXWV...", secret:true },
        { key:"customerBotUsername", label:"Cashback bot username",              ph:"@totli_rewards_bot" },
        { key:"openaiKey",        label:"OpenAI API key 🔑",                    ph:"sk-...", secret:true, hint:"Ovoz bilan sotuv uchun" },
    ]},
    { title:"⚙️ Qo'shimcha", fields:[
        { key:"adminTgId",   label:"Admin Telegram ID",  ph:"123456789" },
        { key:"bakerTgId",   label:"Tortchi TG ID",       ph:"987654321" },
        { key:"botPassword", label:"Bot paroli",           ph:"1234" },
        { key:"minQrPaid",   label:"Min cashback (so'm)",  ph:"70000", type:"number" },
        { key:"backupChatId",label:"Backup Chat ID",       ph:"-1009876543210" },
        { key:"notes",       label:"Izoh",                 ph:"..." },
    ]},
];

export default function ShopForm() {
    const { id }  = useParams();
    const nav     = useNavigate();
    const isEdit  = !!id;
    const [form, setForm]   = useState({ plan:"starter", botPassword:"1234", minQrPaid:"70000" });
    const [load, setLoad]   = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [err, setErr]     = useState("");
    const [editSecret, setEditSecret] = useState(!isEdit); // Yangi do'konda avtomat true

    useEffect(() => {
        if (!isEdit) return;
        getShop(id).then(s => {
            setForm({ ...s, botPassword: s.botPassword || "1234", minQrPaid: s.minQrPaid || 70000 });
        }).catch(e => setErr(String(e)))
          .finally(() => setLoad(false));
    }, [id]);

    function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

    async function submit(e) {
        e.preventDefault(); setErr(""); setSaving(true);
        try {
            const data = { ...form };
            // Tahrirlashda secret maydonlar bo'sh bo'lsa — yubormaymiz
            if (isEdit && !editSecret) {
                delete data.botToken; delete data.customerBotToken; delete data.openaiKey;
            }
            if (isEdit) await updateShop(id, data);
            else await createShop(data);
            nav("/shops");
        } catch(e) { setErr(String(e)); }
        finally { setSaving(false); }
    }

    if (load) return <div style={{ color:"var(--text2)", padding:40 }}>Yuklanmoqda...</div>;

    return (
        <div style={{ maxWidth:700 }}>
            <div style={{ marginBottom:24 }}>
                <div style={{ fontSize:22, fontWeight:700 }}>{isEdit ? "✏️ Do'konni tahrirlash" : "➕ Yangi do'kon"}</div>
                <div style={{ color:"var(--text2)", fontSize:13, marginTop:3 }}>TZ 5.1 bo'yicha barcha maydonlar</div>
            </div>

            <form onSubmit={submit}>
                {SECTIONS.map(sec => (
                    <Card key={sec.title} style={{ marginBottom:16 }}>
                        <div style={{ fontSize:15, fontWeight:600, marginBottom:18, paddingBottom:12, borderBottom:"1px solid var(--border)" }}>
                            {sec.title}
                            {sec.title.includes("Bot") && isEdit && (
                                <label style={{ float:"right", fontSize:12, color:"var(--text2)", fontWeight:400, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
                                    <input type="checkbox" checked={editSecret} onChange={e=>setEditSecret(e.target.checked)} />
                                    Tokenlarni yangilash
                                </label>
                            )}
                        </div>
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 20px" }}>
                            {sec.fields.map(f => {
                                const isSecret = f.secret;
                                const disabled = isEdit && isSecret && !editSecret;
                                return (
                                    <div key={f.key} style={{ gridColumn: f.key==="notes"||f.key==="address" ? "span 2" : "span 1" }}>
                                        <Input
                                            label={f.label}
                                            value={disabled ? "" : form[f.key]}
                                            onChange={v => set(f.key, v)}
                                            placeholder={disabled ? "— o'zgartirilmaydi —" : f.ph}
                                            type={isSecret && !disabled ? "password" : (f.type || "text")}
                                            required={f.required && !disabled}
                                            hint={f.hint}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                        {sec.title.includes("Qo'shimcha") && (
                            <Select label="Tarif rejasi" value={form.plan} onChange={v=>set("plan",v)} required
                                options={[{value:"starter",label:"⭐ Starter"},{value:"pro",label:"💎 Pro"},{value:"business",label:"🏆 Business"}]} />
                        )}
                    </Card>
                ))}

                {err && <Alert>{err}</Alert>}
                <div style={{ display:"flex", gap:12 }}>
                    <Btn color="gray" onClick={()=>nav("/shops")} type="button">← Orqaga</Btn>
                    <Btn type="submit" style={{ flex:1 }} disabled={saving}>
                        {saving ? "Saqlanmoqda..." : isEdit ? "💾 Saqlash va restart" : "✅ Yaratish va botni ishga tushirish"}
                    </Btn>
                </div>
            </form>
        </div>
    );
}

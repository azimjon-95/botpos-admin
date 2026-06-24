import { useState } from "react";
import { Btn, Card, SectionTitle, Alert, Spinner } from "../components/UI";
import api from "../api";

export default function BackupRestore() {
  const [file, setFile]         = useState(null);
  const [preview, setPreview]   = useState(null);
  const [loading, setLoading]   = useState(false);
  const [sending, setSending]   = useState(false);
  const [result, setResult]     = useState(null);
  const [err, setErr]           = useState("");

  // Fayl tanlash → parse qilish
  async function onFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f); setResult(null); setErr("");
    try {
      const text = await f.text();
      const json = JSON.parse(text);
      if (!json?.data) throw new Error("Noto'g'ri format. 'data' yo'q.");
      setPreview({
        shopCount:  json.stats?.shops   || json.data?.shops?.length   || 0,
        saleCount:  json.stats?.sales   || json.data?.sales?.length   || 0,
        expCount:   json.stats?.expenses|| json.data?.expenses?.length|| 0,
        total:      json.meta?.totalDocuments || 0,
        date:       json.meta?.createdAt?.slice(0,10) || "—",
        version:    json.meta?.version || "—",
      });
    } catch (e) {
      setErr("Fayl xato: " + e.message);
      setFile(null); setPreview(null);
    }
  }

  // DB ga yuklash
  async function restore() {
    if (!file || !preview) return;
    if (!window.confirm(
      `⚠️ DIQQAT!\n\n${preview.total} ta hujjat DB ga yuklanadi.\n` +
      `Mavjud ma'lumotlar SAQLANIB QOLADI (duplicate skip).\n\nDavom etasizmi?`
    )) return;

    setLoading(true); setErr(""); setResult(null);
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const r = await api.post("/backup/restore", json);
      setResult(r.data?.data);
    } catch (e) {
      setErr(e?.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }

  // Qo'lda backup yuborish
  async function sendNow() {
    if (!window.confirm("Hozir backup yuborish?")) return;
    setSending(true); setErr("");
    try {
      const r = await api.post("/backup/send");
      if (r.data?.ok) alert(`✅ Yuborildi: ${r.data?.data?.fileName || ""}`);
      else setErr(r.data?.data?.reason || "Xato");
    } catch (e) {
      setErr(e?.response?.data?.error || e.message);
    } finally {
      setSending(false);
    }
  }

  const s = {
    upload: {
      border: `2px dashed ${file ? "#22d47a" : "rgba(255,255,255,0.15)"}`,
      borderRadius: 14, padding: "32px 24px", textAlign: "center",
      background: file ? "rgba(34,212,122,0.05)" : "rgba(255,255,255,0.02)",
      cursor: "pointer", transition: "all .2s",
    },
  };

  return (
    <div style={{ maxWidth: 720 }}>
      <SectionTitle
        eyebrow="Ma'lumotlar xavfsizligi"
        title="Backup & Restore"
        sub="Har kuni 23:00 da avtomatik. Zarur bo'lsa JSON fayldan tiklash."
      />

      {/* Qo'lda yuborish */}
      <Card style={{ marginBottom: 16, padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>⏰ Avtomatik backup</div>
            <div style={{ fontSize: 13, color: "var(--text2)" }}>
              Har kuni 23:00 da butun DB → BACKUP_CHAT_ID ga JSON yuboriladi
            </div>
          </div>
          <Btn size="sm" color="blue" onClick={sendNow} disabled={sending}>
            {sending ? "⏳..." : "▶️ Hozir yuborish"}
          </Btn>
        </div>
      </Card>

      {/* Restore */}
      <Card style={{ padding: 24 }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>
          📂 Backup fayldan tiklash
        </div>

        <label style={s.upload}>
          <input type="file" accept=".json" onChange={onFile}
            style={{ display: "none" }} />
          {file ? (
            <div>
              <div style={{ fontSize: 24, marginBottom: 8 }}>📄</div>
              <div style={{ fontWeight: 600, color: "var(--green)" }}>{file.name}</div>
              <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 4 }}>
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📁</div>
              <div style={{ fontWeight: 600 }}>JSON fayl tanlang</div>
              <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 4 }}>
                botpos_full_backup_XXXX-XX-XX.json
              </div>
            </div>
          )}
        </label>

        {/* Preview */}
        {preview && (
          <div style={{ marginTop: 16, background: "var(--surface2)",
            borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 12, color: "var(--text2)",
              marginBottom: 10, fontWeight: 600 }}>📊 Fayl tarkibi</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                ["📅 Sana", preview.date],
                ["🏪 Do'konlar", preview.shopCount + " ta"],
                ["🧁 Sotuvlar", preview.saleCount + " ta"],
                ["💸 Chiqimlar", preview.expCount + " ta"],
                ["📊 Jami", preview.total + " hujjat"],
                ["📦 Versiya", preview.version],
              ].map(([l, v]) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between",
                  padding: "5px 0", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ fontSize: 12, color: "var(--text2)" }}>{l}</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 14, padding: "10px 14px", background: "rgba(248,113,113,0.1)",
              borderRadius: 8, fontSize: 12, color: "var(--red)", lineHeight: 1.6 }}>
              ⚠️ Mavjud ma'lumotlar <b>o'chirilmaydi</b>.
              Yangi hujjatlar qo'shiladi. Duplicate (_id bir xil) bo'lsa o'tkazib ketiladi.
            </div>

            <div style={{ marginTop: 12 }}>
              <Btn full onClick={restore} disabled={loading}>
                {loading ? "⏳ Yuklanmoqda..." : `✅ ${preview.total} ta hujjatni DB ga yuklash`}
              </Btn>
            </div>
          </div>
        )}

        {err && <Alert style={{ marginTop: 12 }}>{err}</Alert>}

        {/* Natija */}
        {result && (
          <div style={{ marginTop: 16, background: "var(--green2)",
            border: "1px solid rgba(34,212,122,0.3)", borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ color: "var(--green)", fontWeight: 700, marginBottom: 10 }}>
              ✅ {result.message}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {Object.entries(result.summary || {}).map(([col, val]) => (
                <span key={col} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6,
                  background: "rgba(34,212,122,0.15)", color: "var(--green)" }}>
                  {col}: {val}
                </span>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Ko'rsatma */}
      <Card style={{ marginTop: 16, padding: "16px 20px" }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>
          📋 Qanday ishlaydi?
        </div>
        {[
          ["1", "Har kuni 23:00 da bot BACKUP_CHAT_ID ga JSON fayl yuboradi"],
          ["2", "DB avariya bo'lsa — guruhdan JSON faylni yuklab olasiz"],
          ["3", "Yangi server/DB ga o'rnatganingizdan keyin shu sahifaga kelasiz"],
          ["4", "JSON faylni tanlaysiz → preview ko'rasiz → 'Yuklash' bosasiz"],
          ["5", "Barcha ma'lumotlar yangi DB ga tiklandi!"],
        ].map(([n, t]) => (
          <div key={n} style={{ display: "flex", gap: 10, padding: "6px 0",
            borderBottom: "1px solid var(--border)", fontSize: 13 }}>
            <span style={{ color: "var(--gold)", fontWeight: 700, minWidth: 20 }}>{n}.</span>
            <span style={{ color: "var(--text2)" }}>{t}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}

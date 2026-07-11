import { useState } from "react";
import { useNavigate } from "react-router-dom";

const BASE = process.env.REACT_APP_API_BASE_URL
          || process.env.REACT_APP_API_BASE
          || "http://localhost:6060";

export default function Login() {
    const [email,   setEmail]   = useState(process.env.REACT_APP_ADMIN_EMAIL || "admin@botpos.uz");
    const [pass,    setPass]    = useState("");
    const [err,     setErr]     = useState("");
    const [loading, setLoading] = useState(false);
    const nav = useNavigate();

    async function submit(e) {
        e.preventDefault();
        setErr(""); setLoading(true);

        try {
            const res = await fetch(`${BASE}/api/admin/login`, {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify({ email: email.trim(), password: pass }),
            });

            const json = await res.json();

            if (!json.ok) {
                setErr(json.error || "Login yoki parol xato");
                return;
            }

            // Server: { ok: true, data: { token, refresh } }
            const token   = json.data?.token;
            const refresh = json.data?.refresh;

            if (!token) {
                setErr("Token kelmadi — server xatosi");
                return;
            }

            localStorage.setItem("bp_token",   token);
            localStorage.setItem("bp_refresh",  refresh || "");
            nav("/");
        } catch (e) {
            setErr(
                e.name === "TypeError"
                    ? `Server bilan ulanib bo'lmadi.\nURL tekshiring: ${BASE}`
                    : String(e)
            );
        } finally {
            setLoading(false);
        }
    }

    const inp = {
        width: "100%", padding: "11px 14px",
        borderRadius: "var(--r)",
        background: "var(--surface2)",
        border: "1px solid var(--border)",
        color: "var(--text)", fontSize: 14,
        boxSizing: "border-box",
        outline: "none",
        fontFamily: "inherit",
    };

    return (
        <div style={{
            minHeight: "100vh", display: "flex",
            alignItems: "center", justifyContent: "center",
            background: "var(--bg)",
        }}>
            <div style={{
                width: 380,
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--r3)",
                padding: 40,
                boxShadow: "0 8px 32px rgba(0,0,0,.18)",
            }}>
                {/* Logo */}
                <div style={{ textAlign: "center", marginBottom: 32 }}>
                    <div style={{
                        display: "inline-flex", alignItems: "center",
                        gap: 8, marginBottom: 12,
                    }}>
                        <span style={{
                            width: 12, height: 12, borderRadius: "50%",
                            background: "var(--gold)", display: "inline-block",
                        }}/>
                        <span style={{ fontWeight: 700, fontSize: 18 }}>BOT·POS Admin</span>
                    </div>
                    <div style={{ color: "var(--text2)", fontSize: 13 }}>
                        Super Admin kirishi
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={submit} autoComplete="on">
                    <div style={{ marginBottom: 16 }}>
                        <label style={{
                            display: "block", fontSize: 12,
                            color: "var(--text2)", marginBottom: 6,
                            textTransform: "uppercase", letterSpacing: .5,
                        }}>
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="admin@botpos.uz"
                            autoComplete="email"
                            required
                            style={inp}
                        />
                    </div>

                    <div style={{ marginBottom: 20 }}>
                        <label style={{
                            display: "block", fontSize: 12,
                            color: "var(--text2)", marginBottom: 6,
                            textTransform: "uppercase", letterSpacing: .5,
                        }}>
                            Parol
                        </label>
                        <input
                            type="password"
                            value={pass}
                            onChange={e => setPass(e.target.value)}
                            placeholder="••••••••"
                            autoComplete="current-password"
                            required
                            style={inp}
                        />
                    </div>

                    {/* Xato */}
                    {err && (
                        <div style={{
                            color: "var(--red)", fontSize: 13,
                            marginBottom: 16, padding: "10px 14px",
                            background: "var(--red2)", borderRadius: "var(--r)",
                            lineHeight: 1.5, whiteSpace: "pre-line",
                        }}>
                            ⚠ {err}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !email || !pass}
                        style={{
                            width: "100%", padding: 13,
                            borderRadius: "var(--r)",
                            background: loading || !email || !pass
                                ? "var(--border)" : "var(--gold)",
                            color: "#000", fontWeight: 700,
                            fontSize: 15, border: "none",
                            cursor: loading ? "not-allowed" : "pointer",
                            transition: "background .15s",
                        }}
                    >
                        {loading ? "⏳ Kirmoqda..." : "Kirish →"}
                    </button>
                </form>

                {/* Debug: API URL ko'rsatish */}
                <div style={{
                    marginTop: 20, fontSize: 10,
                    color: "var(--text2)", textAlign: "center",
                    opacity: .4,
                }}>
                    API: {BASE}
                </div>
            </div>
        </div>
    );
}

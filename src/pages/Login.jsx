// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthAPI } from "../lib/auth.js";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      await AuthAPI.login(email.trim(), password);
      nav("/dashboard");
    } catch (e2) {
      setErr(e2?.message || "Login eșuat");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#020617", display: "grid", placeItems: "center", fontFamily: "system-ui" }}>
      <form onSubmit={submit} style={{ width: 420, maxWidth: "92vw", background: "#0B1220", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 16, padding: 18 }}>
        <div style={{ color: "white", fontWeight: 900, fontSize: 18 }}>Dumonde Operator</div>
        <div style={{ color: "rgba(255,255,255,0.65)", marginTop: 6, fontSize: 13 }}>Autentificare operator</div>

        {err ? (
          <div style={{ marginTop: 12, padding: 10, borderRadius: 12, border: "1px solid rgba(239,68,68,0.35)", background: "rgba(239,68,68,0.10)", color: "#FCA5A5", fontSize: 13 }}>
            {err}
          </div>
        ) : null}

        <div style={{ marginTop: 14 }}>
          <label style={{ display: "block", color: "rgba(255,255,255,0.75)", fontSize: 12, marginBottom: 6 }}>Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="operator@dumonde.ro"
            autoComplete="username"
            disabled={busy}
            style={{
              width: "100%",
              padding: "12px 12px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.06)",
              color: "white",
              outline: "none",
            }}
          />
        </div>

        <div style={{ marginTop: 12 }}>
          <label style={{ display: "block", color: "rgba(255,255,255,0.75)", fontSize: 12, marginBottom: 6 }}>Parolă</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            disabled={busy}
            style={{
              width: "100%",
              padding: "12px 12px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.06)",
              color: "white",
              outline: "none",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={busy}
          style={{
            width: "100%",
            marginTop: 14,
            padding: "12px 14px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.12)",
            background: busy ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.10)",
            color: "white",
            cursor: busy ? "not-allowed" : "pointer",
            fontWeight: 900,
          }}
        >
          {busy ? "Se autentifică..." : "Login"}
        </button>

        <div style={{ marginTop: 12, color: "rgba(255,255,255,0.55)", fontSize: 12, lineHeight: "16px" }}>
          Cookie-ul de sesiune este HttpOnly (op_token). Dacă ești pe același domeniu, merge direct.
        </div>
      </form>
    </div>
  );
}
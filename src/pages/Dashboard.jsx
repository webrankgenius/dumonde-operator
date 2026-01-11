// src/pages/Dashboard.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthAPI } from "../lib/auth.js";

const API_BASE = import.meta.env.VITE_API_BASE || "";

async function api(path) {
  const r = await fetch(`${API_BASE}${path}`, { credentials: "include" });
  const txt = await r.text();
  let j = null;
  try { j = txt ? JSON.parse(txt) : null; } catch {}
  if (!r.ok) throw new Error(j?.error || `HTTP ${r.status}`);
  return j;
}

export default function Dashboard() {
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [convs, setConvs] = useState([]);

  async function load() {
    setErr("");
    setBusy(true);
    try {
      // Ajustează endpoint-ul dacă la tine e altul.
      // În app.mjs ai /api/operator (router existent) + /api/op pentru auth.
      // Presupun că listConversations e pe /api/operator/conversations.
      const data = await api("/api/operator/conversations");
      const items = Array.isArray(data) ? data : (data?.items || data?.conversations || []);
      setConvs(items);
    } catch (e) {
      setErr(e?.message || String(e));
      setConvs([]);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    load().catch(() => {});
    const t = setInterval(() => load().catch(() => {}), 8000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = useMemo(() => {
    const list = Array.isArray(convs) ? convs : [];
    const total = list.length;
    const open = list.filter((c) => (c.status || "") === "open").length;
    const pending = list.filter((c) => (c.status || "") === "pending").length;
    const closed = list.filter((c) => (c.status || "") === "closed").length;

    const takeover = list.filter((c) => (c.takeoverMode || "") === "operator").length;

    const complaints = list.filter((c) => Number(c.priority || 0) >= 3).length;
    const returns = list.filter((c) => Number(c.priority || 0) === 2).length;

    return { total, open, pending, closed, takeover, complaints, returns };
  }, [convs]);

  async function logout() {
    setBusy(true);
    try {
      await AuthAPI.logout();
      nav("/login");
    } catch (e) {
      setErr(e?.message || String(e));
    } finally {
      setBusy(false);
    }
  }

  function Card({ label, value, hint }) {
    return (
      <div style={{ padding: 14, borderRadius: 16, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.04)" }}>
        <div style={{ color: "rgba(255,255,255,0.70)", fontSize: 12 }}>{label}</div>
        <div style={{ color: "white", fontSize: 26, fontWeight: 900, marginTop: 6 }}>{value}</div>
        {hint ? <div style={{ marginTop: 6, color: "rgba(255,255,255,0.55)", fontSize: 12 }}>{hint}</div> : null}
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#020617", fontFamily: "system-ui", color: "white" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900 }}>Dashboard Operator</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", marginTop: 4 }}>
              Statistici rapide din conversații (refresh la 8 secunde)
            </div>
          </div>

          <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
            <Link
              to="/conversations"
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.08)",
                color: "white",
                textDecoration: "none",
                fontWeight: 900,
              }}
            >
              Mergi la conversații
            </Link>
            <button
              onClick={() => load()}
              disabled={busy}
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.06)",
                color: "white",
                cursor: busy ? "not-allowed" : "pointer",
                fontWeight: 900,
              }}
            >
              Refresh
            </button>
            <button
              onClick={logout}
              disabled={busy}
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(239,68,68,0.35)",
                background: "rgba(239,68,68,0.12)",
                color: "white",
                cursor: busy ? "not-allowed" : "pointer",
                fontWeight: 900,
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {err ? (
          <div style={{ marginTop: 14, padding: 12, borderRadius: 14, border: "1px solid rgba(239,68,68,0.35)", background: "rgba(239,68,68,0.10)", color: "#FCA5A5" }}>
            {err}
            <div style={{ marginTop: 8, color: "rgba(255,255,255,0.6)", fontSize: 12 }}>
              Dacă endpoint-ul diferă, spune-mi ce ai în `OperatorAPI.listConversations()` (URL-ul), și îl aliniez aici.
            </div>
          </div>
        ) : null}

        <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 }}>
          <Card label="Total conversații" value={stats.total} />
          <Card label="Open" value={stats.open} />
          <Card label="Pending" value={stats.pending} hint="De obicei: alert / reclamație / context slab" />
          <Card label="Closed" value={stats.closed} />
          <Card label="Takeover operator" value={stats.takeover} />
          <Card label="Reclamații (priority ≥ 3)" value={stats.complaints} />
          <Card label="Retururi (priority = 2)" value={stats.returns} />
        </div>

        <div style={{ marginTop: 16, padding: 14, borderRadius: 16, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.03)" }}>
          <div style={{ fontWeight: 900 }}>Acces rapid</div>
          <div style={{ marginTop: 10, color: "rgba(255,255,255,0.75)", fontSize: 13 }}>
            Intră în inbox și preia conversațiile urgente.
          </div>
          <div style={{ marginTop: 12 }}>
            <Link
              to="/conversations"
              style={{
                display: "inline-block",
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(99,102,241,0.40)",
                background: "rgba(99,102,241,0.18)",
                color: "white",
                textDecoration: "none",
                fontWeight: 900,
              }}
            >
              Deschide inbox-ul operator
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
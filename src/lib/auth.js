// src/lib/auth.js
import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || ""; 
// dacă servești operatorul de pe același domeniu ca API-ul, lasă "" (same-origin)
// altfel setezi VITE_API_BASE="https://srv873265.hstgr.cloud"

async function api(path, opts = {}) {
  const r = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
    credentials: "include", // IMPORTANT: ca să trimită cookie-ul op_token
  });

  const txt = await r.text();
  let j = null;
  try { j = txt ? JSON.parse(txt) : null; } catch {}
  if (!r.ok) {
    const msg = j?.error || `HTTP ${r.status}`;
    const err = new Error(msg);
    err.status = r.status;
    err.payload = j;
    throw err;
  }
  return j;
}

export const AuthAPI = {
  me: () => api("/api/op/me", { method: "GET" }),
  login: (email, password) => api("/api/op/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  logout: () => api("/api/op/logout", { method: "POST" }),
};

export function useAuth() {
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [operator, setOperator] = useState(null);

  useEffect(() => {
    let mounted = true;
    AuthAPI.me()
      .then((j) => {
        if (!mounted) return;
        setAuthed(true);
        setOperator(j?.operator || null);
      })
      .catch(() => {
        if (!mounted) return;
        setAuthed(false);
        setOperator(null);
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  return { loading, authed, operator };
}
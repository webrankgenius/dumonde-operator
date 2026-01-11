// src/lib/api.js
const API_BASE = ""; // IMPORTANT: same-origin (https://srv873265.hstgr.cloud)

async function jfetch(path, opts = {}) {
  const r = await fetch(API_BASE + path, {
    ...opts,
    credentials: "include", // IMPORTANT: trimite cookie
    headers: {
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
  });

  // dacă primești 401, poți redirect la /login
  if (r.status === 401) {
    throw new Error("Unauthorized (401)");
  }

  const ct = r.headers.get("content-type") || "";
  if (ct.includes("application/json")) return await r.json();
  return await r.text();
}

export const OperatorAPI = {
  me: () => jfetch("/api/op/me", { method: "GET" }),
  login: (email, password) =>
    jfetch("/api/op/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  logout: () => jfetch("/api/op/logout", { method: "POST" }),

  // IMPORTANT: conversations vin din /api/operator, dar acum sunt protejate cu cookie JWT
  listConversations: () => jfetch("/api/operator/conversations", { method: "GET" }),
  getMessages: (conversationId) => jfetch(`/api/operator/conversations/${conversationId}/messages`, { method: "GET" }),
  sendMessage: (conversationId, content) =>
    jfetch(`/api/operator/conversations/${conversationId}/messages`, {
      method: "POST",
      body: JSON.stringify({ content }),
    }),

  takeover: (conversationId) => jfetch(`/api/operator/conversations/${conversationId}/takeover`, { method: "POST" }),
  close: (conversationId) => jfetch(`/api/operator/conversations/${conversationId}/close`, { method: "POST" }),
};
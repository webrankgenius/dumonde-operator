// src/lib/api.js
const API_BASE = import.meta.env.VITE_API_BASE;
const OP_KEY = import.meta.env.VITE_OPERATOR_KEY;

async function req(path, { method = "GET", body } = {}) {
  if (!API_BASE) throw new Error("Missing VITE_API_BASE");
  if (!OP_KEY) throw new Error("Missing VITE_OPERATOR_KEY");

  const url = `${API_BASE}${path}`;

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OP_KEY}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }

  if (!res.ok) {
    const msg = data?.error || `${res.status} ${res.statusText}`;
    throw new Error(msg);
  }
  return data;
}

export const OperatorAPI = {
  listConversations() {
    return req("/api/operator/conversations");
  },
  getMessages(convId) {
    return req(`/api/operator/conversations/${convId}/messages`);
  },
  sendMessage(convId, content) {
    return req(`/api/operator/conversations/${convId}/messages`, { method: "POST", body: { content } });
  },
  takeover(convId) {
    return req(`/api/operator/conversations/${convId}/takeover`, { method: "POST" });
  },
  close(convId) {
    return req(`/api/operator/conversations/${convId}/close`, { method: "POST" });
  },
};
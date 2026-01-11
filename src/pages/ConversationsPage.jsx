import { useEffect, useMemo, useRef, useState } from "react";
import { OperatorAPI } from "./lib/api";
import { connectOperatorSocket } from "./lib/socket";

// ---------- helpers ----------
const asArray = (x) => (Array.isArray(x) ? x : []);

const convListFromApi = (data) => {
  if (Array.isArray(data)) return data;
  if (data?.items && Array.isArray(data.items)) return data.items;
  if (data?.conversations && Array.isArray(data.conversations)) return data.conversations;
  return [];
};

const msgListFromApi = (data) => {
  if (Array.isArray(data)) return data;
  if (data?.items && Array.isArray(data.items)) return data.items;
  if (data?.messages && Array.isArray(data.messages)) return data.messages;
  return [];
};

const sortByCreatedAtAsc = (arr) =>
  [...(Array.isArray(arr) ? arr : [])].sort((a, b) => {
    const ta = new Date(a?.createdAt || 0).getTime();
    const tb = new Date(b?.createdAt || 0).getTime();
    return ta - tb;
  });

function fmtTime(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return String(iso);
  }
}

function downloadFile(filename, content, mime = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function buildChatTxt(conv, messages) {
  const header = [
    `Conversation: ${conv?.id || "-"}`,
    `Status: ${conv?.status || "-"}`,
    `Takeover: ${conv?.takeoverMode || "-"}`,
    `Channel: ${conv?.channel || "-"}`,
    `Session: ${conv?.sessionId || "-"}`,
    `Created: ${fmtTime(conv?.createdAt)}`,
    `Last: ${fmtTime(conv?.lastMessageAt)}`,
  ].join("\n");

  const lines = (messages || []).map((m) => `[${fmtTime(m.createdAt)}] ${m.role}: ${m.content}`);
  return `${header}\n\n--- MESSAGES ---\n\n${lines.join("\n\n")}\n`;
}

// ---------- UI bits ----------
function Badge({ children }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "4px 10px",
        borderRadius: 999,
        border: "1px solid rgba(255,255,255,0.14)",
        background: "rgba(255,255,255,0.06)",
        color: "rgba(255,255,255,0.9)",
        fontSize: 12,
        lineHeight: "16px",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function toneDot(status) {
  const color = status === "pending" ? "#F59E0B" : status === "closed" ? "#EF4444" : "#22C55E";
  return <span style={{ width: 8, height: 8, borderRadius: 999, background: color, display: "inline-block" }} />;
}

// ---------- App ----------
export default function App() {
  const [convs, setConvs] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const socketRef = useRef(null);
  const msgScrollRef = useRef(null);

  // IMPORTANT: ref ca să nu folosim activeId "înghețat" în listener
  const activeIdRef = useRef(null);
  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  const convList = useMemo(() => asArray(convs), [convs]);
  const active = useMemo(() => convList.find((c) => c.id === activeId) || null, [convList, activeId]);

  const scrollToBottom = (smooth = false) => {
    const el = msgScrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
  };

  async function refreshConvs({ silent = false } = {}) {
    if (!silent) setErr("");
    const data = await OperatorAPI.listConversations();
    setConvs(convListFromApi(data));
  }

  async function openConversation(id) {
    setErr("");
    setActiveId(id);

    const data = await OperatorAPI.getMessages(id);
    setMsgs(sortByCreatedAtAsc(msgListFromApi(data)));

    // join imediat (dacă socket e conectat, join direct; altfel îl prinde effect-ul de activeId)
    try {
      const s = socketRef.current;
      if (s?.connected) s.emit("join:conversation", { conversationId: id });
    } catch {}

    setTimeout(() => scrollToBottom(false), 0);
  }

  async function send() {
    if (!activeId) return;
    const v = text.trim();
    if (!v) return;

    setBusy(true);
    setErr("");
    try {
      setText("");
      await OperatorAPI.sendMessage(activeId, v);

      // fallback fetch (dacă WS întârzie)
      const data = await OperatorAPI.getMessages(activeId);
      setMsgs(sortByCreatedAtAsc(msgListFromApi(data)));
      await refreshConvs({ silent: true });

      setTimeout(() => scrollToBottom(true), 0);
    } catch (e) {
      setErr(e?.message || String(e));
    } finally {
      setBusy(false);
    }
  }

  async function takeover() {
    if (!activeId) return;
    setBusy(true);
    setErr("");
    try {
      await OperatorAPI.takeover(activeId);
      await refreshConvs({ silent: true });
    } catch (e) {
      setErr(e?.message || String(e));
    } finally {
      setBusy(false);
    }
  }

  async function closeConversation() {
    if (!activeId) return;
    setBusy(true);
    setErr("");
    try {
      await OperatorAPI.close(activeId);
      await refreshConvs({ silent: true });
    } catch (e) {
      setErr(e?.message || String(e));
    } finally {
      setBusy(false);
    }
  }

  function downloadChat() {
    if (!active) return;
    downloadFile(
      `dumonde-chat-${active.id}.json`,
      JSON.stringify({ conversation: active, messages: msgs }, null, 2),
      "application/json;charset=utf-8"
    );
    downloadFile(`dumonde-chat-${active.id}.txt`, buildChatTxt(active, msgs), "text/plain;charset=utf-8");
  }

  // initial load + periodic refresh (safety net)
  useEffect(() => {
    refreshConvs().catch((e) => setErr(e?.message || String(e)));
    const t = setInterval(() => refreshConvs({ silent: true }).catch(() => {}), 6000);
    return () => clearInterval(t);
  }, []);

  // socket init ONCE (cu guard anti-StrictMode double mount)
  useEffect(() => {
    if (socketRef.current) return;

    const s = connectOperatorSocket();
    socketRef.current = s;

    s.on("connect", () => {
      console.log("[OP] ws connected", s.id, "ns=", s.nsp);
      // dacă avem deja conversație activă, fă join imediat după connect
      const cid = activeIdRef.current;
      if (cid) {
        try {
          s.emit("join:conversation", { conversationId: cid });
        } catch {}
      }
    });

    s.on("connect_error", (e) => console.log("[OP] ws connect_error", e?.message || e));
    s.on("disconnect", (r) => console.log("[OP] ws disconnected", r));

    // IMPORTANT: doar un singur listener pentru message:new
    s.on("conversation:updated", () => {
      refreshConvs({ silent: true }).catch(() => {});
    });

    s.on("message:new", (payload) => {
      const cid = payload?.conversationId;
      if (!cid) return;

      // sidebar refresh/reorder
      refreshConvs({ silent: true }).catch(() => {});

      // adaugă live doar dacă e conversația activă (folosim ref)
      const currentActive = activeIdRef.current;
      if (cid === currentActive) {
        const m = payload?.message || payload;
        if (!m) return;

        setMsgs((prev) => {
          const next = [...prev, m];
          // dedupe (în caz de resend/fallback)
          const seen = new Set();
          const uniq = [];
          for (const x of next) {
            const key = x?.id || `${x?.role}|${x?.createdAt}|${x?.content}`;
            if (seen.has(key)) continue;
            seen.add(key);
            uniq.push(x);
          }
          return sortByCreatedAtAsc(uniq);
        });

        setTimeout(() => scrollToBottom(true), 0);
      }
    });

    return () => {
      try {
        s.close();
      } catch {}
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // join/leave room when active changes (ROBUST: dacă nu e conectat încă, așteaptă connect)
  useEffect(() => {
    const s = socketRef.current;
    if (!s || !activeId) return;

    const join = () => {
      try {
        s.emit("join:conversation", { conversationId: activeId });
      } catch {}
    };

    if (s.connected) join();
    else s.once("connect", join);

    return () => {
      try {
        s.emit("leave:conversation", { conversationId: activeId });
      } catch {}
    };
  }, [activeId]);

  return (
    <div style={{ height: "100vh", background: "#0B1220", fontFamily: "system-ui" }}>
      <div style={{ height: "100vh", display: "grid", gridTemplateColumns: "360px 1fr", minHeight: 0 }}>
        {/* Sidebar */}
        <div
          style={{
            background: "#0F172A",
            borderRight: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}
        >
          <div style={{ padding: 16, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ color: "white", fontWeight: 900, fontSize: 16 }}>Dumonde Operator</div>

            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button
                onClick={() => refreshConvs().catch((e) => setErr(e?.message || String(e)))}
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.06)",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                Refresh
              </button>
            </div>

            {err ? (
              <div
                style={{
                  marginTop: 12,
                  padding: 10,
                  borderRadius: 10,
                  background: "rgba(239,68,68,0.12)",
                  border: "1px solid rgba(239,68,68,0.35)",
                  color: "#FCA5A5",
                  fontSize: 12,
                }}
              >
                {err}
              </div>
            ) : null}
          </div>

          <div
            style={{
              padding: 12,
              overflowY: "auto",
              overflowX: "hidden",
              flex: 1,
              minHeight: 0,
            }}
          >
            <div style={{ display: "grid", gap: 10 }}>
              {convList.map((c) => {
                const isActive = c.id === activeId;
                const urgent = Number(c.priority || 0) >= 3 || c.status === "pending";
                const preview = c?.lastMessage?.content ? String(c.lastMessage.content) : "";
                return (
                  <button
                    key={c.id}
                    onClick={() => openConversation(c.id)}
                    style={{
                      textAlign: "left",
                      padding: 10,
                      borderRadius: 10,
                      border: urgent
                        ? "1px solid rgba(239,68,68,0.60)"
                        : isActive
                        ? "1px solid rgba(99,102,241,0.7)"
                        : "1px solid rgba(255,255,255,0.10)",

                      background: urgent
                        ? "rgba(239,68,68,0.10)"
                        : isActive
                        ? "rgba(99,102,241,0.15)"
                        : "rgba(255,255,255,0.04)",

                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 800,
                        fontSize: 13,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {c.channel || "web"} · {c.sessionId || c.id}
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                      <Badge>
                        {toneDot(c.status)}&nbsp;{c.status || "open"}
                      </Badge>
                      <Badge>takeover: {c.takeoverMode || "bot"}</Badge>
                    </div>

                    <div
                      style={{
                        marginTop: 8,
                        fontSize: 12,
                        color: "rgba(255,255,255,0.75)",
                        lineHeight: "16px",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {preview || "(no messages)"}
                    </div>

                    <div style={{ marginTop: 8, fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
                      {fmtTime(c.lastMessageAt)}
                    </div>
                  </button>
                );
              })}

              {!convList.length ? (
                <div
                  style={{
                    padding: 14,
                    borderRadius: 14,
                    border: "1px dashed rgba(255,255,255,0.2)",
                    background: "rgba(255,255,255,0.03)",
                    color: "rgba(255,255,255,0.7)",
                    fontSize: 13,
                  }}
                >
                  Nu există conversații încă.
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Chat */}
        <div style={{ display: "grid", gridTemplateRows: "auto 1fr auto", minHeight: 0, background: "#020617" }}>
          {/* topbar */}
          <div
            style={{
              padding: 16,
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              background: "#0B1220",
              display: "flex",
              alignItems: "center",
              gap: 10,
              minWidth: 0,
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  color: "white",
                  fontWeight: 900,
                  fontSize: 15,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {active ? `Conversație: ${active.sessionId || active.id}` : "Selectează o conversație"}
              </div>
              {active ? (
                <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 8 }}>
                  <Badge>
                    {toneDot(active.status)}&nbsp;{active.status}
                  </Badge>
                  <Badge>takeover: {active.takeoverMode}</Badge>
                  <Badge>{active.channel}</Badge>
                </div>
              ) : null}
            </div>

            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              <button
                disabled={!activeId || busy}
                onClick={takeover}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.06)",
                  color: "white",
                  cursor: !activeId || busy ? "not-allowed" : "pointer",
                  fontWeight: 800,
                }}
              >
                Takeover
              </button>
              <button
                disabled={!activeId || busy}
                onClick={closeConversation}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.06)",
                  color: "white",
                  cursor: !activeId || busy ? "not-allowed" : "pointer",
                  fontWeight: 800,
                }}
              >
                Close
              </button>
              <button
                disabled={!activeId}
                onClick={downloadChat}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.06)",
                  color: "white",
                  cursor: !activeId ? "not-allowed" : "pointer",
                  fontWeight: 800,
                }}
              >
                Download
              </button>
            </div>
          </div>

          {/* messages */}
          <div
            ref={msgScrollRef}
            style={{
              padding: 16,
              overflowY: "auto",
              overflowX: "hidden",
              minHeight: 0,
            }}
          >
            {!active ? (
              <div
                style={{
                  maxWidth: 760,
                  margin: "48px auto",
                  padding: 18,
                  borderRadius: 16,
                  border: "1px dashed rgba(255,255,255,0.25)",
                  background: "rgba(255,255,255,0.03)",
                  color: "rgba(255,255,255,0.75)",
                }}
              >
                Alege o conversație din stânga ca să vezi mesajele și să răspunzi.
              </div>
            ) : (
              <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gap: 10 }}>
                {msgs.map((m, idx) => {
                  const isUser = String(m.role) === "user";
                  const align = isUser ? "flex-start" : "flex-end";
                  const bg = isUser ? "rgba(255,255,255,0.06)" : "rgba(99,102,241,0.18)";
                  const bd = isUser ? "rgba(255,255,255,0.12)" : "rgba(99,102,241,0.35)";
                  return (
                    <div key={m.id || idx} style={{ display: "flex", justifyContent: align, minWidth: 0 }}>
                      <div
                        style={{
                          maxWidth: "78%",
                          padding: 12,
                          borderRadius: 16,
                          border: `1px solid ${bd}`,
                          background: bg,
                          color: "white",
                          minWidth: 0,
                          overflowWrap: "anywhere",
                          wordBreak: "break-word",
                        }}
                      >
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)" }}>
                          <b style={{ color: "rgba(255,255,255,0.9)" }}>{m.role}</b> · {fmtTime(m.createdAt)}
                        </div>
                        <div style={{ marginTop: 6, whiteSpace: "pre-wrap", fontSize: 14, lineHeight: "20px" }}>
                          {m.content}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* composer */}
          <div style={{ padding: 16, borderTop: "1px solid rgba(255,255,255,0.08)", background: "#0B1220" }}>
            <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", gap: 10 }}>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => (e.key === "Enter" ? send() : null)}
                placeholder={active ? "Scrie mesaj..." : "Selectează o conversație"}
                disabled={!activeId || busy}
                style={{
                  flex: 1,
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.06)",
                  color: "white",
                  outline: "none",
                  minWidth: 0,
                }}
              />
              <button
                onClick={send}
                disabled={!activeId || busy}
                style={{
                  padding: "12px 16px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: !activeId || busy ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.10)",
                  color: "white",
                  cursor: !activeId || busy ? "not-allowed" : "pointer",
                  fontWeight: 900,
                  minWidth: 110,
                }}
              >
                Trimite
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
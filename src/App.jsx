import { useEffect, useMemo, useRef, useState } from "react";
import { OperatorAPI } from "./lib/api";
import { connectOperatorSocket } from "./lib/socket";

export default function App() {
  const [convs, setConvs] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState("");
  const [err, setErr] = useState("");
  const bottomRef = useRef(null);
    const asArray = (x) => (Array.isArray(x) ? x : []);
 const convListFromApi = (data) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.items)) return data.items;           // <-- ADD THIS
  if (data && Array.isArray(data.conversations)) return data.conversations;
  return [];
};
  const msgListFromApi = (data) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.items)) return data.items;           // <-- ADD THIS
  if (data && Array.isArray(data.messages)) return data.messages;
  return [];
};

  async function refreshConvs() {
    setErr("");
    const data = await OperatorAPI.listConversations();
    setConvs(convListFromApi(data));
  }

    async function openConversation(id) {
    setActiveId(id);
    setErr("");
    const data = await OperatorAPI.getMessages(id);
    setMsgs(msgListFromApi(data));
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 10);
  }

  async function send() {
    if (!activeId) return;
    const v = text.trim();
    if (!v) return;
    setText("");
    await OperatorAPI.sendMessage(activeId, v);
    // mesajul va veni și pe WS, dar ca fallback refacem fetch
       const data = await OperatorAPI.getMessages(activeId);
    setMsgs(msgListFromApi(data));
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 10);
  }

  useEffect(() => {
    refreshConvs().catch((e) => setErr(e.message));
  }, []);

  useEffect(() => {
    const s = connectOperatorSocket();

    s.on("connect", () => console.log("[OP] ws connected", s.id));
    s.on("connect_error", (e) => console.log("[OP] ws connect_error", e?.message || e));

    // Aici te legi pe evenimentele pe care le emiți din dumonde-chat.
    // Din log-ul tău: "[WS] emit message:new ..."
    s.on("message:new", (payload) => {
      // payload ar trebui să conțină conversationId + message
      // dacă schema diferă, ajustăm după ce vedem ce trimite exact serverul.
      try {
        const cid = payload?.conversationId;
        if (!cid) return;

        // actualizează lista conversații (ușor)
        refreshConvs().catch(() => {});

        if (cid === activeId) {
          setMsgs((prev) => {
            const m = payload?.message || payload; // acceptăm ambele forme
            return [...prev, m];
          });
          setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 10);
        }
      } catch {}
    });

    return () => s.close();
  }, [activeId]);

  const convList = useMemo(() => asArray(convs), [convs]);
  const active = useMemo(() => convList.find((c) => c.id === activeId), [convList, activeId]);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", height: "100vh", fontFamily: "system-ui" }}>
      <div style={{ borderRight: "1px solid #ddd", padding: 12, overflow: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
          <h3 style={{ margin: 0 }}>Dumonde Operator</h3>
          <button onClick={() => refreshConvs().catch((e) => setErr(e.message))}>Refresh</button>
        </div>

        {err ? <div style={{ color: "crimson", marginTop: 8 }}>{err}</div> : null}

        <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
          {convList.map((c) => (
            <button
              key={c.id}
              onClick={() => openConversation(c.id).catch((e) => setErr(e.message))}
              style={{
                textAlign: "left",
                padding: 10,
                border: "1px solid #ddd",
                background: c.id === activeId ? "#f3f3f3" : "white",
                cursor: "pointer",
              }}
            >
              <div style={{ fontWeight: 700 }}>{c.id}</div>
              <div style={{ fontSize: 12, opacity: 0.75 }}>
                {c.status} · takeover: {c.takeoverMode}
              </div>
              <div style={{ fontSize: 12, opacity: 0.75 }}>
                {c.channel} · {c.sessionId}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateRows: "auto 1fr auto", height: "100%" }}>
        <div style={{ padding: 12, borderBottom: "1px solid #ddd", display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ fontWeight: 700 }}>
            {active ? `Conversație: ${active.id}` : "Selectează o conversație"}
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <button
              disabled={!activeId}
              onClick={() => OperatorAPI.takeover(activeId).then(() => refreshConvs()).catch((e) => setErr(e.message))}
            >
              Takeover
            </button>
            <button
              disabled={!activeId}
              onClick={() => OperatorAPI.close(activeId).then(() => refreshConvs()).catch((e) => setErr(e.message))}
            >
              Close
            </button>
          </div>
        </div>

        <div style={{ padding: 12, overflow: "auto" }}>
          {msgs.map((m, idx) => (
            <div key={m.id || idx} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 12, opacity: 0.7 }}>
                <b>{m.role}</b> · {m.createdAt || ""}
              </div>
              <div style={{ whiteSpace: "pre-wrap" }}>{m.content}</div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div style={{ padding: 12, borderTop: "1px solid #ddd", display: "flex", gap: 8 }}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => (e.key === "Enter" ? send().catch((er) => setErr(er.message)) : null)}
            placeholder="Scrie mesaj..."
            style={{ flex: 1, padding: 10 }}
          />
          <button onClick={() => send().catch((er) => setErr(er.message))} disabled={!activeId}>
            Trimite
          </button>
        </div>
      </div>
    </div>
  );
}
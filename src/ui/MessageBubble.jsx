// src/ui/MessageBubble.jsx
import { fmtTime } from "../utils/format";

export function MessageBubble({ m }) {
  const isUser = String(m.role) === "user";

  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-start" : "flex-end" }}>
      <div
        style={{
          maxWidth: "78%",
          minWidth: 0,
          padding: 12,
          borderRadius: 16,
          border: `1px solid ${isUser ? "rgba(255,255,255,0.12)" : "rgba(99,102,241,0.35)"}`,
          background: isUser ? "rgba(255,255,255,0.06)" : "rgba(99,102,241,0.18)",
          color: "white",
          overflowWrap: "anywhere",
          wordBreak: "break-word",
        }}
      >
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)" }}>
          <b style={{ color: "rgba(255,255,255,0.90)" }}>{m.role}</b> · {fmtTime(m.createdAt)}
        </div>
        <div style={{ marginTop: 6, whiteSpace: "pre-wrap", fontSize: 14, lineHeight: "20px" }}>
          {m.content}
        </div>
      </div>
    </div>
  );
}
// src/ui/ConversationItem.jsx
import { Badge, Dot, toneFromStatus } from "./Badge";
import { fmtTime } from "../utils/format";

export function ConversationItem({ c, active, onOpen }) {
  const statusTone = toneFromStatus(c.status);
  const preview = c?.lastMessage?.content ? String(c.lastMessage.content) : "";

  return (
    <button
      onClick={onOpen}
      style={{
        width: "100%",
        textAlign: "left",
        padding: 12,
        borderRadius: 14,
        border: active ? "1px solid rgba(99,102,241,0.70)" : "1px solid rgba(255,255,255,0.10)",
        background: active ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.04)",
        color: "white",
        cursor: "pointer",
        minWidth: 0,
      }}
    >
      <div style={{ fontWeight: 800, fontSize: 13, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>
        {c.channel || "web"} · {c.sessionId || c.id}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
        <Badge tone={statusTone}>
          <Dot tone={statusTone} /> {c.status || "open"}
        </Badge>
        <Badge tone={c.takeoverMode === "operator" ? "ok" : "neutral"}>
          takeover: {c.takeoverMode || "bot"}
        </Badge>
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
          minWidth: 0,
        }}
      >
        {preview || "(no messages)"}
      </div>

      <div style={{ marginTop: 8, fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
        {fmtTime(c.lastMessageAt)}
      </div>
    </button>
  );
}
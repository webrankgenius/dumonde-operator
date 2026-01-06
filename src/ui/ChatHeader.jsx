// src/ui/ChatHeader.jsx
import { Badge, Dot, toneFromStatus } from "./Badge";

export function ChatHeader({ active, busy, onTakeover, onClose, onDownload }) {
  return (
    <div style={{ padding: 16, display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            color: "white",
            fontWeight: 900,
            fontSize: 15,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {active ? `Conversație: ${active.sessionId || active.id}` : "Selectează o conversație"}
        </div>

        {active ? (
          <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 8 }}>
            <Badge tone={toneFromStatus(active.status)}>
              <Dot tone={toneFromStatus(active.status)} /> {active.status}
            </Badge>
            <Badge tone={active.takeoverMode === "operator" ? "ok" : "neutral"}>takeover: {active.takeoverMode}</Badge>
            <Badge tone="neutral">{active.channel}</Badge>
          </div>
        ) : null}
      </div>

      <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
        <button
          disabled={!active || busy}
          onClick={onTakeover}
          style={btnStyle(!active || busy)}
        >
          Takeover
        </button>
        <button
          disabled={!active || busy}
          onClick={onClose}
          style={btnStyle(!active || busy)}
        >
          Close
        </button>
        <button
          disabled={!active}
          onClick={onDownload}
          style={btnStyle(!active)}
        >
          Download
        </button>
      </div>
    </div>
  );
}

function btnStyle(disabled) {
  return {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    background: disabled ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.06)",
    color: "white",
    cursor: disabled ? "not-allowed" : "pointer",
    fontWeight: 800,
  };
}
// src/ui/ChatPanel.jsx
export function ChatPanel({ header, messages, composer }) {
  return (
    <div
      style={{
        background: "#050B17",
        height: "100vh",
        minHeight: 0,
        display: "grid",
        gridTemplateRows: "auto 1fr auto",
        minWidth: 0,
      }}
    >
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", background: "#0B1220" }}>
        {header}
      </div>

      <div style={{ minHeight: 0, minWidth: 0 }}>{messages}</div>

      <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", background: "#0B1220" }}>
        {composer}
      </div>
    </div>
  );
}
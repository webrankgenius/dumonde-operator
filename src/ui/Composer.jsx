// src/ui/Composer.jsx
export function Composer({ disabled, text, setText, onSend, busy }) {
  return (
    <div style={{ padding: 16 }}>
      <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", gap: 10 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => (e.key === "Enter" ? onSend() : null)}
          placeholder={disabled ? "Selectează o conversație" : "Scrie mesaj..."}
          disabled={disabled || busy}
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
          onClick={onSend}
          disabled={disabled || busy}
          style={{
            padding: "12px 16px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.12)",
            background: disabled || busy ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.08)",
            color: "white",
            cursor: disabled || busy ? "not-allowed" : "pointer",
            fontWeight: 900,
            minWidth: 110,
          }}
        >
          Trimite
        </button>
      </div>
    </div>
  );
}
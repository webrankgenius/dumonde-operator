// src/ui/MessageList.jsx
import { MessageBubble } from "./MessageBubble";

export function MessageList({ active, msgs, listRef }) {
  return (
    <div
      ref={listRef}
      style={{
        height: "100%",
        minHeight: 0,
        minWidth: 0,
        overflow: "auto",
        padding: 16,
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
        <div style={{ maxWidth: 860, margin: "0 auto", display: "grid", gap: 10 }}>
          {msgs.map((m, idx) => (
            <MessageBubble key={m.id || idx} m={m} />
          ))}
        </div>
      )}
    </div>
  );
}
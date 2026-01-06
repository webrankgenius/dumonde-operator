// src/ui/ConversationList.jsx
import { ConversationItem } from "./ConversationItem";

export function ConversationList({ convs, activeId, onOpen }) {
  return (
    <div style={{ display: "grid", gap: 10 }}>
      {convs.map((c) => (
        <ConversationItem
          key={c.id}
          c={c}
          active={c.id === activeId}
          onOpen={() => onOpen(c.id)}
        />
      ))}

      {!convs.length ? (
        <div
          style={{
            padding: 14,
            borderRadius: 14,
            border: "1px dashed rgba(255,255,255,0.20)",
            background: "rgba(255,255,255,0.03)",
            color: "rgba(255,255,255,0.70)",
            fontSize: 13,
          }}
        >
          Nu există conversații încă.
        </div>
      ) : null}
    </div>
  );
}
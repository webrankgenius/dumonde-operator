// src/ui/Badge.jsx
export function Badge({ children, tone = "neutral" }) {
  const map = {
    neutral: { bg: "#0B1220", bd: "rgba(255,255,255,0.12)", fg: "rgba(255,255,255,0.85)" },
    ok: { bg: "rgba(34,197,94,0.12)", bd: "rgba(34,197,94,0.35)", fg: "rgba(187,247,208,1)" },
    warn: { bg: "rgba(245,158,11,0.12)", bd: "rgba(245,158,11,0.35)", fg: "rgba(253,230,138,1)" },
    danger: { bg: "rgba(239,68,68,0.12)", bd: "rgba(239,68,68,0.35)", fg: "rgba(254,202,202,1)" },
  };
  const c = map[tone] || map.neutral;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 10px",
        borderRadius: 999,
        border: `1px solid ${c.bd}`,
        background: c.bg,
        color: c.fg,
        fontSize: 12,
        lineHeight: "16px",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

export function Dot({ tone = "ok" }) {
  const color =
    tone === "ok" ? "#22C55E" : tone === "warn" ? "#F59E0B" : tone === "danger" ? "#EF4444" : "#94A3B8";
  return <span style={{ width: 8, height: 8, borderRadius: 999, background: color, display: "inline-block" }} />;
}

export function toneFromStatus(status) {
  if (status === "pending") return "warn";
  if (status === "closed") return "danger";
  return "ok";
}
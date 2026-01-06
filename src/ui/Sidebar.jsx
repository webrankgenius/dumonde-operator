// src/ui/Sidebar.jsx
export function Sidebar({ header, children }) {
  return (
    <div
      style={{
        background: "#0B1220",
        borderRight: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        minHeight: 0,
        minWidth: 0,
      }}
    >
      <div style={{ padding: 16, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>{header}</div>

      <div
        style={{
          padding: 12,
          overflowY: "auto",
          overflowX: "hidden",
          minHeight: 0,
          flex: 1,
        }}
      >
        {children}
      </div>
    </div>
  );
}
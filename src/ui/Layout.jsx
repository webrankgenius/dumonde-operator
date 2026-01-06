// src/ui/Layout.jsx
export function Layout({ sidebar, main }) {
  return (
    <div
      style={{
        height: "100vh",
        minHeight: 0,
        background: "#050B17",
        fontFamily: "system-ui",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "min(1280px, 100%)",
          height: "100vh",
          minHeight: 0,
          display: "grid",
          gridTemplateColumns: "360px 1fr",
          minWidth: 0,
        }}
      >
        {sidebar}
        {main}
      </div>
    </div>
  );
}
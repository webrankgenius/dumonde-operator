import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { OperatorAuthAPI } from "./lib/api";

export default function ProtectedRoute({ children }) {
  const nav = useNavigate();
  const loc = useLocation();
  const [ok, setOk] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;
    OperatorAuthAPI.me()
      .then(() => {
        if (!mounted) return;
        setOk(true);
        setChecking(false);
      })
      .catch(() => {
        if (!mounted) return;
        setOk(false);
        setChecking(false);
        nav("/login", { replace: true, state: { from: loc } });
      });

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (checking) {
    return (
      <div style={{ minHeight: "100vh", background: "#020617", display: "grid", placeItems: "center", color: "rgba(255,255,255,0.75)", fontFamily: "system-ui" }}>
        Se verifică sesiunea...
      </div>
    );
  }

  return ok ? children : null;
}
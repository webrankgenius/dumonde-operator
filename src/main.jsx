// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import App from "./App.jsx"; // UI-ul tău existent de operator (conversații)
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import { useAuth } from "./lib/auth.js";

function Protected({ children }) {
  const { loading, authed } = useAuth();
  if (loading) return null;
  if (!authed) return <Navigate to="/login" replace />;
  return children;
}

function PublicOnly({ children }) {
  const { loading, authed } = useAuth();
  if (loading) return null;
  if (authed) return <Navigate to="/dashboard" replace />;
  return children;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicOnly>
              <Login />
            </PublicOnly>
          }
        />
        <Route
          path="/dashboard"
          element={
            <Protected>
              <Dashboard />
            </Protected>
          }
        />
        <Route
          path="/conversations"
          element={
            <Protected>
              <App />
            </Protected>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
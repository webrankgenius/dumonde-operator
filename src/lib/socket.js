import { io } from "socket.io-client";

export function connectOperatorSocket() {
  const base = import.meta.env.VITE_API_BASE; // http://69.62.113.92:3000
  const path = import.meta.env.VITE_SOCKET_PATH || "/socket.io";
  const token = import.meta.env.VITE_OPERATOR_KEY;

  if (!base) throw new Error("Missing VITE_API_BASE in operator .env");

  return io(`${base}/op`, {
    path,
    transports: ["websocket", "polling"],
    auth: { token }, // optional dacă vrei auth și pe ws
    withCredentials: false,
  });
}
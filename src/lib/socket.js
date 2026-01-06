import { io } from "socket.io-client";

export function connectOperatorSocket() {
  const base = import.meta.env.VITE_SOCKET_URL;          // ex: https://srv873265.hstgr.cloud
  const path = import.meta.env.VITE_SOCKET_PATH || "/socket.io";

  // IMPORTANT: connect to /op namespace
  return io(`${base}/op`, {
    path,
    transports: ["polling", "websocket"],
    upgrade: true,
    withCredentials: false,
    autoConnect: true,
  });
}
// src/hooks/useOperatorSocket.js
import { useEffect, useRef } from "react";
import { connectOperatorSocket } from "../lib/socket";

/**
 * Connects once, listens message:new, and exposes join/leave helpers.
 */
export function useOperatorSocket({ onMessageNew }) {
  const socketRef = useRef(null);

  useEffect(() => {
    const s = connectOperatorSocket();
    socketRef.current = s;

    s.on("connect", () => console.log("[OP] ws connected", s.id));
    s.on("connect_error", (e) => console.log("[OP] ws connect_error", e?.message || e));

    s.on("message:new", (payload) => {
      try {
        onMessageNew?.(payload);
      } catch {}
    });

    return () => {
      try {
        s.close();
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const joinConversation = (conversationId) => {
    const s = socketRef.current;
    if (!s || !conversationId) return;
    s.emit("join:conversation", { conversationId });
  };

  const leaveConversation = (conversationId) => {
    const s = socketRef.current;
    if (!s || !conversationId) return;
    s.emit("leave:conversation", { conversationId });
  };

  return { socketRef, joinConversation, leaveConversation };
}
// src/hooks/useStickyScroll.js
import { useCallback, useEffect, useRef } from "react";

export function useStickyScroll() {
  const listRef = useRef(null);
  const stickToBottomRef = useRef(true);

  const onScroll = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    const threshold = 80; // px from bottom
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    stickToBottomRef.current = distanceFromBottom < threshold;
  }, []);

  const scrollToBottom = useCallback((smooth = false) => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
  }, []);

  const maybeStick = useCallback(() => {
    if (stickToBottomRef.current) scrollToBottom(false);
  }, [scrollToBottom]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  return { listRef, scrollToBottom, maybeStick, stickToBottomRef };
}
// src/utils/download.js
import { fmtTime } from "./format";

export function downloadFile(filename, content, mime = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function buildChatTxt(conv, messages) {
  const header = [
    `Conversation: ${conv?.id || "-"}`,
    `Status: ${conv?.status || "-"}`,
    `Takeover: ${conv?.takeoverMode || "-"}`,
    `Channel: ${conv?.channel || "-"}`,
    `Session: ${conv?.sessionId || "-"}`,
    `Created: ${fmtTime(conv?.createdAt)}`,
    `Last: ${fmtTime(conv?.lastMessageAt)}`,
  ].join("\n");

  const lines = (messages || []).map((m) => `[${fmtTime(m.createdAt)}] ${m.role}: ${m.content}`);
  return `${header}\n\n--- MESSAGES ---\n\n${lines.join("\n\n")}\n`;
}
// src/utils/format.js
export function fmtTime(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return String(iso);
  }
}

export function safeText(x) {
  if (x === null || x === undefined) return "";
  return String(x);
}

export function sortByCreatedAtAsc(arr) {
  const a = Array.isArray(arr) ? arr : [];
  return [...a].sort((x, y) => {
    const tx = new Date(x?.createdAt || 0).getTime();
    const ty = new Date(y?.createdAt || 0).getTime();
    return tx - ty;
  });
}
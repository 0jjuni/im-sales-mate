// Class codes stay attached to the original product ID for returns, costs and registration.
export const fundBaseName = (name) => name.replace(/([)\]])[A-Za-z][A-Za-z-]*$/, "$1");
export const fundGroupKey = (p) => p.type === "펀드" ? `${p.company}:${fundBaseName(p.name)}` : p.id;
export const classLabel = (p) => p.classCode || p.name.match(/[)\]]([A-Za-z][A-Za-z-]*)$/)?.[1] || p.feeClass || "기본";
export const shortName = (p) => p.type === "펀드"
  ? fundBaseName(p.name).replace(/증권.*$/, "").replace(/특별자산.*$/, "") || fundBaseName(p.name)
  : p.name;
export const groupFunds = (products) => {
  const groups = new Map();
  for (const p of products) {
    const key = fundGroupKey(p);
    if (!groups.has(key)) groups.set(key, { ...p, classes: [] });
    groups.get(key).classes.push(p);
  }
  return [...groups.values()];
};
const RECENT_KEY = "salesbridge.wealth.recent";
export const readRecent = () => {
  try { const ids = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); return Array.isArray(ids) ? ids.filter((id) => typeof id === "string").slice(0, 6) : []; }
  catch { return []; }
};
export const rememberProduct = (id) => {
  try { localStorage.setItem(RECENT_KEY, JSON.stringify([id, ...readRecent().filter((x) => x !== id)].slice(0, 6))); }
  catch { /* Viewing remains available when browser storage is unavailable. */ }
};

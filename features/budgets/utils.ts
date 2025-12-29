export function monthKey(date: string) {
  return date.slice(0, 7); // YYYY-MM
}

export function monthLabel(key: string) {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y, m - 1, 1);
  return d.toLocaleDateString("en-CA", { month: "short", year: "numeric" });
}

export function formatMoney(n: number) {
  return n.toLocaleString("en-CA", { style: "currency", currency: "CAD" });
}

export function clampPct(x: number) {
  if (!Number.isFinite(x)) return 0;
  return Math.max(0, Math.min(100, x));
}

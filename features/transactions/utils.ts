import type { FormState, Tx } from "./types";

export function formatMoney(n: number) {
  return n.toLocaleString("en-CA", { style: "currency", currency: "CAD" });
}

export function formatDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" });
}

export function monthKey(date: string) {
  return date.slice(0, 7); // YYYY-MM
}

export function monthLabelFromKey(key: string) {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y, m - 1, 1);
  return d.toLocaleDateString("en-CA", { month: "short", year: "numeric" });
}

export const CATEGORY_CHOICES = ["Groceries", "Dining", "Gas", "Shopping", "Subscriptions", "Income", "Rent", "Other"];
export const ACCOUNT_CHOICES = ["TD Chequing", "TD Visa", "Cash", "Savings"];

export function blankForm(): FormState {
  return {
    date: new Date().toISOString().slice(0, 10),
    type: "expense",
    merchant: "",
    category: "Groceries",
    account: "TD Chequing",
    amount: "",
    note: "",
  };
}

export function txToForm(t: Tx): FormState {
  return {
    date: t.date,
    type: t.amount < 0 ? "expense" : "income",
    merchant: t.merchant === "(No merchant)" ? "" : t.merchant,
    category: t.category,
    account: t.account,
    amount: String(Math.abs(t.amount)),
    note: t.note ?? "",
  };
}

export function formToSignedAmount(type: "expense" | "income", amountStr: string) {
  const parsed = Number(amountStr);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return type === "expense" ? -Math.abs(parsed) : Math.abs(parsed);
}

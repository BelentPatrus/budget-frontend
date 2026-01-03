import type { Tx } from "./types";
import { CreateTx } from "./utils";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080";

function toTx(t: any): Tx {
  return {
    id: String(t.id),
    date: String(t.date),
    description: t.merchant ?? t.description ?? "(No merchant)",
    bucket: t.bucket?.name ?? t.category ?? "(No category)",
    account: t.bankAccount?.name ?? t.account ?? "(No account)",
    amount: Number(t.amount ?? 0),
  };
}

export async function fetchTransactions(): Promise<Tx[]> {
  const res = await fetch(`${API_BASE}/transactions`, {
    credentials: "include",
    cache: "no-store",
  });

  if (res.status === 401) {
    console.warn("Not authenticated");
    return [];
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  console.log("raw /transactions:", data);

  const arr = Array.isArray(data) ? data : [];
  return arr.map(toTx);
}

export async function deleteTransaction(id: string){
  const res = await fetch(`${API_BASE}/transaction/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok){
    const text = await res.text().catch(() => "");
    throw new Error(text || `Failed to delete (HTTP ${res.status})`);
  }
}


export async function addTransaction(transaction: CreateTx){
  const res = await fetch(`${API_BASE}/transaction`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(transaction),
  });
  if (!res.ok){
    const text = await res.text().catch(() => "");
    throw new Error(text || `Failed to ADD (HTTP ${res.status})`);
  }
  const saved = await res.json();
  return saved as Tx;
}

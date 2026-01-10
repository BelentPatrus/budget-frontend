import { BankAccount } from "../accounts/types";
import type { Tx } from "./types";
import { CreateTx } from "./utils";
import type { Bucket } from "@/features/accounts/types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080";

function toTx(t: any): Tx {
  return {
    id: String(t.id),
    date: String(t.date),
    description: t.merchant ?? t.description ?? "No Description",
    bucket: t.bucket?.name ?? t.category ?? "Unallocated",
    account: t.bankAccount?.name ?? t.account ?? "(No account)",
    amount: Number(t.amount ?? 0),
  };
}

// function toBucket(t: any): Bucket {
//   return {
//     name: String(t.name)
//   };
// }

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

export async function deleteTransaction(id: string) {
  const res = await fetch(`${API_BASE}/transaction/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Failed to delete (HTTP ${res.status})`);
  }
}

export async function addTransaction(transaction: CreateTx) {
  const res = await fetch(`${API_BASE}/transaction`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(transaction),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Failed to ADD (HTTP ${res.status})`);
  }
  const saved = await res.json();
  return saved as Tx;
}

function toName(x: any): string {
  if (typeof x === "string") return x.trim();
  if (x && typeof x === "object") return String(x.name ?? "").trim();
  return "";
}

export async function loadBuckets(): Promise<Bucket[]> {
  const res = await fetch(`${API_BASE}/buckets`, {
    credentials: "include",
    cache: "no-store",
  });

  if (res.status === 401) return [];
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Failed (${res.status})`);
  }

  const data = await res.json();

  // ✅ handle backend returning either a single object OR an array
  const arr = Array.isArray(data) ? data : data ? [data] : [];

  return arr
    .map((x: any): Bucket | null => {
      const id = String(x?.id ?? "").trim();
      const name = String(x?.name ?? "").trim();
      const balance = Number(x?.balance ?? 0);
      const bankAccountId = String(x?.bankAccountId ?? "").trim();
      const bankAccount = String(x?.bankAccount ?? "").trim();

      if (!id || !name || !bankAccountId) return null;
      return { id, name, balance, bankAccountId, bankAccount };
    })
    .filter((b): b is Bucket => Boolean(b));
}


export async function loadBankAccounts(): Promise<BankAccount[]> {
  const res = await fetch(`${API_BASE}/bankaccounts`, {
    credentials: "include",
    cache: "no-store",
  });

  if (res.status === 401) return [];
  if (!res.ok)
    throw new Error(
      `Failed (${res.status}): ${await res.text().catch(() => "")}`
    );

  const data = await res.json();
  const arr = Array.isArray(data) ? data : [];
  return arr;
}

export async function uploadTransactions(file: File) {
  const fd = new FormData();
  fd.append("file", file);

  const res = await fetch(`${API_BASE}/transactions/import`, {
    method: "POST",
    credentials: "include",
    body: fd,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Upload failed (HTTP ${res.status})`);
  }

  // backend may return parsed rows or summary
  return res.json();
}

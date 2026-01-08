// features/accounts/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080";

async function readJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchAccounts() {
  const res = await fetch(`${API_BASE}/bankaccounts`, {
    credentials: "include",
  });
  return readJson<any[]>(res);
}

export async function fetchBuckets(accountId: string) {
  const res = await fetch(`${API_BASE}/bankaccount/${accountId}/buckets`, {
    credentials: "include",
  });
  return readJson<any[]>(res);
}

export async function addAccount(payload: any) {
  const res = await fetch(`${API_BASE}/bankaccount`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return readJson<any>(res);
}

export async function addBucket(accountId: string, payload: any) {
  const res = await fetch(`${API_BASE}/bank-accounts/${accountId}/buckets`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return readJson<any>(res);
}

import type { Bucket } from "../universal/types";
// src/features/settings/api.ts

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080";


export async function createBucket(bucket: Bucket): Promise<void> {
 const res = await fetch(`${API_BASE}/bucket`, {
     method: "POST",
     credentials: "include",
     headers: { "Content-Type": "application/json" },
     body: JSON.stringify(bucket),
   });
   if (!res.ok) {
     const text = await res.text().catch(() => "");
     throw new Error(text || `Failed to ADD (HTTP ${res.status})`);
   }
   const saved = await res.json();
   return saved;
 }

export async function deleteBucket(bucket: Bucket): Promise<void> {
  // TODO: implement when backend endpoint exists
  // await fetch(`${API_BASE}/buckets/${encodeURIComponent(name)}`, { method: "DELETE", ... })
  throw new Error("deleteBucket not implemented yet");
}

export async function createBankAccount(name: string): Promise<void> {
  // TODO: implement when backend endpoint exists
  throw new Error("createBankAccount not implemented yet");
}

export async function deleteBankAccount(name: string): Promise<void> {
  // TODO: implement when backend endpoint exists
  throw new Error("deleteBankAccount not implemented yet");
}

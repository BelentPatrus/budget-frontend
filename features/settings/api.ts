// src/features/settings/api.ts
// import { API_BASE } from "@/features/transactions/api"; // or wherever API_BASE lives

export async function createBucket(name: string): Promise<void> {
  // TODO: implement when backend endpoint exists
  // await fetch(`${API_BASE}/buckets`, { method: "POST", ... })
  throw new Error("createBucket not implemented yet");
}

export async function deleteBucket(name: string): Promise<void> {
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

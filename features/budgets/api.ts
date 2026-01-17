import type { BudgetRow } from "./types";
import type { BudgetPeriod } from "./types";
import type { Bucket, CreateBudgetPayload } from "./types";

export function fetchBuckets(): Promise<Bucket[]> {
  return http<Bucket[]>("/buckets"); // adjust path if yours is different
}

export function createBudget(payload: CreateBudgetPayload): Promise<BudgetRow> {
  return http<BudgetRow>("/budget", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"; 
// e.g. NEXT_PUBLIC_API_URL=http://localhost:8080

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
    credentials: "include", // if you use cookies/session
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || `Request failed: ${res.status}`);
  }
  return (await res.json()) as T;
}

export function fetchBudgetPeriods(): Promise<BudgetPeriod[]> {
  return http<BudgetPeriod[]>("/budget-periods");
}

// GET all budget rows (for the current month/user on backend)
export function fetchBudgets(period: number): Promise<BudgetRow[]> {
  return http<BudgetRow[]>(`/budgets/${period}`);
}


// PATCH update actual/planned/category (optional but handy)
export function updateBudget(id: string, patch: Partial<Omit<BudgetRow, "id">>): Promise<BudgetRow> {
  return http<BudgetRow>(`/api/budgets/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

// DELETE (optional)
export function deleteBudget(id: string): Promise<void> {
  return http<void>(`/api/budgets/${encodeURIComponent(id)}`, { method: "DELETE" });
}

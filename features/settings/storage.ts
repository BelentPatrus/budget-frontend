import { loadBuckets, loadBankAccounts } from "@/features/transactions/api";
import type { Bucket } from "../universal/types";

export type SettingsData = {
  buckets: Bucket[];
  bankAccounts: string[];
};

export async function loadSettings(): Promise<SettingsData> {
  if (typeof window === "undefined") {
    return { buckets: [], bankAccounts: [] };
  }

  const [buckets, bankAccounts] = await Promise.all([
    loadBuckets(),
    loadBankAccounts(),
  ]);

  return {
    buckets: dedupeAndSortBuckets(buckets),
    bankAccounts: dedupeAndSortStrings(bankAccounts),
  };
}

/**
 * Deduplicate + sort bank account names
 */
export function dedupeAndSortStrings(items: string[]): string[] {
  return Array.from(
    new Set(items.map((s) => s.trim()).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
}

/**
 * Deduplicate + sort buckets by (bankAccount, name)
 */
export function dedupeAndSortBuckets(items: Bucket[]): Bucket[] {
  const map = new Map<string, Bucket>();

  for (const b of items) {
    const name = b.name.trim();
    const bankAccount = b.bankAccount.trim();
    if (!name || !bankAccount) continue;

    const key = `${bankAccount.toLowerCase()}::${name.toLowerCase()}`;
    if (!map.has(key)) {
      map.set(key, { name, bankAccount });
    }
  }

  return Array.from(map.values()).sort((a, b) => {
    const acc = a.bankAccount.localeCompare(b.bankAccount, undefined, { sensitivity: "base" });
    return acc !== 0
      ? acc
      : a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
  });
}
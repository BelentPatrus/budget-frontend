import { loadBuckets, loadBankAccounts } from "@/features/transactions/api";
import type { Bucket, } from "@/features/accounts/types";
import type { BankAccount } from "@/features/accounts/types";

export type SettingsData = {
  buckets: Bucket[];
  bankAccounts: BankAccount[];
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
    bankAccounts: dedupeAndSortAccounts(bankAccounts),
  };
}

/**
 * Deduplicate + sort bank account names
 */
export function dedupeAndSortAccounts(items: BankAccount[]): BankAccount[] {
  const map = new Map<string, BankAccount>();

  for (const acc of items) {
    const key = acc.name.trim().toLowerCase();
    if (!key) continue;

    // keep first occurrence
    if (!map.has(key)) {
      map.set(key, acc);
    }
  }

  return Array.from(map.values()).sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
  );
}

/**
 * Deduplicate + sort buckets by (bankAccount, name)
 */
/**
 * Deduplicate + sort buckets by (bankAccountId, name)
 * Keeps the FIRST occurrence of a duplicate.
 */
export function dedupeAndSortBuckets(items: Bucket[]): Bucket[] {
  const map = new Map<string, Bucket>();

  for (const b of items) {
    const name = (b.name ?? "").trim();
    const bankAccountId = (b.bankAccountId ?? "").trim();
    if (!name || !bankAccountId) continue;

    const key = `${bankAccountId.toLowerCase()}::${name.toLowerCase()}`;

    if (!map.has(key)) {
      map.set(key, b); // ✅ keep original Bucket object
    }
  }

  return Array.from(map.values()).sort((a, b) => {
    const acc = a.bankAccountId.localeCompare(b.bankAccountId, undefined, { sensitivity: "base" });
    if (acc !== 0) return acc;
    return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
  });
}
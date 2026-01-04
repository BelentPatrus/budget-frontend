import { loadBuckets, loadBankAccounts } from "@/features/transactions/api";

export type SettingsData = {
  buckets: string[];
  bankAccounts: string[];
};

export async function loadSettings(): Promise<SettingsData> {
  // On server render, return empty (or you can throw)
  if (typeof window === "undefined") {
    return { buckets: [], bankAccounts: [] };
  }

  const [buckets, bankAccounts] = await Promise.all([
    loadBuckets(),
    loadBankAccounts(),
  ]);

  return {
    buckets: dedupeAndSort(buckets),
    bankAccounts: dedupeAndSort(bankAccounts),
  };
}

export function dedupeAndSort(items: string[]) {
  return Array.from(new Set(items.map((s) => s.trim()).filter(Boolean))).sort(
    (a, b) => a.localeCompare(b)
  );
}

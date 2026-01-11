"use client";

import { useEffect, useMemo, useState } from "react";
import { addAccount, addBucket, fetchAccounts, fetchBuckets, deleteAccount } from "../api";
import type {
  BankAccount,
  Bucket,
  CreateAccount,
  CreateBucket,
} from "../types";
import { toAccount, toBucket } from "../mappers";

export function useAccountsSummary() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [bucketsByAccount, setBucketsByAccount] = useState<
    Record<string, Bucket[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
  let cancelled = false;

  (async () => {
    if (cancelled) return;
    await loadAccounts();
  })();

  return () => {
    cancelled = true;
  };
}, []);

  const loadAccounts = async () => {
    let cancelled = false;

    try {
      setLoading(true);
      setError(null);

      const raw = await fetchAccounts();
      const accs = (Array.isArray(raw) ? raw : [])
        .map(toAccount)
        .filter((a) => a.id);

      if (cancelled) return;
      setAccounts(accs.filter((a) => a.status === "ACTIVE"));

      const entries = await Promise.all(
        accs.map(async (a) => {
          try {
            const rawBuckets = await fetchBuckets(a.id);
            const buckets = (Array.isArray(rawBuckets) ? rawBuckets : []).map(
              toBucket
            );
            return [a.id, buckets] as const;
          } catch {
            return [a.id, [] as Bucket[]] as const;
          }
        })
      );

      if (!cancelled) setBucketsByAccount(Object.fromEntries(entries));
    } catch (e: any) {
      if (!cancelled) setError(e?.message ?? "Failed to load accounts");
    } finally {
      if (!cancelled) setLoading(false);
    }
  };

  async function createAccount(payload: CreateAccount) {
    const created = toAccount(await addAccount(payload));
    await loadAccounts(); // 🔁 refresh
    if (!created.id) return;
    setAccounts((prev) => [created, ...prev]);
    setBucketsByAccount((prev) => ({ ...prev, [created.id]: [] }));
  }

  async function createBucket(accountId: string, payload: CreateBucket) {
    if (!accountId) return;

    const created = toBucket(
      await addBucket({
        id: "",
        bankAccountId: accountId,
        name: payload.name,
        balance: Number(payload.balance) || 0,
        bankAccount: "",
      })
    );

  

    setBucketsByAccount((prev) => ({
      ...prev,
      [accountId]: created.id
        ? [created, ...(prev[accountId] ?? [])]
        : prev[accountId] ?? [],
    }));
  }

  async function deleteAccountHook(accountId: string) {
    await deleteAccount(accountId);
    await loadAccounts(); // 🔁 refresh
    
  }

  const totalAccountsBalance = useMemo(
    () => accounts.reduce((s, a) => s + (a.balance || 0), 0),
    [accounts]
  );

  return {
    accounts,
    bucketsByAccount,
    loading,
    error,
    totalAccountsBalance,
    createAccount,
    createBucket,
    deleteAccountHook,
  };
}

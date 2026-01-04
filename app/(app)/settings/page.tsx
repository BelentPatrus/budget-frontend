"use client";

import { useEffect, useMemo, useState } from "react";
import { dedupeAndSort, loadSettings, type SettingsData } from "@/features/settings/storage";
import {
  createBucket,
  deleteBucket,
  createBankAccount,
  deleteBankAccount,
} from "@/features/settings/api";

export default function SettingsPage() {
  const [data, setData] = useState<SettingsData>({ buckets: [], bankAccounts: [] });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newBucket, setNewBucket] = useState("");
  const [newBankAccount, setNewBankAccount] = useState("");

  // Load on mount
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        const s = await loadSettings();
        if (alive) setData(s);
      } catch (e: any) {
        console.error(e);
        if (alive) setError(e?.message ?? "Failed to load settings");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const buckets = useMemo(() => data.buckets, [data.buckets]);
  const bankAccounts = useMemo(() => data.bankAccounts, [data.bankAccounts]);

  async function handleAddBucket() {
    const v = newBucket.trim();
    if (!v) return;

    setError(null);
    setBusy(true);

    const prev = data;
    const next: SettingsData = {
      ...data,
      buckets: dedupeAndSort([...data.buckets, v]),
    };

    // optimistic UI
    setData(next);
    setNewBucket("");

    try {
      await createBucket(v); // will be implemented later
    } catch (e: any) {
      console.error(e);
      setData(prev); // revert
      setError(e?.message ?? "Failed to add bucket");
    } finally {
      setBusy(false);
    }
  }

  async function handleRemoveBucket(name: string) {
    setError(null);
    setBusy(true);

    const prev = data;
    const next: SettingsData = {
      ...data,
      buckets: data.buckets.filter((b) => b !== name),
    };

    // optimistic UI
    setData(next);

    try {
      await deleteBucket(name); // will be implemented later
    } catch (e: any) {
      console.error(e);
      setData(prev); // revert
      setError(e?.message ?? "Failed to remove bucket");
    } finally {
      setBusy(false);
    }
  }

  async function handleAddBankAccount() {
    const v = newBankAccount.trim();
    if (!v) return;

    setError(null);
    setBusy(true);

    const prev = data;
    const next: SettingsData = {
      ...data,
      bankAccounts: dedupeAndSort([...data.bankAccounts, v]),
    };

    // optimistic UI
    setData(next);
    setNewBankAccount("");

    try {
      await createBankAccount(v); // will be implemented later
    } catch (e: any) {
      console.error(e);
      setData(prev); // revert
      setError(e?.message ?? "Failed to add bank account");
    } finally {
      setBusy(false);
    }
  }

  async function handleRemoveBankAccount(name: string) {
    setError(null);
    setBusy(true);

    const prev = data;
    const next: SettingsData = {
      ...data,
      bankAccounts: data.bankAccounts.filter((a) => a !== name),
    };

    // optimistic UI
    setData(next);

    try {
      await deleteBankAccount(name); // will be implemented later
    } catch (e: any) {
      console.error(e);
      setData(prev); // revert
      setError(e?.message ?? "Failed to remove bank account");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-600">
          Manage buckets and bank accounts. (CRUD UI is wired; backend endpoints coming next.)
        </p>
      </header>

      {loading && <p className="text-sm text-slate-600">Loading…</p>}
      {error && <p className="text-sm text-rose-700">{error}</p>}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Buckets */}
        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Buckets</h2>
            <p className="text-sm text-slate-600">Used in Transactions and Budgets.</p>
          </div>

          <div className="mt-4 flex gap-2">
            <input
              value={newBucket}
              onChange={(e) => setNewBucket(e.target.value)}
              placeholder="Add a bucket (e.g., Utilities)"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-300 focus:ring-4 focus:ring-slate-100"
              disabled={busy}
            />
            <button
              onClick={handleAddBucket}
              disabled={busy}
              className="shrink-0 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
            >
              Add
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {buckets.map((b) => (
              <Chip key={b} label={b} onRemove={() => handleRemoveBucket(b)} disabled={busy} />
            ))}
            {!loading && buckets.length === 0 && (
              <p className="text-sm text-slate-600">No buckets yet.</p>
            )}
          </div>
        </section>

        {/* Bank Accounts */}
        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Bank Accounts</h2>
            <p className="text-sm text-slate-600">Where the transaction happened (card, cash, chequing).</p>
          </div>

          <div className="mt-4 flex gap-2">
            <input
              value={newBankAccount}
              onChange={(e) => setNewBankAccount(e.target.value)}
              placeholder="Add an account (e.g., RBC Visa)"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-300 focus:ring-4 focus:ring-slate-100"
              disabled={busy}
            />
            <button
              onClick={handleAddBankAccount}
              disabled={busy}
              className="shrink-0 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
            >
              Add
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {bankAccounts.map((a) => (
              <Chip key={a} label={a} onRemove={() => handleRemoveBankAccount(a)} disabled={busy} />
            ))}
            {!loading && bankAccounts.length === 0 && (
              <p className="text-sm text-slate-600">No bank accounts yet.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function Chip(props: { label: string; onRemove: () => void; disabled?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900">
      {props.label}
      <button
        onClick={props.onRemove}
        disabled={props.disabled}
        className="rounded-full px-2 py-1 text-slate-600 hover:bg-slate-100 disabled:opacity-50"
        aria-label={`Remove ${props.label}`}
        title="Remove"
      >
        ✕
      </button>
    </span>
  );
}

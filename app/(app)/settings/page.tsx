"use client";

import { useEffect, useMemo, useState } from "react";
import { DEFAULT_SETTINGS, dedupeAndSort, loadSettings, resetSettings, saveSettings, type SettingsData } from "@/features/settings/storage";

export default function SettingsPage() {
  const [data, setData] = useState<SettingsData>(DEFAULT_SETTINGS);

  // Load on mount
  useEffect(() => {
    setData(loadSettings());
  }, []);

  // Form inputs
  const [newCategory, setNewCategory] = useState("");
  const [newAccount, setNewAccount] = useState("");

  const categories = useMemo(() => data.categories, [data.categories]);
  const accounts = useMemo(() => data.accounts, [data.accounts]);

  function persist(next: SettingsData) {
    const cleaned = {
      categories: dedupeAndSort(next.categories),
      accounts: dedupeAndSort(next.accounts),
    };
    setData(cleaned);
    saveSettings(cleaned);
  }

  function addCategory() {
    const v = newCategory.trim();
    if (!v) return;
    persist({ ...data, categories: [...data.categories, v] });
    setNewCategory("");
  }

  function addAccount() {
    const v = newAccount.trim();
    if (!v) return;
    persist({ ...data, accounts: [...data.accounts, v] });
    setNewAccount("");
  }

  function removeCategory(name: string) {
    persist({ ...data, categories: data.categories.filter((c) => c !== name) });
  }

  function removeAccount(name: string) {
    persist({ ...data, accounts: data.accounts.filter((a) => a !== name) });
  }

  function doReset() {
    const ok = confirm("Reset categories & accounts back to defaults?");
    if (!ok) return;
    resetSettings();
    setData(loadSettings());
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-600">Manage categories and accounts. Saved locally for now.</p>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Categories */}
        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Categories</h2>
              <p className="text-sm text-slate-600">Used in Transactions and Budgets.</p>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Add a category (e.g., Utilities)"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-300 focus:ring-4 focus:ring-slate-100"
            />
            <button
              onClick={addCategory}
              className="shrink-0 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Add
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((c) => (
              <Chip key={c} label={c} onRemove={() => removeCategory(c)} />
            ))}
            {categories.length === 0 && <p className="text-sm text-slate-600">No categories yet.</p>}
          </div>

          <p className="mt-4 text-xs text-slate-500">
            Tip: Keep categories consistent (e.g., don’t have both “Gas” and “Fuel” unless you really want both).
          </p>
        </section>

        {/* Accounts */}
        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Accounts</h2>
            <p className="text-sm text-slate-600">Where the transaction happened (card, cash, chequing).</p>
          </div>

          <div className="mt-4 flex gap-2">
            <input
              value={newAccount}
              onChange={(e) => setNewAccount(e.target.value)}
              placeholder="Add an account (e.g., RBC Visa)"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-300 focus:ring-4 focus:ring-slate-100"
            />
            <button
              onClick={addAccount}
              className="shrink-0 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Add
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {accounts.map((a) => (
              <Chip key={a} label={a} onRemove={() => removeAccount(a)} />
            ))}
            {accounts.length === 0 && <p className="text-sm text-slate-600">No accounts yet.</p>}
          </div>
        </section>
      </div>

      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-base font-semibold text-slate-900">Danger zone</h2>
        <p className="text-sm text-slate-600">Reset to default categories/accounts.</p>

        <button
          onClick={doReset}
          className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-rose-700 hover:bg-rose-50"
        >
          Reset to defaults
        </button>
      </section>
    </div>
  );
}

function Chip(props: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900">
      {props.label}
      <button
        onClick={props.onRemove}
        className="rounded-full px-2 py-1 text-slate-600 hover:bg-slate-100"
        aria-label={`Remove ${props.label}`}
        title="Remove"
      >
        ✕
      </button>
    </span>
  );
}

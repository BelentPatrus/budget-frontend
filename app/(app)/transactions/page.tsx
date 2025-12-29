"use client";

import { useMemo, useState, useEffect } from "react";
import { TransactionsFilters } from "@/features/transactions/TransactionsFilters";
import { TransactionsTable } from "@/features/transactions/TransactionsTable";
import { TransactionModal } from "@/features/transactions/TransactionModal";
import type { Filters, ModalMode, Tx } from "@/features/transactions/types";
import { seedTransactions } from "@/features/transactions/seed";
import { blankForm, formToSignedAmount, monthKey, txToForm, formatMoney } from "@/features/transactions/utils";
import { loadSettings } from "@/features/settings/storage";
import type { SettingsData } from "@/features/settings/storage";



export default function TransactionsPage() {
  const [txs, setTxs] = useState<Tx[]>(seedTransactions);

  const [filters, setFilters] = useState<Filters>({
    q: "",
    category: "All",
    account: "All",
    month: "All",
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<ModalMode>("add");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(blankForm());
  const [settings, setSettings] = useState<SettingsData>({ categories: [], accounts: [] });

  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  const categories = useMemo(() => {
    const set = new Set(txs.map((t) => t.category));
    return ["All", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [txs]);

  const accounts = useMemo(() => {
    const set = new Set(txs.map((t) => t.account));
    return ["All", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [txs]);

  const months = useMemo(() => {
    const set = new Set(txs.map((t) => monthKey(t.date)));
    const arr = Array.from(set).sort((a, b) => b.localeCompare(a));
    return ["All", ...arr];
  }, [txs]);

  const filtered = useMemo(() => {
    const query = filters.q.trim().toLowerCase();

    return txs
      .filter((t) => (filters.category === "All" ? true : t.category === filters.category))
      .filter((t) => (filters.account === "All" ? true : t.account === filters.account))
      .filter((t) => (filters.month === "All" ? true : monthKey(t.date) === filters.month))
      .filter((t) => {
        if (!query) return true;
        return (
          t.merchant.toLowerCase().includes(query) ||
          t.category.toLowerCase().includes(query) ||
          t.account.toLowerCase().includes(query) ||
          (t.note ?? "").toLowerCase().includes(query) ||
          t.date.includes(query)
        );
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [txs, filters]);

  const summary = useMemo(() => {
    const income = filtered.reduce((s, t) => s + (t.amount > 0 ? t.amount : 0), 0);
    const expenses = filtered.reduce((s, t) => s + (t.amount < 0 ? -t.amount : 0), 0);
    const net = income - expenses;
    return { income, expenses, net };
  }, [filtered]);

  function openAdd() {
    setMode("add");
    setEditingId(null);
    setForm(blankForm());
    setModalOpen(true);
  }

  function openEdit(t: Tx) {
    setMode("edit");
    setEditingId(t.id);
    setForm(txToForm(t));
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
  }

  function resetFilters() {
    setFilters({ q: "", category: "All", account: "All", month: "All" });
  }

  function onSave(e: React.FormEvent) {
    e.preventDefault();

    const signed = formToSignedAmount(form.type, form.amount);
    if (signed === null) {
      alert("Enter a valid amount greater than 0.");
      return;
    }

    const merchant = form.merchant.trim() || "(No merchant)";
    const note = form.note.trim() || undefined;

    if (mode === "add") {
      const newTx: Tx = {
        id: crypto.randomUUID(),
        date: form.date,
        merchant,
        category: form.category,
        account: form.account,
        amount: signed,
        note,
      };
      setTxs((prev) => [newTx, ...prev]);
      setModalOpen(false);
      return;
    }

    if (!editingId) return;

    setTxs((prev) =>
      prev.map((t) =>
        t.id === editingId
          ? { ...t, date: form.date, merchant, category: form.category, account: form.account, amount: signed, note }
          : t
      )
    );
    setModalOpen(false);
  }

  function onDelete(t: Tx) {
    const ok = confirm(`Delete transaction?\n\n${t.merchant} • ${formatMoney(t.amount)} • ${t.date}`);
    if (!ok) return;
    setTxs((prev) => prev.filter((x) => x.id !== t.id));
  }



  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Transactions</h1>
          <p className="text-sm text-slate-600">Now refactored into components (easier to maintain).</p>
        </div>

        <button
          onClick={openAdd}
          className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200"
        >
          + Add transaction
        </button>
      </header>

      <TransactionsFilters
        filters={filters}
        months={months}
        categories={categories}
        accounts={accounts}
        summary={summary}
        onChange={setFilters}
        onReset={resetFilters}
      />

      <TransactionsTable rows={filtered} onEdit={openEdit} onDelete={onDelete} />

      <TransactionModal
        open={modalOpen}
        mode={mode}
        form={form}
        categories={settings.categories.length ? settings.categories : categories.filter((c) => c !== "All")}
        accounts={settings.accounts.length ? settings.accounts : accounts.filter((a) => a !== "All")}
        onChange={setForm}
        onClose={closeModal}
        onSave={onSave}
      />
    </div>
  );
}

"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { TransactionsFilters } from "@/features/transactions/TransactionsFilters";
import { TransactionsTable } from "@/features/transactions/TransactionsTable";
import { ImportReviewModal } from "@/features/transactions/ImportReviewModal";
import { TransactionModal } from "@/features/transactions/TransactionModal";
import type { Filters, ModalMode, Tx } from "@/features/transactions/types";
import {
  blankForm,
  formToSignedAmount,
  monthKey,
  txToForm,
  formatMoney,
  type CreateTx,
} from "@/features/transactions/utils";
import { loadSettings } from "@/features/settings/storage";
import type { SettingsData } from "@/features/settings/storage";
import {
  fetchTransactions,
  deleteTransaction,
  addTransaction,
  uploadTransactions,
} from "@/features/transactions/api";

export default function TransactionsPage() {
  type ImportPreviewTx = { date: string; description: string; amount: number };
  const [txs, setTxs] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<Filters>({
    q: "",
    description: "",
    bucket: "All",
    account: "All",
    month: "All",
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<ModalMode>("add");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(blankForm());

  const [settings, setSettings] = useState<SettingsData>({
    buckets: [],
    bankAccounts: [],
  });

  // Upload state + hidden input
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  const [importOpen, setImportOpen] = useState(false);
  const [importPreview, setImportPreview] = useState<ImportPreviewTx[]>([]);

  // initial load
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const [data, bucketSettings] = await Promise.all([
          fetchTransactions(),
          loadSettings(),
        ]);

        if (!alive) return;

        setTxs(data);
        setSettings(bucketSettings);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message ?? "Failed to load transactions");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  // dropdown data
  const categories = useMemo(() => {
    const set = new Set(txs.map((t) => t.bucket));
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

  // filtered list
  const filtered = useMemo(() => {
    const query = filters.q.trim().toLowerCase();

    return txs
      .filter((t) => (filters.bucket === "All" ? true : t.bucket === filters.bucket))
      .filter((t) => (filters.account === "All" ? true : t.account === filters.account))
      .filter((t) => (filters.month === "All" ? true : monthKey(t.date) === filters.month))
      .filter((t) => {
        if (!query) return true;
        return (
          t.description.toLowerCase().includes(query) ||
          t.bucket.toLowerCase().includes(query) ||
          t.account.toLowerCase().includes(query) ||
          t.date.includes(query)
        );
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [txs, filters]);

  // summary cards
  const summary = useMemo(() => {
    const income = filtered.reduce((s, t) => s + (t.amount > 0 ? t.amount : 0), 0);
    const expenses = filtered.reduce((s, t) => s + (t.amount < 0 ? -t.amount : 0), 0);
    const net = income - expenses;
    return { income, expenses, net };
  }, [filtered]);

  // modal helpers
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
    setFilters({ q: "", description: "", bucket: "All", account: "All", month: "All" });
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();

    const signed = formToSignedAmount(form.type, form.amount);
    if (signed === null) {
      alert("Enter a valid amount greater than 0.");
      return;
    }

    if (mode === "add") {
      const payload: CreateTx = {
        id: "",
        date: form.date,
        description: form.description,
        bucket: form.bucket,
        account: form.account,
        amount: signed,
        incomeOrExpense: form.type,
      };

      try {
        const result = await addTransaction(payload);

        const newTx: Tx = {
          id: result.id,
          date: form.date,
          description: form.description,
          bucket: form.bucket,
          account: form.account,
          amount: signed,
        };

        setTxs((prev) => [newTx, ...prev]);
        setModalOpen(false);
        return;
      } catch (e: any) {
        alert(e?.message ?? "Failed to add transaction");
        return;
      }
    }

    if (!editingId) return;

    // TODO: call backend update endpoint when you add it
    setTxs((prev) =>
      prev.map((t) =>
        t.id === editingId
          ? {
            ...t,
            date: form.date,
            description: form.description,
            bucket: form.bucket,
            account: form.account,
            amount: signed,
          }
          : t
      )
    );
    setModalOpen(false);
  }

  async function onDelete(t: Tx) {
    const ok = confirm(`Delete transaction?\n\n${t.description} • ${formatMoney(t.amount)} • ${t.date}`);
    if (!ok) return;

    try {
      await deleteTransaction(t.id);
      setTxs((prev) => prev.filter((x) => x.id !== t.id));
    } catch (e: any) {
      alert(e?.message ?? "Failed to delete transaction");
    }
  }

  // -------- Upload handlers --------

  async function commitImportedRow(row: {
    date: string;
    description: string;
    bucket: string;
    account: string;
    amount: number;
  }) {

    const payload: CreateTx = {
        id: "",
        date: row.date,
        description: row.description,
        bucket: row.bucket,
        account: row.account,
        amount: row.amount,
        incomeOrExpense: row.amount >= 0 ? "INCOME" : "EXPENSE",
      };


    

    // OPTION A (fastest): reuse your existing addTransaction endpoint
    // Assumes your backend accepts bucket/account by NAME (like you were doing Default bucketName)
    await addTransaction(payload);

    // then refresh list if you want:
    // const fresh = await fetchTransactions(...)
    // setTxs(fresh)
  }



  function onUploadClick() {
    fileInputRef.current?.click();
  }

  async function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // allow uploading same file again
    e.target.value = "";

    try {
      setUploading(true);

      // calls your api.ts function
      const rows = await uploadTransactions(file);
      setImportPreview(rows);
      setImportOpen(true);

      // simplest behavior: refresh list from DB
      const refreshed = await fetchTransactions();
      setTxs(refreshed);

      alert("Upload complete.");
    } catch (err: any) {
      alert(err?.message ?? "Failed to upload transactions");
    } finally {
      setUploading(false);
    }
  }
  // --------------------------------

  if (loading) return <div className="p-6">Loading transactions…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      {/* Hidden file input for Upload button */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xls,.xlsx"
        className="hidden"
        onChange={onFileSelected}
      />

      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Transactions</h1>
          <p className="text-sm text-slate-600">Now refactored into components (easier to maintain).</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={onUploadClick}
            disabled={uploading}
            className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {uploading ? "Uploading…" : "Upload transactions"}
          </button>

          <button
            type="button"
            onClick={openAdd}
            className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200"
          >
            + Add transaction
          </button>
        </div>
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
        categories={settings.buckets.length ? settings.buckets : categories.filter((c) => c !== "All")}
        accounts={settings.bankAccounts.length ? settings.bankAccounts : accounts.filter((a) => a !== "All")}
        onChange={setForm}
        onClose={closeModal}
        onSave={onSave}
      />

      <ImportReviewModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        preview={importPreview}
        buckets={settings.buckets}
        accounts={accounts}
        onCommitRow={commitImportedRow}
      />
    </div>
  );
}

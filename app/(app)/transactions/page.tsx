"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { TransactionsFilters } from "@/features/transactions/TransactionsFilters";
import { TransactionsTable } from "@/features/transactions/TransactionsTable";
import { ImportReviewModal } from "@/features/transactions/ImportReviewModal";

import { TransactionModalV2, type TxModalSubmit, type TxModalValue } from "@/features/transactions/TransactionModalV2";
import { useTxModal } from "@/features/transactions/UseTxModal";

import type { Filters, Tx } from "@/features/transactions/types";
import { monthKey, formatMoney, type CreateTx } from "@/features/transactions/utils";

import { loadSettings } from "@/features/settings/storage";
import type { SettingsData } from "@/features/settings/storage";

import { fetchTransactions, deleteTransaction, addTransaction, uploadTransactions } from "@/features/transactions/api";

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

  const [settings, setSettings] = useState<SettingsData>({
    buckets: [],
    bankAccounts: [], // must be BankAccount[]
  });

  // Upload state + hidden input
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importPreview, setImportPreview] = useState<ImportPreviewTx[]>([]);

  // Unified modal manager
  const txModal = useTxModal();

  // ---------------- initial load ----------------
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const [data, settingsData] = await Promise.all([fetchTransactions(), loadSettings()]);

        if (!alive) return;

        setTxs(data);
        setSettings(settingsData);
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
  // ------------------------------------------------

  // dropdown data for filters (strings)
  const bucketNames = useMemo(() => settings.buckets.map((b) => b.name), [settings.buckets]);

  const categories = useMemo(() => {
    const set = new Set(txs.map((t) => t.bucket));
    return ["All", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [txs]);

  const accountNames = useMemo(() => {
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
    return { income, expenses, net: income - expenses };
  }, [filtered]);

  function resetFilters() {
    setFilters({ q: "", description: "", bucket: "All", account: "All", month: "All" });
  }

  // ---------------- CRUD ----------------

  function openEdit(t: Tx) {
    // If you later store transfer metadata, you can open TRANSFER edit too.
    // For now, treat edits as EXPENSE/INCOME based on sign.
    const kind = t.amount >= 0 ? "INCOME" : "EXPENSE";

    // map Tx -> modal value (string based fields)
    const value: TxModalValue = {
      mode: "edit",
      editingId: t.id,
      kind,
      date: t.date,
      description: t.description ?? "",
      amount: String(Math.abs(t.amount)),
      // Your Tx currently stores account/bucket as NAMES not ids.
      // We can’t reliably map names -> ids unless you have that mapping.
      // For now we leave accountId/bucketId empty on edit unless you add mapping.
    };

    txModal.openEdit({
      editingId: t.id,
      kind: value.kind,
      date: value.date,
      description: value.description,
      amount: value.amount,
      accountId: undefined,
      bucketId: null,
    });
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

  /**
   * Unified submit from ONE modal.
   *
   * IMPORTANT:
   * Your backend CreateTx currently uses account/bucket by NAME (strings).
   * This modal works with ids internally, so we map id -> name using settings.bankAccounts and settings.buckets.
   */
  async function handleSubmitUnified(payload: TxModalSubmit) {
    const accountById = new Map(settings.bankAccounts.map((a) => [String(a.id), a]));
  const bucketById  = new Map(settings.buckets.map((b) => [String(b.id), b]));
    console.log("Bucket by ACCID map:", accountById);
    console.log("Account by ID map:", payload);
    // Helper: add + refresh locally
    async function createOne(txPayload: CreateTx) {
      const result = await addTransaction(txPayload);
      const newTx: Tx = {
        id: result.id,
        date: txPayload.date,
        description: txPayload.description,
        bucket: txPayload.bucket,
        account: txPayload.account,
        amount: txPayload.amount,
      };
      setTxs((prev) => [newTx, ...prev]);
    }

    // INCOME
    if (payload.kind === "INCOME") {
      const acc = accountById.get(payload.accountId);
      console.log("Selected account for INCOME:", acc);
      if (!acc) throw new Error("Selected account not found.");

      await createOne({
        id: "",
        date: payload.date,
        description: payload.description ?? "",
        bucket: payload.bucketId == "UNALLOCATED" ? "-1" : payload.bucketId,
        account: acc.name,
        amount: payload.amount, // positive
        incomeOrExpense: "INCOME",
      });
      return;
    }

    // EXPENSE
    if (payload.kind === "EXPENSE") {
      const acc = accountById.get(payload.accountId);
      if (!acc) throw new Error("Selected account not found.");

      await createOne({
        id: "",
        date: payload.date,
        description: payload.description ?? "",
        bucket: payload.bucketId == "UNALLOCATED" ? "-1" : payload.bucketId,
        account: acc.name,
        amount: -Math.abs(payload.amount), // store negative
        incomeOrExpense: "EXPENSE",
      });
      return;
    }

    // TRANSFER (MVP)
    // For now, record transfer as TWO transactions:
    // - From account: negative
    // - To account: positive
    // Bucket impact is NOT persisted yet; you’ll handle that once you add bucket allocation records.
    if (payload.kind === "TRANSFER") {
      const from = accountById.get(payload.fromAccountId);
      const to = accountById.get(payload.toAccountId);
      if (!from || !to) throw new Error("Selected accounts not found.");

      const desc = payload.description?.trim() || `Transfer: ${from.name} → ${to.name}`;

      await createOne({
        id: "",
        date: payload.date,
        description: desc,
        bucket: "Transfer",
        account: from.name,
        amount: -Math.abs(payload.amount),
        incomeOrExpense: "TRANSFER",
      });

      await createOne({
        id: "",
        date: payload.date,
        description: desc,
        bucket: "Transfer",
        account: to.name,
        amount: Math.abs(payload.amount),
        incomeOrExpense: "TRANSFER",
      });

      return;
    }
  }

  // ---------------- Upload handlers ----------------

  async function commitImportedRow(row: { date: string; description: string; bucket: string; account: string; amount: number }) {
    const payload: CreateTx = {
      id: "",
      date: row.date,
      description: row.description,
      bucket: row.bucket,
      account: row.account,
      amount: row.amount,
      incomeOrExpense: row.amount >= 0 ? "INCOME" : "EXPENSE",
    };

    await addTransaction(payload);
  }

  function onUploadClick() {
    fileInputRef.current?.click();
  }

  async function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = "";

    try {
      setUploading(true);

      const rows = await uploadTransactions(file);
      setImportPreview(rows);
      setImportOpen(true);

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

  const modalValue: TxModalValue = txModal.state.open
    ? txModal.state
    : {
      mode: "add",
      kind: "EXPENSE",
      date: "",
      description: "",
      amount: "",
    };

  return (
    <div className="space-y-6">
      {/* Hidden file input for Upload button */}
      <input ref={fileInputRef} type="file" accept=".csv,.xls,.xlsx" className="hidden" onChange={onFileSelected} />

      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Transactions</h1>
          <p className="text-sm text-slate-600">Income, Expense, and Transfers in one modal.</p>
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
            onClick={() => txModal.openAdd("EXPENSE")} // default tab
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
        accounts={accountNames}
        summary={summary}
        onChange={setFilters}
        onReset={resetFilters}
      />

      <TransactionsTable rows={filtered} onEdit={openEdit} onDelete={onDelete} />

      {/* One unified modal */}
      <TransactionModalV2
        open={txModal.state.open}
        value={modalValue}
        bankAccounts={settings.bankAccounts}
        buckets={settings.buckets}
        onClose={txModal.close}
        onChange={(next) => txModal.patch(next)}
        onSubmit={async (payload) => {
          try {
            console.log("Submitting payload:", payload);
            await handleSubmitUnified(payload);
            txModal.close();
          } catch (e: any) {
            alert(e?.message ?? "Failed to save transaction");
          }
        }}
      />

      <ImportReviewModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        preview={importPreview}
        buckets={bucketNames}
        accounts={accountNames}
        onCommitRow={commitImportedRow}
      />
    </div>
  );
}

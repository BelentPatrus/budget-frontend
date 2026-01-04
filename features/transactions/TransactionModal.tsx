"use client";

import type { FormState, ModalMode } from "./types";

export function TransactionModal(props: {
  open: boolean;
  mode: ModalMode;
  form: FormState;
  categories: string[];
  accounts: string[];
  onChange: (next: FormState) => void;
  onClose: () => void;
  onSave: (e: React.FormEvent) => void;
}) {
  const { open, mode, form, categories, accounts, onChange, onClose, onSave } = props;
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-lg ring-1 ring-slate-200">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {mode === "add" ? "Add transaction" : "Edit transaction"}
            </h2>
          </div>
          <button onClick={onClose} className="rounded-lg px-2 py-1 text-slate-600 hover:bg-slate-100" aria-label="Close">
            ✕
          </button>
        </div>

        <form onSubmit={onSave} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => onChange({ ...form, date: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-300 focus:ring-4 focus:ring-slate-100"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Type</label>
              <div className="mt-1 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onChange({ ...form, type: "expense" })}
                  className={`rounded-xl border px-4 py-3 text-sm font-semibold ${form.type === "expense"
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
                    }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => onChange({ ...form, type: "income" })}
                  className={`rounded-xl border px-4 py-3 text-sm font-semibold ${form.type === "income"
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
                    }`}
                >
                  Income
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Description</label>
            <input
              value={form.description}
              onChange={(e) => onChange({ ...form, description: e.target.value })}
              placeholder="e.g., Loblaws, Shell, Paycheque..."
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-300 focus:ring-4 focus:ring-slate-100"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">Bucket</label>
              <select
                value={form.bucket}
                onChange={(e) => onChange({ ...form, bucket: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-300 focus:ring-4 focus:ring-slate-100"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Account</label>
              <select
                value={form.account}
                onChange={(e) => onChange({ ...form, account: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-300 focus:ring-4 focus:ring-slate-100"
              >
                {accounts.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">Amount</label>
              <input
                value={form.amount}
                onChange={(e) => onChange({ ...form, amount: e.target.value })}
                inputMode="decimal"
                placeholder="e.g., 45.99"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-300 focus:ring-4 focus:ring-slate-100"
                required
              />
              <p className="mt-1 text-xs text-slate-500">
                Stored as {form.type === "expense" ? "negative (expense)" : "positive (income)"}.
              </p>
            </div>
          </div>

          <div className="mt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button type="submit" className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800">
              {mode === "add" ? "Add" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

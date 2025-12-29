"use client";

import type { BudgetModalMode } from "./types";
import { monthLabel } from "./utils";

export function BudgetModal(props: {
  open: boolean;
  mode: BudgetModalMode;
  month: string;
  categories: string[];
  category: string;
  limit: string;
  onChangeCategory: (c: string) => void;
  onChangeLimit: (v: string) => void;
  onClose: () => void;
  onSave: (e: React.FormEvent) => void;
}) {
  const { open, mode, month, categories, category, limit, onChangeCategory, onChangeLimit, onClose, onSave } = props;
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-lg ring-1 ring-slate-200">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{mode === "add" ? "Add budget" : "Edit budget"}</h2>
            <p className="text-sm text-slate-600">{monthLabel(month)} • Budget per category</p>
          </div>
          <button onClick={onClose} className="rounded-lg px-2 py-1 text-slate-600 hover:bg-slate-100" aria-label="Close">
            ✕
          </button>
        </div>

        <form onSubmit={onSave} className="mt-5 space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Category</label>
            <select
              value={category}
              onChange={(e) => onChangeCategory(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-300 focus:ring-4 focus:ring-slate-100"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Monthly limit</label>
            <input
              value={limit}
              onChange={(e) => onChangeLimit(e.target.value)}
              inputMode="decimal"
              placeholder="e.g., 300"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-300 focus:ring-4 focus:ring-slate-100"
            />
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

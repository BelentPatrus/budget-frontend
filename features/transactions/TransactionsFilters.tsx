"use client";

import type { Filters } from "./types";
import { formatMoney, monthLabelFromKey } from "./utils";

export function TransactionsFilters(props: {
  filters: Filters;
  months: string[]; // ["All", "YYYY-MM"...]
  categories: string[]; // ["All", ...]
  accounts: string[]; // ["All", ...]
  summary: { income: number; expenses: number; net: number };
  onChange: (next: Filters) => void;
  onReset: () => void;
}) {
  const { filters, months, categories, accounts, summary, onChange, onReset } = props;

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <div className="md:col-span-2">
          <label className="text-sm font-medium text-slate-700">Search</label>
          <input
            value={filters.q}
            onChange={(e) => onChange({ ...filters, q: e.target.value })}
            placeholder="Merchant, category, account, date..."
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-300 focus:ring-4 focus:ring-slate-100"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Month</label>
          <select
            value={filters.month}
            onChange={(e) => onChange({ ...filters, month: e.target.value })}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-300 focus:ring-4 focus:ring-slate-100"
          >
            {months.map((m) => (
              <option key={m} value={m}>
                {m === "All" ? "All" : monthLabelFromKey(m)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Category</label>
          <select
            value={filters.category}
            onChange={(e) => onChange({ ...filters, category: e.target.value })}
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
          <label className="text-sm font-medium text-slate-700">Account</label>
          <select
            value={filters.account}
            onChange={(e) => onChange({ ...filters, account: e.target.value })}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-300 focus:ring-4 focus:ring-slate-100"
          >
            {accounts.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <MiniStat label="Income" value={formatMoney(summary.income)} />
        <MiniStat label="Expenses" value={formatMoney(summary.expenses)} />
        <MiniStat label="Net" value={formatMoney(summary.net)} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={onReset}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
        >
          Reset filters
        </button>
      </div>
    </section>
  );
}

function MiniStat(props: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
      <p className="text-xs font-medium text-slate-600">{props.label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-900">{props.value}</p>
    </div>
  );
}

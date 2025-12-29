"use client";

import { monthLabel } from "./utils";

export function BudgetsHeader(props: {
  months: string[];
  selectedMonth: string;
  onMonthChange: (m: string) => void;
  onAddBudget: () => void;
}) {
  const { months, selectedMonth, onMonthChange, onAddBudget } = props;

  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Budgets</h1>
        <p className="text-sm text-slate-600">Set monthly limits and track spending by category.</p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="min-w-[180px]">
          <label className="text-sm font-medium text-slate-700">Month</label>
          <select
            value={selectedMonth}
            onChange={(e) => onMonthChange(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-300 focus:ring-4 focus:ring-slate-100"
          >
            {months.map((m) => (
              <option key={m} value={m}>
                {monthLabel(m)}
              </option>
            ))}
          </select>

        </div>
        <button
          onClick={onAddBudget}
          className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
        >
          + Add budget
        </button>
      </div>
    </header>
  );
}

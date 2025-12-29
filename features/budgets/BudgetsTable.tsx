"use client";

import type { Budget } from "./types";
import { clampPct, formatMoney, monthLabel } from "./utils";

export type BudgetRow = {
  category: string;
  spent: number;
  budget: number;
  remaining: number;
  pct: number;
  over: number;
  hasBudget: boolean;
};

export function BudgetsTable(props: {
  month: string;
  rows: BudgetRow[];
  budgetByCategory: Map<string, Budget>;
  onSetBudget: (category: string) => void;
  onEdit: (b: Budget) => void;
  onDelete: (b: Budget) => void;
}) {
  const { month, rows, budgetByCategory, onSetBudget, onEdit, onDelete } = props;

  return (
    <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <p className="text-sm font-medium text-slate-700">
          {monthLabel(month)} • {rows.length} categories
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Spent</th>
              <th className="px-4 py-3 font-medium">Budget</th>
              <th className="px-4 py-3 font-medium">Remaining</th>
              <th className="px-4 py-3 font-medium">Progress</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {rows.map((r) => {
              const budgetObj = budgetByCategory.get(r.category);
              const showOver = r.over > 0;
              const pct = clampPct(r.pct);

              return (
                <tr key={r.category} className="bg-white">
                  <td className="px-4 py-3 font-medium text-slate-900">{r.category}</td>
                  <td className="px-4 py-3 text-slate-700">{formatMoney(r.spent)}</td>
                  <td className="px-4 py-3 text-slate-700">
                    {r.hasBudget ? formatMoney(r.budget) : <span className="text-slate-400">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    {r.hasBudget ? (
                      <span className={showOver ? "font-semibold text-rose-700" : "text-slate-700"}>
                        {showOver ? `-${formatMoney(r.over)}` : formatMoney(r.remaining)}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {r.hasBudget ? (
                      <div className="space-y-1">
                        <div className="h-2 w-full rounded-full bg-slate-100">
                          <div className="h-2 rounded-full bg-slate-900" style={{ width: `${pct}%` }} />
                        </div>
                        <div className="text-xs text-slate-600">{Math.round(pct)}%</div>
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {budgetObj ? (
                        <>
                          <button
                            onClick={() => onEdit(budgetObj)}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => onDelete(budgetObj)}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50"
                          >
                            Delete
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => onSetBudget(r.category)}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
                        >
                          Set budget
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}

            {rows.length === 0 && (
              <tr>
                <td className="px-4 py-10 text-center text-slate-600" colSpan={6}>
                  No categories yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

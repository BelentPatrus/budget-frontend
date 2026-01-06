"use client";

import type { Budget } from "./types";
import { clampPct, formatMoney, monthLabel } from "./utils";

export type BudgetRow = {
  category: string;

  // actuals
  spent: number;

  // budgets
  plannedBudget: number; // plannedIncome * percent OR fixed monthly amount
  availableBudget: number; // incomeReceivedToDate * percent (or plannedBudget if no pacing)

  // derived (generally computed from availableBudget)
  remainingToDate: number; // max(availableBudget - spent, 0) for display
  overToDate: number; // max(spent - availableBudget, 0)

  // progress (percents 0..100)
  pctToDate: number; // (spent / availableBudget) * 100  (not used in table anymore)
  pctPlan: number; // (spent / plannedBudget) * 100      (not used in table anymore)

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
        <table className="w-full table-fixed text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="w-[180px] px-4 py-3 font-medium">Category</th>
              <th className="w-[120px] px-4 py-3 font-medium">Planned</th>
              <th className="w-[160px] px-4 py-3 font-medium">Available</th>
              <th className="w-[120px] px-4 py-3 font-medium">Spent</th>
              <th className="w-[170px] px-4 py-3 font-medium">Remaining</th>
              <th className="w-[220px] px-4 py-3 font-medium">Plan unlocked</th>
              <th className="w-[160px] px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {rows.map((r) => {
              const budgetObj = budgetByCategory.get(r.category);

              const showOver = r.hasBudget && r.overToDate > 0;

              // % unlocked = available / planned
              const hasPlan = r.hasBudget && r.plannedBudget > 0;
              const unlockedPct = hasPlan ? clampPct((r.availableBudget / r.plannedBudget) * 100) : 0;

              return (
                <tr key={r.category} className="bg-white">
                  <td className="px-4 py-3 font-medium text-slate-900">{r.category}</td>

                  {/* Planned */}
                  <td className="px-4 py-3 text-slate-700 tabular-nums">
                    {r.hasBudget ? formatMoney(r.plannedBudget) : <span className="text-slate-400">—</span>}
                  </td>

                  {/* Available to-date */}
                  <td className="px-4 py-3 text-slate-700 tabular-nums">
                    {r.hasBudget ? formatMoney(r.availableBudget) : <span className="text-slate-400">—</span>}
                  </td>

                  {/* Spent */}
                  <td className="px-4 py-3 text-slate-700 tabular-nums">{formatMoney(r.spent)}</td>

                  {/* Remaining to-date */}
                  <td className="px-4 py-3 tabular-nums">
                    {r.hasBudget ? (
                      <span className={showOver ? "font-semibold text-rose-700" : "text-slate-700"}>
                        {showOver ? `-${formatMoney(r.overToDate)}` : formatMoney(r.remainingToDate)}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  {/* Plan unlocked */}
                  <td className="px-4 py-3">
                    {r.hasBudget && r.plannedBudget > 0 ? (
                      <div className="space-y-1">
                        <div className="h-2 w-full rounded-full bg-slate-100">
                          <div className="h-2 rounded-full bg-slate-900" style={{ width: `${unlockedPct}%` }} />
                        </div>
                        <div className="text-xs text-slate-600">{Math.round(unlockedPct)}% of plan</div>
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  {/* Actions */}
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
                <td className="px-4 py-10 text-center text-slate-600" colSpan={7}>
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

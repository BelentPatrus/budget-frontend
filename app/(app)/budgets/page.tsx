"use client";

import { useMemo, useState } from "react";
import type { Budget, BudgetModalMode, Tx } from "@/features/budgets/types";
import { seedBudgets, seedTxs } from "@/features/budgets/seed";
import { clampPct, monthKey } from "@/features/budgets/utils";
import { BudgetsHeader } from "@/features/budgets/BudgetsHeader";
import { BudgetsSummary } from "@/features/budgets/BudgetsSummary";
import { BudgetsTable, type BudgetRow } from "@/features/budgets/BudgetsTable";
import { BudgetModal } from "@/features/budgets/BudgetModal";

export default function BudgetsPage() {
  const [txs] = useState<Tx[]>(seedTxs);
  const [budgets, setBudgets] = useState<Budget[]>(seedBudgets);

  const months = useMemo(() => {
    const set = new Set<string>();
    txs.forEach((t) => set.add(monthKey(t.date)));
    budgets.forEach((b) => set.add(b.month));
    const arr = Array.from(set).sort((a, b) => b.localeCompare(a));
    return arr.length ? arr : [new Date().toISOString().slice(0, 7)];
  }, [txs, budgets]);

  const [selectedMonth, setSelectedMonth] = useState<string>(months[0] ?? new Date().toISOString().slice(0, 7));

  const categories = useMemo(() => {
    const set = new Set<string>();
    txs.forEach((t) => {
      if (t.amount < 0) set.add(t.category); // expense categories
    });
    budgets.forEach((b) => set.add(b.category));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [txs, budgets]);

  const spentByCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of txs) {
      if (monthKey(t.date) !== selectedMonth) continue;
      if (t.amount >= 0) continue;
      map.set(t.category, (map.get(t.category) ?? 0) + Math.abs(t.amount));
    }
    return map;
  }, [txs, selectedMonth]);

  const budgetsForMonth = useMemo(() => budgets.filter((b) => b.month === selectedMonth), [budgets, selectedMonth]);

  const budgetByCategory = useMemo(() => {
    const map = new Map<string, Budget>();
    budgetsForMonth.forEach((b) => map.set(b.category, b));
    return map;
  }, [budgetsForMonth]);

  const rows: BudgetRow[] = useMemo(() => {
    return categories.map((cat) => {
      const spent = spentByCategory.get(cat) ?? 0;
      const budget = budgetByCategory.get(cat)?.limit ?? 0;

      const remaining = Math.max(0, budget - spent);
      const over = budget > 0 ? Math.max(0, spent - budget) : 0;
      const pct = budget > 0 ? clampPct((spent / budget) * 100) : 0;

      return { category: cat, spent, budget, remaining, pct, over, hasBudget: budget > 0 };
    });
  }, [categories, spentByCategory, budgetByCategory]);

  const totals = useMemo(() => {
    const totalBudget = budgetsForMonth.reduce((s, b) => s + b.limit, 0);
    const totalSpent = Array.from(spentByCategory.values()).reduce((s, v) => s + v, 0);
    return { totalBudget, totalSpent, remaining: totalBudget - totalSpent };
  }, [budgetsForMonth, spentByCategory]);

  const unbudgeted = useMemo(() => {
    const items = categories
      .map((category) => {
        const spent = spentByCategory.get(category) ?? 0;
        const hasBudget = budgetByCategory.has(category);
        return { category, spent, hasBudget };
      })
      .filter((x) => x.spent > 0 && !x.hasBudget)
      .sort((a, b) => b.spent - a.spent);

    const total = items.reduce((s, x) => s + x.spent, 0);
    return { items, total };
  }, [categories, spentByCategory, budgetByCategory]);

  // Modal state
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<BudgetModalMode>("add");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [fCategory, setFCategory] = useState<string>(categories[0] ?? "Groceries");
  const [fLimit, setFLimit] = useState<string>("");

  function openAdd() {
    setMode("add");
    setEditingId(null);
    setFCategory(categories[0] ?? "Groceries");
    setFLimit("");
    setOpen(true);
  }

  function openEdit(b: Budget) {
    setMode("edit");
    setEditingId(b.id);
    setFCategory(b.category);
    setFLimit(String(b.limit));
    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
  }

  function onSetBudget(category: string) {
    setMode("add");
    setEditingId(null);
    setFCategory(category);
    setFLimit("");
    setOpen(true);
  }

  function saveBudget(e: React.FormEvent) {
    e.preventDefault();

    const limit = Number(fLimit);
    if (!Number.isFinite(limit) || limit <= 0) {
      alert("Enter a budget amount greater than 0.");
      return;
    }

    const existingForCat = budgets.find((b) => b.month === selectedMonth && b.category === fCategory);

    if (mode === "add") {
      if (existingForCat) {
        alert(`You already have a budget for "${fCategory}" in this month. Edit it instead.`);
        return;
      }

      const b: Budget = { id: crypto.randomUUID(), month: selectedMonth, category: fCategory, limit };
      setBudgets((prev) => [b, ...prev]);
      setOpen(false);
      return;
    }

    if (!editingId) return;

    setBudgets((prev) => prev.map((b) => (b.id === editingId ? { ...b, category: fCategory, limit } : b)));
    setOpen(false);
  }

  function deleteBudget(b: Budget) {
    const ok = confirm(`Delete budget?\n\n${b.category} • ${b.month} • ${b.limit}`);
    if (!ok) return;
    setBudgets((prev) => prev.filter((x) => x.id !== b.id));
  }

  return (
    <div className="space-y-6">
      <BudgetsHeader
        months={months}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        onAddBudget={openAdd}
      />

      <BudgetsSummary totalBudget={totals.totalBudget} totalSpent={totals.totalSpent} remaining={totals.remaining} />

      <BudgetsTable
        month={selectedMonth}
        rows={rows}
        budgetByCategory={budgetByCategory}
        onSetBudget={onSetBudget}
        onEdit={openEdit}
        onDelete={deleteBudget}
      />

      {unbudgeted.items.length > 0 && (
        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Unbudgeted spending</h2>
              <p className="text-sm text-slate-600">Categories with spending this month but no budget set.</p>
            </div>
            <div className="text-sm font-medium text-slate-700">
              Total: <span className="font-semibold text-slate-900">{unbudgeted.total.toLocaleString("en-CA", { style: "currency", currency: "CAD" })}</span>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 text-right font-medium">Spent</th>
                  <th className="px-4 py-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {unbudgeted.items.map((x) => (
                  <tr key={x.category}>
                    <td className="px-4 py-3 font-medium text-slate-900">{x.category}</td>
                    <td className="px-4 py-3 text-right text-slate-700">
                      {x.spent.toLocaleString("en-CA", { style: "currency", currency: "CAD" })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <button
                          onClick={() => onSetBudget(x.category)}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
                        >
                          Set budget
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}


      <BudgetModal
        open={open}
        mode={mode}
        month={selectedMonth}
        categories={categories.length ? categories : ["Groceries"]}
        category={fCategory}
        limit={fLimit}
        onChangeCategory={setFCategory}
        onChangeLimit={setFLimit}
        onClose={closeModal}
        onSave={saveBudget}
      />
    </div>
  );
}

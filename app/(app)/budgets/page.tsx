"use client";

import { useMemo, useState } from "react";
import type { Budget, BudgetModalMode, Tx, BudgetRuleType, ReleaseRule } from "@/features/budgets/types";
import { seedBudgets, seedTxs } from "@/features/budgets/seed";
import { clampPct, monthKey } from "@/features/budgets/utils";
import { BudgetsHeader } from "@/features/budgets/BudgetsHeader";
import { BudgetsSummary } from "@/features/budgets/BudgetsSummary";
import { BudgetsTable, type BudgetRow } from "@/features/budgets/BudgetsTable";
import { BudgetModal } from "@/features/budgets/BudgetModal";

// --- helpers ---
function safeNumber(v: string) {
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}

function plannedBudgetForRule(rule: Budget, plannedIncome: number) {
  if (rule.type === "FIXED") return rule.value;
  // PERCENT (value is like 12.5 for 12.5%)
  return plannedIncome * (rule.value / 100);
}

function availableBudgetForRule(rule: Budget, plannedBudget: number, incomeToDate: number) {
  // NONE means “full amount available immediately”
  if (rule.releaseRule === "NONE") return plannedBudget;

  // LINEAR pacing:
  // - Percent budgets pace with income received
  // - Fixed budgets: default to full planned budget (unless you later add scheduled/front-loaded)
  if (rule.type === "PERCENT") {
    return incomeToDate * (rule.value / 100);
  }

  // FIXED + LINEAR: you can choose to pace fixed bills too,
  // but IMO fixed bills usually should be NONE. For now: treat as full amount.
  return plannedBudget;
}

export default function BudgetsPage() {
  const [txs] = useState<Tx[]>(seedTxs);
  const [budgets, setBudgets] = useState<Budget[]>(seedBudgets);

  // New: planned income per month (simple local state for now)
  const [plannedIncomeByMonth, setPlannedIncomeByMonth] = useState<Record<string, number>>({});

  const months = useMemo(() => {
    const set = new Set<string>();
    txs.forEach((t) => set.add(monthKey(t.date)));
    budgets.forEach((b) => set.add(b.month));
    const arr = Array.from(set).sort((a, b) => b.localeCompare(a));
    return arr.length ? arr : [new Date().toISOString().slice(0, 7)];
  }, [txs, budgets]);

  const [selectedMonth, setSelectedMonth] = useState<string>(months[0] ?? new Date().toISOString().slice(0, 7));

  const plannedIncome = plannedIncomeByMonth[selectedMonth] ?? 0;

  const categories = useMemo(() => {
    const set = new Set<string>();
    // include expense categories from txs + any budget categories
    txs.forEach((t) => {
      if (t.amount < 0) set.add(t.category);
    });
    budgets.forEach((b) => set.add(b.category));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [txs, budgets]);

  const incomeToDate = useMemo(() => {
    let sum = 0;
    for (const t of txs) {
      if (monthKey(t.date) !== selectedMonth) continue;
      if (t.amount > 0) sum += t.amount;
    }
    return sum;
  }, [txs, selectedMonth]);

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
      const rule = budgetByCategory.get(cat);

      if (!rule) {
        return {
          category: cat,
          spent,
          plannedBudget: 0,
          availableBudget: 0,
          remainingToDate: 0,
          overToDate: 0,
          pctToDate: 0,
          pctPlan: 0,
          hasBudget: false,
        };
      }

      const plannedBudget = plannedBudgetForRule(rule, plannedIncome);
      const availableBudget = availableBudgetForRule(rule, plannedBudget, incomeToDate);

      const overToDate = availableBudget > 0 ? Math.max(0, spent - availableBudget) : 0;
      const remainingToDate = availableBudget > 0 ? Math.max(0, availableBudget - spent) : 0;

      const pctToDate = availableBudget > 0 ? clampPct((spent / availableBudget) * 100) : 0;
      const pctPlan = plannedBudget > 0 ? clampPct((spent / plannedBudget) * 100) : 0;

      return {
        category: cat,
        spent,
        plannedBudget,
        availableBudget,
        remainingToDate,
        overToDate,
        pctToDate,
        pctPlan,
        hasBudget: true,
      };
    });
  }, [categories, spentByCategory, budgetByCategory, plannedIncome, incomeToDate]);

  // Totals — you can decide whether summary should be based on planned or to-date.
  // IMO: show BOTH. For now, keep it simple: summary = total Available (to-date).
  const totals = useMemo(() => {
    const totalAvailableToDate = rows.reduce((s, r) => s + (r.hasBudget ? r.availableBudget : 0), 0);
    const totalPlanned = rows.reduce((s, r) => s + (r.hasBudget ? r.plannedBudget : 0), 0);
    const totalSpent = Array.from(spentByCategory.values()).reduce((s, v) => s + v, 0);

    return {
      totalBudget: totalAvailableToDate, // keep existing prop name used by BudgetsSummary
      totalPlanned,
      totalSpent,
      remaining: totalAvailableToDate - totalSpent,
    };
  }, [rows, spentByCategory]);

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

  // ---- Modal state (updated for new modal) ----
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<BudgetModalMode>("add");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [fCategory, setFCategory] = useState<string>(categories[0] ?? "Groceries");

  const [fRuleType, setFRuleType] = useState<BudgetRuleType>("PERCENT");
  const [fPercent, setFPercent] = useState<string>(""); // "12.5"
  const [fFixedAmount, setFFixedAmount] = useState<string>(""); // "500"
  const [fReleaseRule, setFReleaseRule] = useState<ReleaseRule>("LINEAR");

  function openAdd() {
    setMode("add");
    setEditingId(null);
    setFCategory(categories[0] ?? "Groceries");
    setFRuleType("PERCENT");
    setFPercent("");
    setFFixedAmount("");
    setFReleaseRule("LINEAR");
    setOpen(true);
  }

  function openEdit(b: Budget) {
    setMode("edit");
    setEditingId(b.id);
    setFCategory(b.category);
    setFRuleType(b.type);
    setFReleaseRule(b.releaseRule);

    if (b.type === "PERCENT") {
      setFPercent(String(b.value));
      setFFixedAmount("");
    } else {
      setFFixedAmount(String(b.value));
      setFPercent("");
    }

    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
  }

  function onSetBudget(category: string) {
    setMode("add");
    setEditingId(null);
    setFCategory(category);
    setFRuleType("PERCENT");
    setFPercent("");
    setFFixedAmount("");
    setFReleaseRule("LINEAR");
    setOpen(true);
  }

  function saveBudget(e: React.FormEvent) {
    e.preventDefault();

    const existingForCat = budgets.find((b) => b.month === selectedMonth && b.category === fCategory);

    // parse rule value
    let value: number = NaN;

    if (fRuleType === "PERCENT") {
      value = safeNumber(fPercent);
      if (!Number.isFinite(value) || value <= 0) {
        alert("Enter a percent greater than 0 (e.g., 12.5).");
        return;
      }
    } else {
      value = safeNumber(fFixedAmount);
      if (!Number.isFinite(value) || value <= 0) {
        alert("Enter a fixed amount greater than 0.");
        return;
      }
    }

    // If FIXED, you probably want NONE pacing by default (but allow user to choose)
    const releaseRule: ReleaseRule = fReleaseRule;

    if (mode === "add") {
      if (existingForCat) {
        alert(`You already have a budget rule for "${fCategory}" in this month. Edit it instead.`);
        return;
      }

      const b: Budget = {
        id: crypto.randomUUID(),
        month: selectedMonth,
        category: fCategory,
        type: fRuleType,
        value,
        releaseRule,
      };

      setBudgets((prev) => [b, ...prev]);
      setOpen(false);
      return;
    }

    if (!editingId) return;

    setBudgets((prev) =>
      prev.map((b) =>
        b.id === editingId
          ? {
              ...b,
              category: fCategory,
              type: fRuleType,
              value,
              releaseRule,
            }
          : b
      )
    );

    setOpen(false);
  }

  function deleteBudget(b: Budget) {
    const ok = confirm(`Delete budget rule?\n\n${b.category} • ${b.month}`);
    if (!ok) return;
    setBudgets((prev) => prev.filter((x) => x.id !== b.id));
  }

  // Planned income input (per month)
  function onChangePlannedIncome(v: string) {
    const n = Number(v);
    setPlannedIncomeByMonth((prev) => ({
      ...prev,
      [selectedMonth]: Number.isFinite(n) && n >= 0 ? n : 0,
    }));
  }

  return (
    <div className="space-y-6">
      <BudgetsHeader months={months} selectedMonth={selectedMonth} onMonthChange={setSelectedMonth} onAddBudget={openAdd} />

      {/* NEW: income controls */}
      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-sm font-medium text-slate-700">Planned income (month)</p>
            <input
              value={String(plannedIncome)}
              onChange={(e) => onChangePlannedIncome(e.target.value)}
              inputMode="decimal"
              placeholder="e.g., 4000"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-300 focus:ring-4 focus:ring-slate-100"
            />
            <p className="mt-2 text-xs text-slate-500">Used to compute “Planned” budgets from % rules.</p>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-700">Income received (to-date)</p>
            <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900">
              {incomeToDate.toLocaleString("en-CA", { style: "currency", currency: "CAD" })}
            </div>
            <p className="mt-2 text-xs text-slate-500">Sum of income transactions in the selected month.</p>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-700">Pacing status</p>
            <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              Available budgets update automatically as income comes in.
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Main bar is “% used of to-date available”. Secondary label is “% used of full plan”.
            </p>
          </div>
        </div>
      </section>

      {/* Keep existing summary card — but it now represents total AVAILABLE (to-date) */}
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
              <p className="text-sm text-slate-600">Categories with spending this month but no budget rule set.</p>
            </div>
            <div className="text-sm font-medium text-slate-700">
              Total:{" "}
              <span className="font-semibold text-slate-900">
                {unbudgeted.total.toLocaleString("en-CA", { style: "currency", currency: "CAD" })}
              </span>
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
                          Set rule
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

      {/* Updated modal props */}
      <BudgetModal
        open={open}
        mode={mode}
        month={selectedMonth}
        categories={categories.length ? categories : ["Groceries"]}
        category={fCategory}
        onChangeCategory={setFCategory}
        ruleType={fRuleType}
        onChangeRuleType={setFRuleType}
        percent={fPercent}
        onChangePercent={setFPercent}
        fixedAmount={fFixedAmount}
        onChangeFixedAmount={setFFixedAmount}
        releaseRule={fReleaseRule}
        onChangeReleaseRule={setFReleaseRule}
        onClose={closeModal}
        onSave={saveBudget}
      />
    </div>
  );
}

"use client";

import { formatMoney } from "./utils";

export function BudgetsSummary(props: { totalBudget: number; totalSpent: number; remaining: number }) {
  const { totalBudget, totalSpent, remaining } = props;

  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <MiniStat label="Total budget" value={formatMoney(totalBudget)} />
      <MiniStat label="Total spent" value={formatMoney(totalSpent)} />
      <MiniStat label="Remaining" value={formatMoney(remaining)} tone={remaining >= 0 ? "ok" : "bad"} />
    </section>
  );
}

function MiniStat(props: { label: string; value: string; tone?: "ok" | "bad" }) {
  const toneClass = props.tone === "bad" ? "text-rose-700" : "text-slate-900";
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <p className="text-xs font-medium text-slate-600">{props.label}</p>
      <p className={`mt-1 text-lg font-semibold ${toneClass}`}>{props.value}</p>
    </div>
  );
}

"use client";

import type { BudgetModalMode } from "./types";
import { monthLabel } from "./utils";

type BudgetRuleType = "PERCENT" | "FIXED";
type ReleaseRule = "LINEAR" | "NONE"; // extend later (SCHEDULED, FRONT_LOADED, etc.)

export function BudgetModal(props: {
  open: boolean;
  mode: BudgetModalMode;
  month: string;

  // category
  categories: string[];
  category: string;
  onChangeCategory: (c: string) => void;

  // rule inputs
  ruleType: BudgetRuleType;
  onChangeRuleType: (t: BudgetRuleType) => void;

  percent: string; // e.g. "12.5"
  onChangePercent: (v: string) => void;

  fixedAmount: string; // e.g. "500"
  onChangeFixedAmount: (v: string) => void;

  releaseRule: ReleaseRule;
  onChangeReleaseRule: (r: ReleaseRule) => void;

  onClose: () => void;
  onSave: (e: React.FormEvent) => void;
}) {
  const {
    open,
    mode,
    month,
    categories,
    category,
    onChangeCategory,
    ruleType,
    onChangeRuleType,
    percent,
    onChangePercent,
    fixedAmount,
    onChangeFixedAmount,
    releaseRule,
    onChangeReleaseRule,
    onClose,
    onSave,
  } = props;

  if (!open) return null;

  const title = mode === "add" ? "Add budget rule" : "Edit budget rule";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-lg ring-1 ring-slate-200">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            <p className="text-sm text-slate-600">{monthLabel(month)} • Budget rules</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-slate-600 hover:bg-slate-100"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSave} className="mt-5 space-y-4">
          {/* Category */}
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

          {/* Rule type */}
          <div>
            <label className="text-sm font-medium text-slate-700">Budget type</label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onChangeRuleType("PERCENT")}
                className={[
                  "rounded-xl border px-4 py-3 text-sm font-semibold",
                  ruleType === "PERCENT"
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
                ].join(" ")}
              >
                % of income
              </button>
              <button
                type="button"
                onClick={() => onChangeRuleType("FIXED")}
                className={[
                  "rounded-xl border px-4 py-3 text-sm font-semibold",
                  ruleType === "FIXED"
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
                ].join(" ")}
              >
                Fixed amount
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-600">
              % of income uses your <span className="font-medium">income received so far</span> to pace spending through the month.
            </p>
          </div>

          {/* Percent / Fixed input */}
          {ruleType === "PERCENT" ? (
            <div>
              <label className="text-sm font-medium text-slate-700">Percent of income</label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  value={percent}
                  onChange={(e) => onChangePercent(e.target.value)}
                  inputMode="decimal"
                  placeholder="e.g., 12.5"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-300 focus:ring-4 focus:ring-slate-100"
                />
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-700">
                  %
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label className="text-sm font-medium text-slate-700">Monthly amount</label>
              <div className="mt-1 flex items-center gap-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-700">
                  $
                </div>
                <input
                  value={fixedAmount}
                  onChange={(e) => onChangeFixedAmount(e.target.value)}
                  inputMode="decimal"
                  placeholder="e.g., 500"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-300 focus:ring-4 focus:ring-slate-100"
                />
              </div>
              <p className="mt-2 text-xs text-slate-600">
                Fixed amounts don’t scale with income pacing (useful for rent/subscriptions).
              </p>
            </div>
          )}

          {/* Release rule (keep simple now) */}
          <div>
            <label className="text-sm font-medium text-slate-700">Release rule</label>
            <select
              value={releaseRule}
              onChange={(e) => onChangeReleaseRule(e.target.value as ReleaseRule)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-300 focus:ring-4 focus:ring-slate-100"
            >
              <option value="LINEAR">Linear (pacing)</option>
              <option value="NONE">No pacing (full amount available)</option>
            </select>
            <p className="mt-2 text-xs text-slate-600">
              Linear is your “can’t spend month’s budget in week 1” rule.
            </p>
          </div>

          <div className="mt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              {mode === "add" ? "Add" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

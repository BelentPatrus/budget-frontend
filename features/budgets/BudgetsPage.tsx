"use client";

import { useEffect, useMemo, useState } from "react";
import type { BudgetRow, BudgetPeriod, Bucket } from "./types";
import {
  createBudget,
  fetchBudgets,
  updateBudget,
  deleteBudget,
  fetchBudgetPeriods,
  fetchBuckets,
} from "./api";
import { BudgetPeriodSelector } from "./BudgetPeriodSelector";

function money(n: number) {
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(n);
}

function pct(n: number) {
  return `${(n * 100).toFixed(2)}%`;
}

function safeNumber(v: string) {
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}

type BudgetType = "EXPENSE" | "BUCKET";

export function BudgetsPage() {
  const [rows, setRows] = useState<BudgetRow[]>([]);
  const [periods, setPeriods] = useState<BudgetPeriod[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<number | null>(null);

  const [buckets, setBuckets] = useState<Bucket[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // create row state
  const [newType, setNewType] = useState<BudgetType>("EXPENSE");
  const [newBucketId, setNewBucketId] = useState<string>("");
  const [newName, setNewName] = useState("");
  const [newPlanned, setNewPlanned] = useState("");

  // bucket lookup
  const bucketById = useMemo(() => {
    return new Map(buckets.map((b) => [String(b.id), b]));
  }, [buckets]);

  const isBucketBudget = newType === "BUCKET";
  const derivedName = isBucketBudget ? bucketById.get(String(newBucketId))?.name ?? "" : newName;

  // Load budget periods (once)
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await fetchBudgetPeriods();
        if (cancelled) return;

        const list = Array.isArray(data) ? data : [];
        setPeriods(list);
        if (list.length > 0) setSelectedPeriodId(list[0].id);
      } catch (e) {
        console.error("Failed to load periods", e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Load buckets (once)
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await fetchBuckets();
        if (!cancelled) setBuckets(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Failed to load buckets", e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Load budgets when period changes
  useEffect(() => {
    if (!selectedPeriodId) return;

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await fetchBudgets(selectedPeriodId);
        if (!cancelled) setRows(Array.isArray(data) ? data : []);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Failed to load budgets");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedPeriodId]);

  // If user switches to BUCKET mode, clear name (we’ll derive it)
  useEffect(() => {
    if (newType === "BUCKET") setNewName("");
    if (newType === "EXPENSE") setNewBucketId("");
  }, [newType]);

  // Derived totals (from loaded rows)
  const computed = useMemo(() => {
    const plannedTotal = rows.reduce((s, r) => s + (r.planned ?? 0), 0);
    const actualTotal = rows.reduce((s, r) => s + (r.actual ?? 0), 0);

    return {
      plannedTotal,
      actualTotal,
      remainingTotal: plannedTotal - actualTotal,
      rows: rows.map((r) => {
        const remaining = (r.planned ?? 0) - (r.actual ?? 0);
        const toward = (r.planned ?? 0) > 0 ? (r.actual ?? 0) / (r.planned ?? 0) : 0;
        return { ...r, remaining, toward };
      }),
    };
  }, [rows]);

  async function onAddRow() {
    if (!selectedPeriodId) return setError("Please select a budget period.");

    const planned = safeNumber(newPlanned.trim() || "0");
    const name = (derivedName ?? "").trim();

    if (!name) return setError(isBucketBudget ? "Please select a bucket." : "Name is required.");
    if (Number.isNaN(planned) || planned < 0) return setError("Planned must be ≥ 0.");
    if (isBucketBudget && !newBucketId) return setError("Please select a bucket.");

    try {
      setError(null);

      const created = await createBudget({
        periodId: selectedPeriodId,
        type: newType,
        name, // IMPORTANT: derived bucket name when BUCKET
        planned,
        bucketId: isBucketBudget ? newBucketId : null,
      });

      setRows((prev) => [created, ...prev]);

      // reset form
      setNewType("EXPENSE");
      setNewBucketId("");
      setNewName("");
      setNewPlanned("");
    } catch (e: any) {
      setError(e?.message ?? "Failed to create budget row");
    }
  }

  async function onEditPlanned(id: string, plannedStr: string) {
    const planned = safeNumber(plannedStr);
    if (Number.isNaN(planned) || planned < 0) return;

    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, planned } : r)));

    try {
      await updateBudget(id, { planned });
    } catch {
      if (selectedPeriodId) {
        const data = await fetchBudgets(selectedPeriodId);
        setRows(Array.isArray(data) ? data : []);
      }
    }
  }

  async function onDelete(id: string) {
    const prev = rows;
    setRows((r) => r.filter((x) => x.id !== id));
    try {
      await deleteBudget(id);
    } catch {
      setRows(prev);
    }
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="text-2xl font-semibold">Monthly Budget</h1>
      <p className="text-sm text-gray-600">Simple category-based budget like your Excel sheet.</p>

      <BudgetPeriodSelector
        periods={periods}
        selectedPeriodId={selectedPeriodId}
        onChange={setSelectedPeriodId}
      />

      <div className="mt-4 rounded-2xl border bg-white shadow-sm">
        {loading ? (
          <div className="p-6 text-sm text-gray-600">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="p-8">
            <div className="text-lg font-semibold">No budgets yet</div>
            <div className="mt-1 text-sm text-gray-600">
              Create your first budget row (Expense or Bucket-based).
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-5">
              <select
                className="rounded-xl border px-3 py-2 text-sm"
                value={newType}
                onChange={(e) => setNewType(e.target.value as BudgetType)}
              >
                <option value="EXPENSE">Expense</option>
                <option value="BUCKET">Bucket</option>
              </select>

              <select
                className="rounded-xl border px-3 py-2 text-sm disabled:bg-gray-50"
                value={newBucketId}
                onChange={(e) => setNewBucketId(e.target.value)}
                disabled={!isBucketBudget}
              >
                <option value="" disabled>
                  {isBucketBudget ? "Select bucket" : "Bucket (disabled)"}
                </option>
                {buckets.map((b) => (
                  <option key={b.id} value={String(b.id)}>
                    {b.name}
                  </option>
                ))}
              </select>

              <input
                className="rounded-xl border px-3 py-2 text-sm disabled:bg-gray-50"
                placeholder={isBucketBudget ? "Auto (bucket name)" : "Name (e.g., Rent)"}
                value={derivedName}
                onChange={(e) => setNewName(e.target.value)}
                disabled={isBucketBudget}
              />

              <input
                className="rounded-xl border px-3 py-2 text-sm"
                placeholder="Planned (e.g., 500)"
                value={newPlanned}
                onChange={(e) => setNewPlanned(e.target.value)}
              />

              <button
                onClick={onAddRow}
                className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white"
              >
                Create budget
              </button>
            </div>

            {error ? <div className="mt-3 text-sm text-red-600">{error}</div> : null}
          </div>
        ) : (
          <>
            <div className="border-b px-6 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm text-gray-700">
                  <span className="font-medium">Planned:</span> {money(computed.plannedTotal)}{" "}
                  <span className="mx-2 text-gray-300">|</span>
                  <span className="font-medium">Actual:</span> {money(computed.actualTotal)}{" "}
                  <span className="mx-2 text-gray-300">|</span>
                  <span className="font-medium">Remaining:</span> {money(computed.remainingTotal)}
                </div>

                <div className="flex flex-wrap gap-2">
                  <select
                    className="rounded-xl border px-3 py-2 text-sm"
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as BudgetType)}
                  >
                    <option value="EXPENSE">Expense</option>
                    <option value="BUCKET">Bucket</option>
                  </select>

                  <select
                    className="rounded-xl border px-3 py-2 text-sm disabled:bg-gray-50"
                    value={newBucketId}
                    onChange={(e) => setNewBucketId(e.target.value)}
                    disabled={!isBucketBudget}
                  >
                    <option value="" disabled>
                      {isBucketBudget ? "Select bucket" : "Bucket (disabled)"}
                    </option>
                    {buckets.map((b) => (
                      <option key={b.id} value={String(b.id)}>
                        {b.name}
                      </option>
                    ))}
                  </select>

                  <input
                    className="w-48 rounded-xl border px-3 py-2 text-sm disabled:bg-gray-50"
                    placeholder={isBucketBudget ? "Auto (bucket name)" : "Name"}
                    value={derivedName}
                    onChange={(e) => setNewName(e.target.value)}
                    disabled={isBucketBudget}
                  />

                  <input
                    className="w-32 rounded-xl border px-3 py-2 text-sm"
                    placeholder="Planned"
                    value={newPlanned}
                    onChange={(e) => setNewPlanned(e.target.value)}
                  />

                  <button
                    onClick={onAddRow}
                    className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white"
                  >
                    Add row
                  </button>
                </div>
              </div>

              {error ? <div className="mt-2 text-sm text-red-600">{error}</div> : null}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3">Planned ($)</th>
                    <th className="px-6 py-3">Actual ($)</th>
                    <th className="px-6 py-3">Remaining</th>
                    <th className="px-6 py-3">% Towards Budget</th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>

                <tbody>
                  {computed.rows.map((r: any) => {
                    const rowType: BudgetType = (r.type ??
                      (r.bucketId ? "BUCKET" : "EXPENSE")) as BudgetType;

                    const rowBucketName =
                      r.bucket?.name ??
                      r.bucketName ??
                      (r.bucketId ? bucketById.get(String(r.bucketId))?.name : undefined);

                    const displayName = rowType === "BUCKET" ? rowBucketName ?? r.name : r.name;

                    return (
                      <tr key={r.id} className="border-t">
                        <td className="px-6 py-3 font-medium">{displayName ?? r.category}</td>
                        <td className="px-6 py-3">{rowType}</td>

                        <td className="px-6 py-3">{money(r.planned ?? 0)}</td>


                        <td className="px-6 py-3">{money(r.actual ?? 0)}</td>
                        <td className="px-6 py-3">{money(r.remaining ?? 0)}</td>
                        <td className="px-6 py-3">{pct(r.toward ?? 0)}</td>

                        <td className="px-6 py-3 text-right">
                          <button
                            onClick={() => onDelete(r.id)}
                            className="rounded-lg border px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>

                <tfoot>
                  <tr className="border-t bg-gray-50">
                    <td className="px-6 py-3 font-semibold">Totals</td>
                    <td className="px-6 py-3" />
                    <td className="px-6 py-3 font-semibold">{money(computed.plannedTotal)}</td>
                    <td className="px-6 py-3 font-semibold">{money(computed.actualTotal)}</td>
                    <td className="px-6 py-3 font-semibold">{money(computed.remainingTotal)}</td>
                    <td className="px-6 py-3" />
                    <td className="px-6 py-3" />
                  </tr>
                </tfoot>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

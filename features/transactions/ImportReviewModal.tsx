"use client";

import { useEffect, useMemo, useState } from "react";

type ImportPreviewTx = {
  date: string; // "YYYY-MM-DD"
  description: string;
  amount: number;
};

type RowStatus = "needs_info" | "ready" | "saving" | "saved" | "error";

export type ImportReviewRow = ImportPreviewTx & {
  bucket: string;   // selected bucket name (or id if you prefer)
  account: string;  // selected account name (or id if you prefer)
  status: RowStatus;
  errorMsg?: string;
};

function money(n: number) {
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  return `${sign}$${abs.toFixed(2)}`;
}

function isRowReady(r: ImportReviewRow) {
  return Boolean(r.bucket?.trim()) && Boolean(r.account?.trim());
}

export function ImportReviewModal(props: {
  open: boolean;
  onClose: () => void;

  // from upload preview response
  preview: ImportPreviewTx[];

  // dropdown options
  buckets: string[];
  accounts: string[];

  // called when user approves a row (✅)
  onCommitRow: (row: {
    date: string;
    description: string;
    amount: number;
    bucket: string;
    account: string;
  }) => Promise<void>;
}) {
  const { open, onClose, preview, buckets, accounts, onCommitRow } = props;

  const initialRows = useMemo<ImportReviewRow[]>(
    () =>
      (preview ?? []).map((p) => ({
        ...p,
        bucket: "",
        account: "",
        status: "needs_info" as RowStatus,
      })),
    [preview]
  );

  const [rows, setRows] = useState<ImportReviewRow[]>(initialRows);

  useEffect(() => {
    setRows(initialRows);
  }, [initialRows]);

  // keep status in sync when user edits
  useEffect(() => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.status === "saved" || r.status === "saving" || r.status === "error") return r;
        return { ...r, status: isRowReady(r) ? "ready" : "needs_info" };
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows.length]); // minimal; we set status in updateRow too

  function updateRow(i: number, patch: Partial<ImportReviewRow>) {
    setRows((prev) => {
      const next = [...prev];
      const merged = { ...next[i], ...patch };
      // auto-status if not already saved/saving/error
      if (!["saving", "saved", "error"].includes(merged.status)) {
        merged.status = isRowReady(merged) ? "ready" : "needs_info";
        merged.errorMsg = undefined;
      }
      next[i] = merged;
      return next;
    });
  }

  async function commitOne(i: number) {
    const r = rows[i];
    if (!isRowReady(r)) {
      updateRow(i, { status: "needs_info" });
      return;
    }

    updateRow(i, { status: "saving", errorMsg: undefined });
    try {
      await onCommitRow({
        date: r.date,
        description: r.description,
        amount: r.amount,
        bucket: r.bucket,
        account: r.account,
      });
      updateRow(i, { status: "saved" });
    } catch (e: any) {
      updateRow(i, {
        status: "error",
        errorMsg: e?.message ?? "Failed to save",
      });
    }
  }

  const allSaved = rows.length > 0 && rows.every((r) => r.status === "saved");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => {
          // optional: prevent closing while saving
          const saving = rows.some((r) => r.status === "saving");
          if (!saving) onClose();
        }}
      />

      {/* modal */}
      <div className="absolute left-1/2 top-1/2 
                w-[min(1400px,98vw)] 
                h-[min(90vh,900px)]
                -translate-x-1/2 -translate-y-1/2 
                rounded-2xl bg-white shadow-xl flex flex-col">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold">Review imported transactions</h2>
            <p className="text-sm text-slate-500">
              Pick a bucket + account for each row, then ✅ to submit it.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {allSaved && (
              <span className="text-sm font-medium text-green-700">
                All rows saved ✅
              </span>
            )}
            <button
              className="rounded-lg border px-3 py-2 text-sm hover:bg-slate-50"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>

        <div className="max-h-[70vh] overflow-auto px-6 py-4">
          <div className="overflow-hidden rounded-xl border">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-700">
                <tr className="[&>th]:px-4 [&>th]:py-3 [&>th]:text-left">
                  <th>Date</th>
                  <th>Description</th>
                  <th>Bucket</th>
                  <th>Account</th>
                  <th className="text-right">Amount</th>
                  <th className="text-center">Status</th>
                </tr>
              </thead>

              <tbody className="[&>tr]:border-t">
                {rows.map((r, i) => {
                  const amountClass =
                    r.amount < 0 ? "text-slate-900" : "text-green-700";

                  return (
                    <tr key={`${r.date}-${i}`} className="[&>td]:px-4 [&>td]:py-3 align-top">
                      <td>
                        <input
                          className="w-[140px] rounded-md border px-2 py-1"
                          value={r.date}
                          onChange={(e) => updateRow(i, { date: e.target.value })}
                        />
                      </td>

                      <td>
                        <input
                          className="w-full min-w-[280px] rounded-md border px-2 py-1"
                          value={r.description}
                          onChange={(e) =>
                            updateRow(i, { description: e.target.value })
                          }
                        />
                      </td>

                      <td>
                        <select
                          className="w-[200px] rounded-md border px-2 py-1"
                          value={r.bucket}
                          onChange={(e) => updateRow(i, { bucket: e.target.value })}
                        >
                          <option value="">Select…</option>
                          {buckets.map((b) => (
                            <option key={b} value={b}>
                              {b}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td>
                        <select
                          className="w-[200px] rounded-md border px-2 py-1"
                          value={r.account}
                          onChange={(e) =>
                            updateRow(i, { account: e.target.value })
                          }
                        >
                          <option value="">Select…</option>
                          {accounts.map((a) => (
                            <option key={a} value={a}>
                              {a}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className={`text-right font-medium ${amountClass}`}>
                        <input
                          className="w-[120px] rounded-md border px-2 py-1 text-right"
                          value={String(r.amount)}
                          onChange={(e) =>
                            updateRow(i, { amount: Number(e.target.value) })
                          }
                        />
                        <div className="text-xs text-slate-500">{money(r.amount)}</div>
                      </td>

                      <td className="text-center">
                        {r.status === "needs_info" && (
                          <span title="Missing bucket/account" className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700">
                            ❌ Needs info
                          </span>
                        )}

                        {r.status === "ready" && (
                          <button
                            title="Submit this transaction"
                            onClick={() => commitOne(i)}
                            className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                          >
                            ✅ Submit
                          </button>
                        )}

                        {r.status === "saving" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                            ⏳ Saving…
                          </span>
                        )}

                        {r.status === "saved" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                            ✅ Saved
                          </span>
                        )}

                        {r.status === "error" && (
                          <div className="flex flex-col items-center gap-1">
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700">
                              ❌ Error
                            </span>
                            {r.errorMsg && (
                              <span className="max-w-[220px] text-xs text-red-600">
                                {r.errorMsg}
                              </span>
                            )}
                            <button
                              className="text-xs underline"
                              onClick={() => commitOne(i)}
                            >
                              retry
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {rows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                      No rows returned from upload.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-center justify-between border-t px-6 py-4">
          <p className="text-sm text-slate-500">
            Tip: Rows need Bucket + Account before you can submit.
          </p>
          <button
            className="rounded-lg border px-3 py-2 text-sm hover:bg-slate-50"
            onClick={() => {
              // quick-fill defaults if you want (optional)
              const defaultBucket = buckets[0] ?? "";
              const defaultAccount = accounts[0] ?? "";
              setRows((prev) =>
                prev.map((r) =>
                  r.status === "saved"
                    ? r
                    : {
                        ...r,
                        bucket: r.bucket || defaultBucket,
                        account: r.account || defaultAccount,
                        status: isRowReady({ ...r, bucket: r.bucket || defaultBucket, account: r.account || defaultAccount })
                          ? "ready"
                          : "needs_info",
                      }
                )
              );
            }}
          >
            Autofill first bucket/account
          </button>
        </div>
      </div>
    </div>
  );
}

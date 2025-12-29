"use client";

import type { Tx } from "./types";
import { formatDate, formatMoney } from "./utils";

export function TransactionsTable(props: {
  rows: Tx[];
  onEdit: (t: Tx) => void;
  onDelete: (t: Tx) => void;
}) {
  const { rows, onEdit, onDelete } = props;

  return (
    <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <p className="text-sm font-medium text-slate-700">
          Showing <span className="font-semibold text-slate-900">{rows.length}</span> transactions
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Merchant</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Account</th>
              <th className="px-4 py-3 font-medium">Note</th>
              <th className="px-4 py-3 text-right font-medium">Amount</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {rows.map((t) => (
              <tr key={t.id} className="bg-white">
                <td className="px-4 py-3 text-slate-700">{formatDate(t.date)}</td>
                <td className="px-4 py-3 text-slate-900">{t.merchant}</td>
                <td className="px-4 py-3 text-slate-700">{t.category}</td>
                <td className="px-4 py-3 text-slate-700">{t.account}</td>
                <td className="px-4 py-3 text-slate-700">{t.note ?? "—"}</td>
                <td className={`px-4 py-3 text-right font-semibold ${t.amount < 0 ? "text-slate-900" : "text-emerald-700"}`}>
                  {formatMoney(t.amount)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onEdit(t)}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(t)}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td className="px-4 py-10 text-center text-slate-600" colSpan={7}>
                  No transactions match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

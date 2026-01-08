import { useMemo } from "react";
import type { BankAccount, Bucket } from "@/features/accounts/types";
import { money } from "@/features/accounts/types";

export function AccountCard(props: {
  account: BankAccount;
  buckets: Bucket[];
  onAddBucket: () => void;
}) {
  const { account, buckets, onAddBucket } = props;

  const isDebit = account.creditOrDebit === "DEBIT";

  // CREDIT card: show ONLY header + balance, nothing about buckets
  if (!isDebit) {
    return (
      <div className="rounded-2xl border bg-white shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">{account.name}</h2>
              <span className="text-xs rounded-full border px-2 py-0.5 text-gray-600">
                {account.creditOrDebit}
              </span>
            </div>

            <div className="text-sm text-gray-600">
              Current balance:{" "}
              <span className="font-medium text-gray-900">
                {money(account.balance)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // DEBIT card: full buckets UI
  const bucketsTotal = useMemo(
    () => buckets.reduce((s, b) => s + (b.balance || 0), 0),
    [buckets]
  );

  return (
    <div className="rounded-2xl border bg-white shadow-sm">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">{account.name}</h2>
            <span className="text-xs rounded-full border px-2 py-0.5 text-gray-600">
              {account.creditOrDebit}
            </span>
          </div>

          <div className="text-sm text-gray-600">
            Account balance:{" "}
            <span className="font-medium text-gray-900">
              {money(account.balance)}
            </span>
            <span className="mx-2 text-gray-300">•</span>
            Buckets total:{" "}
            <span className="font-medium text-gray-900">
              {money(bucketsTotal)}
            </span>
          </div>
        </div>

        <button
          onClick={onAddBucket}
          className="rounded-xl px-3 py-2 border hover:bg-gray-50"
        >
          + Add bucket
        </button>
      </div>

      <div className="p-4">
        {buckets.length === 0 ? (
          <div className="text-sm text-gray-500">No buckets yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-gray-500">
              <tr className="border-b">
                <th className="py-2">Bucket</th>
                <th className="py-2 text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              {buckets.map((b) => (
                <tr key={b.id} className="border-b last:border-b-0">
                  <td className="py-2">{b.name}</td>
                  <td className="py-2 text-right font-medium">
                    {money(b.balance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
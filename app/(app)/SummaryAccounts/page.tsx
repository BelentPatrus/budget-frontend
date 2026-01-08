"use client";

import { useState } from "react";
import { money } from "@/features/accounts/types";
import { useAccountsSummary } from "@/features/accounts/hooks/useAccountsSummary";
import { AccountCard } from "./AccountCard";
import { AddAccountModal } from "./AddAccountModal";
import { AddBucketModal } from "./AddBucketModal";

export default function SettingsAccountsSummaryPage() {
  const {
    accounts,
    bucketsByAccount,
    loading,
    error,
    totalAccountsBalance,
    createAccount,
    createBucket,
  } = useAccountsSummary();

  const [showAddAccount, setShowAddAccount] = useState(false);
  const [addBucketForAccountId, setAddBucketForAccountId] = useState<string | null>(null);

  if (loading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Accounts</h1>
          <p className="text-sm text-gray-500">Your accounts and the buckets inside each account.</p>
          <div className="mt-2 text-sm">
            <span className="text-gray-500">Total balances: </span>
            <span className="font-medium">{money(totalAccountsBalance)}</span>
          </div>
        </div>

        <button
          onClick={() => setShowAddAccount(true)}
          className="rounded-xl px-4 py-2 bg-black text-white hover:opacity-90"
        >
          + Add account
        </button>
      </div>

      <div className="space-y-5">
        {accounts.length === 0 ? (
          <div className="text-sm text-gray-500">No accounts yet.</div>
        ) : (
          accounts.map((a) => (
            <AccountCard
              key={a.id}
              account={a}
              buckets={bucketsByAccount[a.id] ?? []}
              onAddBucket={() => setAddBucketForAccountId(a.id)}
            />
          ))
        )}
      </div>

      {showAddAccount && (
        <AddAccountModal
          onClose={() => setShowAddAccount(false)}
          onCreate={async (payload) => {
            await createAccount(payload);
            setShowAddAccount(false);
          }}
        />
      )}

      {addBucketForAccountId && (
        <AddBucketModal
          accountName={accounts.find((x) => x.id === addBucketForAccountId)?.name ?? "Account"}
          onClose={() => setAddBucketForAccountId(null)}
          onCreate={async (payload) => {
            await createBucket(addBucketForAccountId, payload);
            setAddBucketForAccountId(null);
          }}
        />
      )}
    </div>
  );
}

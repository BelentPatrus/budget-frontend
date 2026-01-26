"use client";

import { useMemo, useState } from "react";
import { money, type BankAccount } from "@/features/accounts/types";
import { useAccountsSummary } from "@/features/accounts/hooks/useAccountsSummary";
import { AccountCard } from "./AccountCard";
import { AddAccountModal } from "./AddAccountModal";
import { AddBucketModal } from "./AddBucketModal";
import { EditAccountModal } from "./EditAccountModal";

export default function SettingsAccountsSummaryPage() {
  const {
    accounts,
    bucketsByAccount,
    loading,
    error,
    totalAccountsBalance,
    TotalDebitBalance,
    TotalCreditBalance,
    createAccount,
    createBucket,
    deleteAccountHook, // <-- assume your hook exposes this (or wire your api here)
  } = useAccountsSummary();

  const [showAddAccount, setShowAddAccount] = useState(false);
  const [addBucketForAccountId, setAddBucketForAccountId] = useState<string | null>(null);

  const [editAccountOpen, setEditAccountOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  const selectedAccount: BankAccount | null = useMemo(() => {
    if (!selectedAccountId) return null;
    return accounts.find((a) => a.id === selectedAccountId) ?? null;
  }, [accounts, selectedAccountId]);

  function openEditModal(account: BankAccount) {
    setSelectedAccountId(account.id);
    setEditAccountOpen(true);
  }

  function closeEditModal() {
    setEditAccountOpen(false);
    setSelectedAccountId(null);
  }

  if (loading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Accounts</h1>
          <p className="text-sm text-gray-500">Your accounts and the buckets inside each account.</p>

          <div className="grid grid-cols-[max-content_max-content] gap-x-1">
            <span>Total Debit:</span>
            <span className="text-right font-mono tabular-nums">{money(TotalDebitBalance)}</span>

            <span>Total Credit:</span>
            <span className="text-right font-mono tabular-nums">{money(TotalCreditBalance)}</span>

            <span>Net Balance:</span>
            <span className="text-right font-mono tabular-nums">{money(totalAccountsBalance)}</span>
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
              onEditAccount={openEditModal}
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

      <EditAccountModal
        open={editAccountOpen}
        account={selectedAccount}
        onClose={closeEditModal}
        onDelete={async (accountId) => {
          await deleteAccountHook(accountId); // or call your api + local state update
          closeEditModal();
        }}
      />
    </div>
  );
}

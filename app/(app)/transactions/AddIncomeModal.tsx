"use client";

import { useMemo, useState } from "react";
import type { BankAccount } from "@/features/accounts/types";
import { money } from "@/features/accounts/types";
import { Modal } from "@/features/universal/Modal";

export type CreateIncomeTx = {
  date: string;          // YYYY-MM-DD
  description?: string;
  accountName: string;
  amount: number;        // positive number
};

export function AddIncomeModal(props: {
  accounts: BankAccount[];
  defaultAccountId?: string;
  onClose: () => void;
  onCreate: (payload: CreateIncomeTx) => Promise<void> | void;
}) {
  const { accounts, defaultAccountId, onClose, onCreate } = props;

  const debitAccounts = useMemo(
    () => accounts.filter((a) => a.creditOrDebit === "DEBIT"),
    [accounts]
  );

  const [date, setDate] = useState(() => {
    const d = new Date();
    // YYYY-MM-DD for <input type="date">
    return d.toISOString().slice(0, 10);
  });

  const [description, setDescription] = useState("");
  const [accountId, setAccountId] = useState(
    defaultAccountId && debitAccounts.some((a) => a.id === defaultAccountId)
      ? defaultAccountId
      : debitAccounts[0]?.id ?? ""
  );

  const [amount, setAmount] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const selectedAccount = debitAccounts.find((a) => a.id === accountId);

  const parsedAmount = Number(amount);
  const canSave =
    !saving &&
    date.trim().length > 0 &&
    accountId.trim().length > 0 &&
    Number.isFinite(parsedAmount) &&
    parsedAmount > 0;

  return (
    <Modal title="Add income" onClose={onClose}>
      <div className="space-y-4">
        {/* Date */}
        <label className="block text-sm">
          <div className="text-gray-600 mb-1">Date</div>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl border px-3 py-2"
          />
        </label>

        {/* Description */}
        <label className="block text-sm">
          <div className="text-gray-600 mb-1">Description</div>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border px-3 py-2"
            placeholder="e.g., Paycheque, Refund, Gift..."
          />
        </label>

        {/* Account */}
        <label className="block text-sm">
          <div className="text-gray-600 mb-1">Account</div>
          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className="w-full rounded-xl border px-3 py-2"
          >
            {debitAccounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>

          {/* Helper text */}
          <div className="mt-1 text-xs text-gray-500">
            Income is added to this account and starts as <span className="font-medium">Unallocated</span>.
            {selectedAccount ? (
              <>
                {" "}Current balance: <span className="font-medium">{money(selectedAccount.balance)}</span>
              </>
            ) : null}
          </div>
        </label>

        {/* Amount */}
        <label className="block text-sm">
          <div className="text-gray-600 mb-1">Amount</div>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-xl border px-3 py-2"
            inputMode="decimal"
            placeholder="e.g., 2500.00"
          />
          <div className="mt-1 text-xs text-gray-500">Stored as positive (income).</div>
        </label>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="rounded-xl px-4 py-2 border">
            Cancel
          </button>
          <button
            disabled={!canSave}
            onClick={async () => {
              setSaving(true);
              try {
                await onCreate({
                  date,
                  description: description.trim() || undefined,
                   accountName: selectedAccount ? selectedAccount.name : "",
                  amount: parsedAmount,
                });
              } finally {
                setSaving(false);
              }
            }}
            className="rounded-xl px-4 py-2 bg-black text-white disabled:opacity-40"
          >
            Add
          </button>
        </div>
      </div>
    </Modal>
  );
}
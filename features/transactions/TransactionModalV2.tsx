"use client";

import { useEffect, useMemo, useRef } from "react";
import type { BankAccount, Bucket } from "@/features/accounts/types";

export type TxKind = "EXPENSE" | "INCOME" | "TRANSFER";

export type TxModalValue = {
  mode: "add" | "edit";
  editingId?: string;

  kind: TxKind;

  date: string;
  description: string;
  amount: string;

  // income/expense
  accountId?: string;
  bucketId?: string | "UNALLOCATED" | null;

  // transfer
  fromAccountId?: string;
  toAccountId?: string;
  reduceFromBucketId?: string | "UNALLOCATED" | null;
};

export type TxModalSubmit =
  | {
      kind: "INCOME";
      date: string;
      description: string;
      accountId: string;
      amount: number;
      bucketId: string | "UNALLOCATED";
    }
  | {
      kind: "EXPENSE";
      date: string;
      description: string;
      accountId: string;
      amount: number;
      bucketId: string | "UNALLOCATED" | null;
    }
  | {
      kind: "TRANSFER";
      date: string;
      description: string;
      fromAccountId: string;
      toAccountId: string;
      amount: number;
      reduceFromBucketId: string | "UNALLOCATED" | null;
    };

export function TransactionModalV2(props: {
  open: boolean;
  value: TxModalValue;
  bankAccounts: BankAccount[];
  buckets: Bucket[];
  onClose: () => void;
  onChange: (next: TxModalValue) => void;
  onSubmit: (payload: TxModalSubmit) => Promise<void> | void;
}) {
  const { open, value, onClose, onChange, bankAccounts, buckets, onSubmit } = props;
  if (!open) return null;

  const byId = useMemo(() => new Map(bankAccounts.map((a) => [String(a.id), a])), [bankAccounts]);

  const debitAccounts = useMemo(
    () => bankAccounts.filter((a) => a.creditOrDebit === "DEBIT"),
    [bankAccounts]
  );

  const amountNum = Number(value.amount);

  const selectedAccount = value.accountId ? byId.get(String(value.accountId)) : undefined;
  const selectedIsDebit = selectedAccount?.creditOrDebit === "DEBIT";
  const selectedIsCredit = selectedAccount?.creditOrDebit === "CREDIT";

  const fromAccount = value.fromAccountId ? byId.get(String(value.fromAccountId)) : undefined;
  const fromIsDebit = fromAccount?.creditOrDebit === "DEBIT";

  const bucketAllowed = value.kind === "INCOME" || (value.kind === "EXPENSE" && selectedIsDebit);

  // remember last selections per kind (this fixes your “toggle back” issue)
  const lastExpenseRef = useRef<{ accountId?: string; bucketId?: TxModalValue["bucketId"] }>({});
  const lastIncomeRef = useRef<{ accountId?: string; bucketId?: TxModalValue["bucketId"] }>({});

  // Filter buckets by accountId (string-safe)
  const bucketsForAccount = useMemo(() => {
    const acctId = value.accountId;
    if (!acctId) return [];
    return buckets.filter((b) => String(b.bankAccountId) === String(acctId));
  }, [buckets, value.accountId]);

  const bucketsForFromAccount = useMemo(() => {
    const acctId = value.fromAccountId;
    if (!acctId) return [];
    return buckets.filter((b) => String(b.bankAccountId) === String(acctId));
  }, [buckets, value.fromAccountId]);

  // init defaults on open
  useEffect(() => {
    if (!open) return;

    // ensure some kind default account exists
    if (value.kind === "EXPENSE") {
      if (!value.accountId) {
        const fallback = bankAccounts[0]?.id ? String(bankAccounts[0].id) : "";
        if (!fallback) return;

        const acc = byId.get(fallback);
        const isDebit = acc?.creditOrDebit === "DEBIT";

        onChange({
          ...value,
          accountId: fallback,
          bucketId: isDebit ? "UNALLOCATED" : null,
        });
      }
      return;
    }

    if (value.kind === "INCOME") {
      const current = value.accountId ? byId.get(String(value.accountId)) : undefined;
      const needsDebit = !current || current.creditOrDebit !== "DEBIT";
      const fallback = debitAccounts[0]?.id ? String(debitAccounts[0].id) : "";

      if (needsDebit && fallback) {
        onChange({ ...value, accountId: fallback, bucketId: "UNALLOCATED" });
        return;
      }

      if (!value.bucketId) onChange({ ...value, bucketId: "UNALLOCATED" });
      return;
    }

    // TRANSFER: leave your existing logic mostly alone
    if (value.kind === "TRANSFER") {
      const defaultFrom =
        value.fromAccountId ??
        (debitAccounts[0]?.id
          ? String(debitAccounts[0].id)
          : bankAccounts[0]?.id
          ? String(bankAccounts[0].id)
          : "");

      if (!defaultFrom) return;

      const defaultTo =
        value.toAccountId && String(value.toAccountId) !== String(defaultFrom)
          ? String(value.toAccountId)
          : bankAccounts.find((a) => String(a.id) !== String(defaultFrom))?.id
          ? String(bankAccounts.find((a) => String(a.id) !== String(defaultFrom))!.id)
          : "";

      const isDebit = byId.get(String(defaultFrom))?.creditOrDebit === "DEBIT";

      if (!value.fromAccountId || !value.toAccountId) {
        onChange({
          ...value,
          fromAccountId: defaultFrom,
          toAccountId: defaultTo,
          reduceFromBucketId: isDebit ? "UNALLOCATED" : null,
        });
      }
    }
  }, [open]); // intentionally only on open

  // enforce bucket rules when account/kind changes
  useEffect(() => {
    if (!open) return;

    if (value.kind === "EXPENSE" && selectedIsCredit) {
      if (value.bucketId !== null) onChange({ ...value, bucketId: null });
      return;
    }

    if (bucketAllowed) {
      if (!value.bucketId) onChange({ ...value, bucketId: "UNALLOCATED" });
    }
  }, [open, value.kind, value.accountId, selectedIsCredit, bucketAllowed]);

  const canSubmit = (() => {
    if (!value.date) return false;
    if (!Number.isFinite(amountNum) || amountNum <= 0) return false;

    if (value.kind === "INCOME") {
      if (!value.accountId) return false;
      const acc = byId.get(String(value.accountId));
      if (!acc || acc.creditOrDebit !== "DEBIT") return false;
      return !!value.bucketId;
    }

    if (value.kind === "EXPENSE") {
      if (!value.accountId) return false;
      const acc = byId.get(String(value.accountId));
      if (!acc) return false;
      return true;
    }

    if (!value.fromAccountId || !value.toAccountId) return false;
    if (String(value.fromAccountId) === String(value.toAccountId)) return false;
    if (fromIsDebit) return !!(value.reduceFromBucketId ?? "UNALLOCATED");
    return true;
  })();

  async function handleSubmit() {
    if (!canSubmit) return;

    const description = value.description.trim();

    if (value.kind === "INCOME") {
      await onSubmit({
        kind: "INCOME",
        date: value.date,
        description,
        accountId: String(value.accountId!),
        amount: amountNum,
        bucketId: (value.bucketId ?? "UNALLOCATED") as any,
      });
      return;
    }

    if (value.kind === "EXPENSE") {
      const acc = byId.get(String(value.accountId!));
      const isDebit = acc?.creditOrDebit === "DEBIT";

      await onSubmit({
        kind: "EXPENSE",
        date: value.date,
        description,
        accountId: String(value.accountId!),
        amount: amountNum,
        bucketId: isDebit ? ((value.bucketId ?? "UNALLOCATED") as any) : null,
      });
      return;
    }

    await onSubmit({
      kind: "TRANSFER",
      date: value.date,
      description,
      fromAccountId: String(value.fromAccountId!),
      toAccountId: String(value.toAccountId!),
      amount: amountNum,
      reduceFromBucketId: fromIsDebit ? ((value.reduceFromBucketId ?? "UNALLOCATED") as any) : null,
    });
  }

  function setKind(nextKind: TxKind) {
    // remember current selection before leaving a tab
    if (value.kind === "EXPENSE") {
      lastExpenseRef.current = { accountId: value.accountId, bucketId: value.bucketId };
    }
    if (value.kind === "INCOME") {
      lastIncomeRef.current = { accountId: value.accountId, bucketId: value.bucketId };
    }

    if (nextKind === "INCOME") {
      const remembered = lastIncomeRef.current.accountId;
      const rememberedAcc = remembered ? byId.get(String(remembered)) : undefined;

      const defaultDebit =
        rememberedAcc?.creditOrDebit === "DEBIT"
          ? String(remembered!)
          : debitAccounts[0]?.id
          ? String(debitAccounts[0].id)
          : "";

      onChange({
        ...value,
        kind: "INCOME",
        accountId: defaultDebit,
        bucketId: "UNALLOCATED",
        fromAccountId: undefined,
        toAccountId: undefined,
        reduceFromBucketId: null,
      });
      return;
    }

    if (nextKind === "EXPENSE") {
      // restore what user had selected on EXPENSE (this is the missing piece)
      const rememberedAccId =
        lastExpenseRef.current.accountId ??
        (bankAccounts[0]?.id ? String(bankAccounts[0].id) : "");

      const acc = rememberedAccId ? byId.get(String(rememberedAccId)) : undefined;
      const isDebit = acc?.creditOrDebit === "DEBIT";

      onChange({
        ...value,
        kind: "EXPENSE",
        accountId: rememberedAccId,
        bucketId: isDebit ? (lastExpenseRef.current.bucketId ?? "UNALLOCATED") : null,
        fromAccountId: undefined,
        toAccountId: undefined,
        reduceFromBucketId: null,
      });
      return;
    }

    // TRANSFER
    const defaultFrom =
      value.fromAccountId ??
      (debitAccounts[0]?.id
        ? String(debitAccounts[0].id)
        : bankAccounts[0]?.id
        ? String(bankAccounts[0].id)
        : "");

    const defaultTo =
      value.toAccountId && String(value.toAccountId) !== String(defaultFrom)
        ? String(value.toAccountId)
        : bankAccounts.find((a) => String(a.id) !== String(defaultFrom))?.id
        ? String(bankAccounts.find((a) => String(a.id) !== String(defaultFrom))!.id)
        : "";

    const isDebit = byId.get(String(defaultFrom))?.creditOrDebit === "DEBIT";

    onChange({
      ...value,
      kind: "TRANSFER",
      accountId: undefined,
      bucketId: null,
      fromAccountId: defaultFrom,
      toAccountId: defaultTo,
      reduceFromBucketId: isDebit ? (value.reduceFromBucketId ?? "UNALLOCATED") : null,
    });
  }

  return (
    <Modal title={value.mode === "add" ? "Add transaction" : "Edit transaction"} onClose={onClose}>
      <div className="space-y-4">
        {/* Date + Type */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <div className="text-gray-600 mb-1">Date</div>
            <input
              type="date"
              value={value.date}
              onChange={(e) => onChange({ ...value, date: e.target.value })}
              className="w-full rounded-xl border px-3 py-2"
            />
          </label>

          <div className="block text-sm">
            <div className="text-gray-600 mb-1">Type</div>
            <div className="flex flex-wrap gap-2">
              <TypePill active={value.kind === "EXPENSE"} onClick={() => setKind("EXPENSE")}>
                Expense
              </TypePill>
              <TypePill active={value.kind === "INCOME"} onClick={() => setKind("INCOME")}>
                Income
              </TypePill>
              <TypePill active={value.kind === "TRANSFER"} onClick={() => setKind("TRANSFER")}>
                Transfer
              </TypePill>
            </div>
          </div>
        </div>

        {/* Description */}
        <label className="block text-sm">
          <div className="text-gray-600 mb-1">Description</div>
          <input
            value={value.description}
            onChange={(e) => onChange({ ...value, description: e.target.value })}
            className="w-full rounded-xl border px-3 py-2"
            placeholder="e.g., Loblaws, Paycheque, Transfer..."
          />
        </label>

        {/* Kind-specific fields */}
        {value.kind === "TRANSFER" ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <div className="text-gray-600 mb-1">From account</div>
              <select
                value={value.fromAccountId ?? ""}
                onChange={(e) => {
                  const nextFrom = e.target.value;
                  const nextFromAcc = byId.get(String(nextFrom));
                  const isDebit = nextFromAcc?.creditOrDebit === "DEBIT";

                  onChange({
                    ...value,
                    fromAccountId: nextFrom,
                    reduceFromBucketId: isDebit ? "UNALLOCATED" : null,
                    toAccountId:
                      value.toAccountId && String(value.toAccountId) !== String(nextFrom)
                        ? value.toAccountId
                        : bankAccounts.find((a) => String(a.id) !== String(nextFrom))?.id
                        ? String(bankAccounts.find((a) => String(a.id) !== String(nextFrom))!.id)
                        : "",
                  });
                }}
                className="w-full rounded-xl border px-3 py-2"
              >
                {bankAccounts.map((a) => (
                  <option key={String(a.id)} value={String(a.id)}>
                    {a.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm">
              <div className="text-gray-600 mb-1">To account</div>
              <select
                value={value.toAccountId ?? ""}
                onChange={(e) => onChange({ ...value, toAccountId: e.target.value })}
                className="w-full rounded-xl border px-3 py-2"
              >
                {bankAccounts
                  .filter((a) => String(a.id) !== String(value.fromAccountId))
                  .map((a) => (
                    <option key={String(a.id)} value={String(a.id)}>
                      {a.name}
                    </option>
                  ))}
              </select>
            </label>

            {fromIsDebit && (
              <label className="block text-sm sm:col-span-2">
                <div className="text-gray-600 mb-1">Reduce from</div>
                <select
                  value={value.reduceFromBucketId ?? "UNALLOCATED"}
                  onChange={(e) => onChange({ ...value, reduceFromBucketId: e.target.value as any })}
                  className="w-full rounded-xl border px-3 py-2"
                >
                  <option value="UNALLOCATED">Unallocated</option>
                  {bucketsForFromAccount.map((b) => (
                    <option key={String(b.id)} value={String(b.id)}>
                      {b.name}
                    </option>
                  ))}
                </select>
                <div className="mt-1 text-xs text-gray-500">
                  Transfer out of a debit account reduces Unallocated or a bucket.
                </div>
              </label>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* Account */}
            <label className="block text-sm">
              <div className="text-gray-600 mb-1">Account</div>
              <select
                value={value.accountId ?? ""}
                onChange={(e) => {
                  const nextId = e.target.value;
                  const nextAcc = byId.get(String(nextId));
                  const nextIsDebit = nextAcc?.creditOrDebit === "DEBIT";

                  onChange({
                    ...value,
                    accountId: nextId,
                    bucketId:
                      value.kind === "INCOME"
                        ? (value.bucketId ?? "UNALLOCATED")
                        : nextIsDebit
                        ? (value.bucketId ?? "UNALLOCATED")
                        : null,
                  });
                }}
                className="w-full rounded-xl border px-3 py-2"
              >
                {(value.kind === "INCOME" ? debitAccounts : bankAccounts).map((a) => (
                  <option key={String(a.id)} value={String(a.id)}>
                    {a.name}
                  </option>
                ))}
              </select>

              {value.kind === "INCOME" && (
                <div className="mt-1 text-xs text-gray-500">Income can only be added to debit accounts.</div>
              )}
            </label>

            {/* Bucket */}
            {bucketAllowed ? (
              <label className="block text-sm">
                <div className="text-gray-600 mb-1">
                  {value.kind === "INCOME" ? "Put into bucket" : "Spend from bucket"}
                </div>
                <select
                  value={(value.bucketId ?? "UNALLOCATED") as any}
                  onChange={(e) =>
                    onChange({ ...value, bucketId: (e.target.value as any) || "UNALLOCATED" })
                  }
                  className="w-full rounded-xl border px-3 py-2"
                >
                  <option value="UNALLOCATED">Unallocated</option>
                  {bucketsForAccount.map((b) => (
                    <option key={String(b.id)} value={String(b.id)}>
                      {b.name}
                    </option>
                  ))}
                </select>

                {value.kind === "EXPENSE" && (
                  <div className="mt-1 text-xs text-gray-500">
                    Choose Unallocated to spend from cash not assigned.
                  </div>
                )}
              </label>
            ) : (
              <div className="text-sm text-gray-500 flex items-end">
                {value.kind === "EXPENSE" ? (
                  <div className="rounded-xl border px-3 py-2 w-full bg-gray-50">
                    Buckets don’t apply to credit accounts.
                  </div>
                ) : null}
              </div>
            )}
          </div>
        )}

        {/* Amount */}
        <label className="block text-sm">
          <div className="text-gray-600 mb-1">Amount</div>
          <input
            value={value.amount}
            onChange={(e) => onChange({ ...value, amount: e.target.value })}
            className="w-full rounded-xl border px-3 py-2"
            inputMode="decimal"
            placeholder="e.g., 45.99"
          />
          <div className="mt-1 text-xs text-gray-500">
            Stored as: {value.kind === "EXPENSE" ? "negative (expense)" : "positive"}
          </div>
        </label>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="rounded-xl px-4 py-2 border">
            Cancel
          </button>
          <button
            disabled={!canSubmit}
            onClick={handleSubmit}
            className="rounded-xl px-4 py-2 bg-black text-white disabled:opacity-40"
          >
            {value.mode === "add" ? "Add" : "Save"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function TypePill(props: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className={[
        "rounded-xl px-3 py-2 border text-sm font-semibold whitespace-nowrap",
        props.active ? "bg-slate-900 text-white border-slate-900" : "bg-white hover:bg-gray-50",
      ].join(" ")}
    >
      {props.children}
    </button>
  );
}

function Modal(props: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-lg">
        <div className="flex items-center justify-between border-b p-4">
          <div className="font-semibold">{props.title}</div>
          <button onClick={props.onClose} className="rounded-lg px-2 py-1 hover:bg-gray-100">
            ✕
          </button>
        </div>
        <div className="p-4">{props.children}</div>
      </div>
    </div>
  );
}

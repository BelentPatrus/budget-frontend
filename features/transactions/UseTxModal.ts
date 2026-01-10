"use client";

import { useCallback, useState } from "react";

export type TxKind = "EXPENSE" | "INCOME" | "TRANSFER";

export type TxModalState =
  | { open: false }
  | {
      open: true;
      mode: "add" | "edit";
      editingId?: string;

      kind: TxKind;

      // shared
      date: string; // YYYY-MM-DD
      description: string;

      // expense/income
      accountId?: string; // for INCOME/EXPENSE
      bucketId?: string | null; // for EXPENSE only (debit accounts only)
      amount: string; // store as string for input

      // transfer
      fromAccountId?: string;
      toAccountId?: string;
      reduceFromBucketId?: string | "UNALLOCATED" | null; // only for debit FROM accounts
    };

function todayYmd() {
  return new Date().toISOString().slice(0, 10);
}

export function useTxModal() {
  const [state, setState] = useState<TxModalState>({ open: false });

  const openAdd = useCallback((kind: TxKind) => {
    setState({
      open: true,
      mode: "add",
      kind,
      date: todayYmd(),
      description: "",
      amount: "",
      bucketId: null,
      reduceFromBucketId: "UNALLOCATED",
    });
  }, []);

  const openEdit = useCallback((args: Omit<Extract<TxModalState, { open: true }>, "open" | "mode"> & { editingId: string }) => {
    setState({
      open: true,
      mode: "edit",
      editingId: args.editingId,
      kind: args.kind,
      date: args.date,
      description: args.description,
      amount: args.amount,
      accountId: args.accountId,
      bucketId: args.bucketId ?? null,
      fromAccountId: args.fromAccountId,
      toAccountId: args.toAccountId,
      reduceFromBucketId: args.reduceFromBucketId ?? "UNALLOCATED",
    });
  }, []);

  const close = useCallback(() => setState({ open: false }), []);

  const patch = useCallback((partial: Partial<Extract<TxModalState, { open: true }>>) => {
    setState((prev) => {
      if (!prev.open) return prev;
      return { ...prev, ...partial };
    });
  }, []);

  return { state, openAdd, openEdit, close, patch };
}

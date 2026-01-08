import { useState } from "react";
import { Modal } from "./Modal";
import type { CreateAccount, CreditOrDebit } from "@/features/accounts/types";

export function AddAccountModal(props: { onClose: () => void; onCreate: (payload: CreateAccount) => Promise<void> | void }) {
  const [name, setName] = useState("");
  const [creditOrDebit, setCreditOrDebit] = useState<CreditOrDebit>("DEBIT");
  const [balance, setBalance] = useState<string>("0");
  const [saving, setSaving] = useState(false);
  const canSave = name.trim().length > 0 && !saving;

  return (
    <Modal title="Add bank account" onClose={props.onClose}>
      <div className="space-y-3">
        <label className="block text-sm">
          <div className="text-gray-600 mb-1">Name</div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border px-3 py-2"
            placeholder="TD Chequing"
          />
        </label>

        <label className="block text-sm">
          <div className="text-gray-600 mb-1">Credit or debit</div>
          <select
            value={creditOrDebit}
            onChange={(e) => setCreditOrDebit(e.target.value as CreditOrDebit)}
            className="w-full rounded-xl border px-3 py-2"
          >
            <option value="DEBIT">DEBIT</option>
            <option value="CREDIT">CREDIT</option>
          </select>
        </label>

        <label className="block text-sm">
          <div className="text-gray-600 mb-1">Starting balance</div>
          <input
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            className="w-full rounded-xl border px-3 py-2"
            inputMode="decimal"
          />
        </label>

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={props.onClose} className="rounded-xl px-4 py-2 border">
            Cancel
          </button>
          <button
            disabled={!canSave}
            onClick={async () => {
              setSaving(true);
              try {
                await props.onCreate({
                  name: name.trim(),
                  creditOrDebit,
                  balance: Number(balance || 0),
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

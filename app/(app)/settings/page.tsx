"use client";

import { useEffect, useMemo, useState } from "react";
import { addAccount, addBucket, fetchAccounts, fetchBuckets } from "@/features/accounts/api";
import type { BankAccount, Bucket, CreateAccount, CreateBucket, CreditOrDebit } from "@/features/accounts/types";

function money(n: number) {
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(n || 0);
}

// Your backend DTOs might not match these exactly.
// This mapping is defensive so you don't end up calling /undefined/buckets again.
function toAccount(a: any): BankAccount {
  const id = a?.id ?? a?.accountId ?? a?.bankAccountId;
  return {
    id: id != null ? String(id) : "",
    name: String(a?.name ?? a?.accountName ?? "(Unnamed account)"),
    creditOrDebit: (a?.creditOrDebit ?? a?.credit_or_debit ?? "DEBIT") as CreditOrDebit,
    balance: Number(a?.balance ?? 0),
  };
}

function toBucket(b: any): Bucket {
  const id = b?.id ?? b?.bucketId;
  const bankAccountId = b?.bankAccountId ?? b?.bank_account_id ?? b?.bankAccount?.id;
  return {
    id: id != null ? String(id) : "",
    name: String(b?.name ?? b?.bucketName ?? "(Unnamed bucket)"),
    balance: Number(b?.balance ?? 0),
    bankAccountId: bankAccountId != null ? String(bankAccountId) : "",
  };
}

export default function SettingsAccountsSummaryPage() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [bucketsByAccount, setBucketsByAccount] = useState<Record<string, Bucket[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showAddAccount, setShowAddAccount] = useState(false);
  const [addBucketForAccountId, setAddBucketForAccountId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const raw = await fetchAccounts();
        const accs = (Array.isArray(raw) ? raw : []).map(toAccount).filter((a) => a.id);

        if (cancelled) return;

        setAccounts(accs);

        // Load buckets per account, but ONLY for valid ids (prevents /undefined/buckets)
        const entries = await Promise.all(
          accs.map(async (a) => {
            try {
              const rawBuckets = await fetchBuckets(a.id);
              const buckets = (Array.isArray(rawBuckets) ? rawBuckets : []).map(toBucket);
              return [a.id, buckets] as const;
            } catch (e) {
              // If one account fails, don't nuke the whole page
              return [a.id, [] as Bucket[]] as const;
            }
          })
        );

        if (cancelled) return;

        setBucketsByAccount(Object.fromEntries(entries));
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message ?? "Failed to load accounts");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  async function onCreateAccount(payload: CreateAccount) {
    const createdRaw = await addAccount(payload);
    const created = toAccount(createdRaw);
    if (!created.id) return;

    setAccounts((prev) => [created, ...prev]);
    setBucketsByAccount((prev) => ({ ...prev, [created.id]: [] }));
    setShowAddAccount(false);
  }

  async function onCreateBucket(accountId: string, payload: CreateBucket) {
    if (!accountId) return;

    const createdRaw = await addBucket(accountId, payload);
    const created = toBucket(createdRaw);

    setBucketsByAccount((prev) => ({
      ...prev,
      [accountId]: created.id ? [created, ...(prev[accountId] ?? [])] : (prev[accountId] ?? []),
    }));
    setAddBucketForAccountId(null);
  }

  const totalAccountsBalance = useMemo(
    () => accounts.reduce((s, a) => s + (a.balance || 0), 0),
    [accounts]
  );

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

      {showAddAccount && <AddAccountModal onClose={() => setShowAddAccount(false)} onCreate={onCreateAccount} />}

      {addBucketForAccountId && (
        <AddBucketModal
          accountName={accounts.find((x) => x.id === addBucketForAccountId)?.name ?? "Account"}
          onClose={() => setAddBucketForAccountId(null)}
          onCreate={(payload) => onCreateBucket(addBucketForAccountId, payload)}
        />
      )}
    </div>
  );
}

function AccountCard(props: { account: BankAccount; buckets: Bucket[]; onAddBucket: () => void }) {
  const { account, buckets } = props;

  const bucketsTotal = useMemo(() => buckets.reduce((s, b) => s + (b.balance || 0), 0), [buckets]);

  return (
    <div className="rounded-2xl border bg-white shadow-sm">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">{account.name}</h2>
            <span className="text-xs rounded-full border px-2 py-0.5 text-gray-600">{account.creditOrDebit}</span>
          </div>
          <div className="text-sm text-gray-600">
            Account balance: <span className="font-medium text-gray-900">{money(account.balance)}</span>
            <span className="mx-2 text-gray-300">•</span>
            Buckets total: <span className="font-medium text-gray-900">{money(bucketsTotal)}</span>
          </div>
        </div>

        <button onClick={props.onAddBucket} className="rounded-xl px-3 py-2 border hover:bg-gray-50">
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
                  <td className="py-2 text-right font-medium">{money(b.balance)}</td>
                </tr>
              ))}
              <tr>
                <td className="py-2 font-semibold">Total</td>
                <td className="py-2 text-right font-semibold">{money(bucketsTotal)}</td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function AddAccountModal(props: { onClose: () => void; onCreate: (payload: CreateAccount) => Promise<void> | void }) {
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

function AddBucketModal(props: {
  accountName: string;
  onClose: () => void;
  onCreate: (payload: CreateBucket) => Promise<void> | void;
}) {
  const [name, setName] = useState("");
  const [balance, setBalance] = useState<string>("0");
  const [saving, setSaving] = useState(false);
  const canSave = name.trim().length > 0 && !saving;

  return (
    <Modal title={`Add bucket to ${props.accountName}`} onClose={props.onClose}>
      <div className="space-y-3">
        <label className="block text-sm">
          <div className="text-gray-600 mb-1">Bucket name</div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border px-3 py-2"
            placeholder="Emergency Fund"
          />
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

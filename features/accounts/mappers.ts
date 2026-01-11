import type { BankAccount, Bucket, CreditOrDebit } from "./types";

export function toAccount(a: any): BankAccount {
  const id = a?.id ?? a?.accountId ?? a?.bankAccountId;
  return {
    id: id != null ? String(id) : "",
    name: String(a?.name ?? a?.accountName ?? "(Unnamed account)"),
    creditOrDebit: (a?.creditOrDebit ?? a?.credit_or_debit ?? "DEBIT") as CreditOrDebit,
    balance: Number(a?.balance ?? 0),
    status: (a?.status ?? "ACTIVE") as "ACTIVE" | "ARCHIVED",
  };
}

export function toBucket(b: any): Bucket {
  const id = b?.id ?? b?.bucketId;
  const bankAccountId = b?.bankAccountId ?? b?.bank_account_id ?? b?.bankAccount?.id;
  return {
    id: id != null ? String(id) : "",
    name: String(b?.name ?? b?.bucketName ?? "(Unnamed bucket)"),
    balance: Number(b?.balance ?? 0),
    bankAccountId: bankAccountId != null ? String(bankAccountId) : "",
    bankAccount: String(b?.bankAccount?.name ?? b?.bank_account?.name ?? ""),
  };
}

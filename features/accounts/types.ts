// features/accounts/types.ts
export type CreditOrDebit = "CREDIT" | "DEBIT";

export type BankAccount = {
  id: string;
  name: string;
  creditOrDebit: CreditOrDebit;
  balance: number;
};

export type Bucket = {
  id: string;
  name: string;
  balance: number;
  bankAccountId: string;
};

export type CreateAccount = {
  name: string;
  creditOrDebit: CreditOrDebit;
  balance?: number; // default 0
};

export type CreateBucket = {
  name: string;
  balance?: number; // default 0
};

export function money(n: number) {
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(n || 0);
}

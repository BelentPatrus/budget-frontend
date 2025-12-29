export type Tx = {
  id: string;
  date: string; // YYYY-MM-DD
  merchant: string;
  category: string;
  account: string;
  amount: number; // negative = expense, positive = income
  note?: string;
};

export type Filters = {
  q: string;
  category: string; // "All" or real
  account: string; // "All" or real
  month: string; // "All" or YYYY-MM
};

export type ModalMode = "add" | "edit";

export type FormState = {
  date: string;
  type: "expense" | "income";
  merchant: string;
  category: string;
  account: string;
  amount: string; // positive string input
  note: string;
};

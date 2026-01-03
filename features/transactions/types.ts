export type Tx = {
  id: string;
  date: string; // YYYY-MM-DD
  description: string;
  bucket: string;
  account: string;
  amount: number; // negative = expense, positive = income
};

export type Filters = {
  q: string;
  description: string;
  bucket: string; // "All" or real
  account: string; // "All" or real
  month: string; // "All" or YYYY-MM
};

export type ModalMode = "add" | "edit";

export type FormState = {
  date: string;
  type: "expense" | "income";
  description: string;
  bucket: string;
  account: string;
  amount: string; // positive string input
};

export type Tx = {
  id: string;
  date: string; // YYYY-MM-DD
  category: string;
  amount: number; // negative expense, positive income
};

export type Budget = {
  id: string;
  month: string; // YYYY-MM
  category: string;
  limit: number; // positive
};

export type BudgetModalMode = "add" | "edit";

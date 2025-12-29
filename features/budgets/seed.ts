import type { Budget, Tx } from "./types";

export const seedTxs: Tx[] = [
  { id: "t1", date: "2025-12-27", category: "Groceries", amount: -84.22 },
  { id: "t2", date: "2025-12-27", category: "Gas", amount: -52.1 },
  { id: "t3", date: "2025-12-26", category: "Subscriptions", amount: -11.99 },
  { id: "t4", date: "2025-12-25", category: "Income", amount: 2100.0 },
  { id: "t5", date: "2025-12-24", category: "Dining", amount: -48.75 },
  { id: "t6", date: "2025-12-20", category: "Shopping", amount: -39.99 },
  { id: "t7", date: "2025-11-30", category: "Groceries", amount: -122.8 },
];

export const seedBudgets: Budget[] = [
  { id: "b1", month: "2025-12", category: "Groceries", limit: 500 },
  { id: "b2", month: "2025-12", category: "Dining", limit: 200 },
  { id: "b3", month: "2025-12", category: "Gas", limit: 250 },
];

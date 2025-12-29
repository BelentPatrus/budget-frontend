import type { Tx } from "./types";

export const seedTransactions: Tx[] = [
  { id: "t1", date: "2025-12-27", merchant: "Loblaws", category: "Groceries", account: "TD Chequing", amount: -84.22 },
  { id: "t2", date: "2025-12-27", merchant: "Shell", category: "Gas", account: "TD Visa", amount: -52.1 },
  { id: "t3", date: "2025-12-26", merchant: "Spotify", category: "Subscriptions", account: "TD Visa", amount: -11.99 },
  { id: "t4", date: "2025-12-25", merchant: "Paycheque", category: "Income", account: "TD Chequing", amount: 2100.0 },
  { id: "t5", date: "2025-12-24", merchant: "Kelseys", category: "Dining", account: "TD Visa", amount: -48.75 },
  { id: "t6", date: "2025-12-20", merchant: "Amazon", category: "Shopping", account: "TD Visa", amount: -39.99 },
  { id: "t7", date: "2025-11-30", merchant: "Costco", category: "Groceries", account: "TD Visa", amount: -122.8 },
];

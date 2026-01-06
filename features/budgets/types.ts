export type Tx = {
  id: string;
  date: string; // YYYY-MM-DD
  category: string;

  /**
   * negative = expense
   * positive = income
   */
  amount: number;
};

export type BudgetRuleType = "PERCENT" | "FIXED";

/**
 * Keep this small for now. You can extend later to:
 * - "SCHEDULED" (unlock more by a due date)
 * - "FRONT_LOADED" (unlock extra early)
 */
export type ReleaseRule = "LINEAR" | "NONE";

/**
 * Budget is no longer "a monthly limit".
 * It's a rule for that category in a given month.
 */
export type Budget = {
  id: string;
  month: string; // YYYY-MM
  category: string;

  type: BudgetRuleType;

  /**
   * If type === "PERCENT": percent of income (e.g. 12.5 for 12.5%)
   * If type === "FIXED": fixed monthly amount in dollars
   */
  value: number;

  /**
   * LINEAR = paced by income received so far (your “week 1 can’t spend month total” rule)
   * NONE   = full amount available immediately (useful for rent/subscriptions)
   */
  releaseRule: ReleaseRule;
};

export type BudgetModalMode = "add" | "edit";

export type BudgetType = "EXPENSE" | "BUCKET";

export type Bucket = {
  id: string;
  name: string;
};

export type BudgetRow = {
  id: string;
  name: string;
  type: string; // dollars
  bucketName: string;  // dollars
  planned: number;
  actual: number;
};

export type CreateBudgetPayload = {
  budgetPeriodId: number;
  type: BudgetType;
  name: string;
  planned: number;
  bucketId?: string | null;
};

export type BudgetPeriod = {
  id: number;
  startDate: string;
  endDate: string;
};
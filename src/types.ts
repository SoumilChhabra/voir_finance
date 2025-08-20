export type AccountType = "credit" | "debit" | "cash";

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  last4?: string;
  currency: string; // e.g., 'CAD'
}

export interface Category {
  id: string;
  name: string;
  color?: string; // hex or css color
}

export interface Transaction {
  id: string;
  userId: string; // Add this line
  accountId: string;
  categoryId: string;
  amountCents: number; // store money in cents
  currency: string; // e.g., 'CAD'
  date: string; // ISO date like '2025-08-09'
  merchant?: string;
  notes?: string;
}

export interface BudgetPeriod {
  id: string;
  month: string;
  currency: string;
}

export interface BudgetAllocation {
  id: string;
  period_id: string;
  category_id: string;
  planned_cents: number;
  rollover: boolean;
  is_sinking: boolean;
  carryover_cents: number;
}

export interface Income {
  id: string;
  period_id: string;
  source: string;
  received_at: string;
  amount_cents: number;
  account_id?: string | null;
}

export type DebtType = "owed_to_me" | "i_owe";
export type DebtStatus = "pending" | "partially_paid" | "paid" | "cancelled";

export interface Debt {
  id: string;
  userId: string;
  title: string;
  description?: string;
  amountCents: number;
  currency: string;
  debtType: DebtType;
  personName: string;
  companyName?: string;
  dueDate?: string;
  status: DebtStatus;
  createdAt: string;
  updatedAt: string;
}

export interface NewDebt {
  title: string;
  description?: string;
  amountDollars: string;
  currency?: string;
  debtType: DebtType;
  personName: string;
  companyName?: string;
  dueDate?: string;
}

export interface EditDebt extends NewDebt {
  id: string;
  status: DebtStatus;
}

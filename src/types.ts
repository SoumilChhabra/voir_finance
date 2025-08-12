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
  accountId: string;
  categoryId: string;
  amountCents: number; // store money in cents
  currency: string; // e.g., 'CAD'
  date: string; // ISO date like '2025-08-09'
  merchant?: string;
  notes?: string;
}

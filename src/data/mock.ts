import { Account, Category, Transaction } from "../types";

export const accounts: Account[] = [
  {
    id: "acc_visa",
    name: "Visa",
    type: "credit",
    last4: "1234",
    currency: "CAD",
  },
  { id: "acc_cheq", name: "Chequing", type: "debit", currency: "CAD" },
  { id: "acc_cash", name: "Cash", type: "cash", currency: "CAD" },
];

export const categories: Category[] = [
  { id: "cat_food", name: "Food", color: "#ef4444" },
  { id: "cat_transport", name: "Transport", color: "#3b82f6" },
  { id: "cat_shopping", name: "Shopping", color: "#10b981" },
];

export const transactions: Transaction[] = [
  {
    id: "t1",
    accountId: "acc_visa",
    categoryId: "cat_food",
    amountCents: 1425,
    currency: "CAD",
    date: "2025-08-06",
    merchant: "Subway",
  },
  {
    id: "t2",
    accountId: "acc_cheq",
    categoryId: "cat_transport",
    amountCents: 350,
    currency: "CAD",
    date: "2025-08-07",
    merchant: "TransLink",
  },
  {
    id: "t3",
    accountId: "acc_visa",
    categoryId: "cat_shopping",
    amountCents: 4999,
    currency: "CAD",
    date: "2025-08-08",
    merchant: "London Drugs",
  },
  {
    id: "t4",
    accountId: "acc_cash",
    categoryId: "cat_food",
    amountCents: 975,
    currency: "CAD",
    date: "2025-08-09",
    merchant: "Coffee",
  },
];

export const byId = {
  account: Object.fromEntries(accounts.map((a) => [a.id, a])),
  category: Object.fromEntries(categories.map((c) => [c.id, c])),
};

export function sortedTransactions() {
  // newest first
  return [...transactions].sort((a, b) => b.date.localeCompare(a.date));
}

import { Transaction } from "../types";

export const sortNewest = (a: Transaction, b: Transaction) =>
  b.date.localeCompare(a.date);

export const sumCents = (txns: Transaction[]) =>
  txns.reduce((s, t) => s + t.amountCents, 0);

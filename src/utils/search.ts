// Simple helper to match a transaction against a free-text query.
// Supports tokens like: food  visa  walmart  >50  <=200  =12.5
type Tx = {
  amountCents: number;
  merchant?: string | null;
  notes?: string | null;
  accountId: string;
  categoryId?: string | null;
  currency?: string;
};

type NameMap = Record<string, { name?: string | null } | undefined>;

const norm = (s: string | null | undefined) => (s ?? "").toLowerCase();

function parseAmountToken(token: string) {
  const m = token.match(/^(>=|<=|>|<|=)?\s*([0-9]+(?:\.[0-9]{1,2})?)$/);
  if (!m) return null;
  const op = m[1] ?? "=";
  const cents = Math.round(parseFloat(m[2]) * 100);
  return { op, cents };
}

function cmpAmount(amountCents: number, f: { op: string; cents: number }) {
  const a = Math.abs(amountCents);
  switch (f.op) {
    case ">":
      return a > f.cents;
    case "<":
      return a < f.cents;
    case ">=":
      return a >= f.cents;
    case "<=":
      return a <= f.cents;
    case "=":
    default:
      return a === f.cents;
  }
}

export function txMatchesQuery(
  tx: Tx,
  q: string,
  accountById: NameMap,
  categoryById: NameMap
) {
  const tokens = norm(q).split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return true;

  const hay = [
    norm(tx.merchant),
    norm(tx.notes),
    norm(accountById[tx.accountId]?.name ?? ""),
    norm(tx.categoryId ? categoryById[tx.categoryId]?.name ?? "" : ""),
  ];

  return tokens.every((t) => {
    const amt = parseAmountToken(t);
    if (amt) return cmpAmount(tx.amountCents, amt);
    return hay.some((h) => h.includes(t));
  });
}

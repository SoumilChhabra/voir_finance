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

/* ----- amount filters: >50, <=20, =12.5 ----- */
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
    default:
      return a === f.cents;
  }
}

/* ----- field prefixes: merchant:/m:, note:/n:, acc:/a:, cat:/c:, any:/* ----- */
function splitPrefix(token: string) {
  const m = token.match(/^([a-z*]+):(.*)$/i);
  if (!m) return { field: "merchant" as const, text: token };
  const key = m[1].toLowerCase();
  const text = m[2];
  if (key === "merchant" || key === "m")
    return { field: "merchant" as const, text };
  if (key === "note" || key === "notes" || key === "n")
    return { field: "notes" as const, text };
  if (key === "acc" || key === "account" || key === "a")
    return { field: "account" as const, text };
  if (key === "cat" || key === "category" || key === "c")
    return { field: "category" as const, text };
  if (key === "any" || key === "*") return { field: "any" as const, text };
  return { field: "merchant" as const, text: token };
}

/* ----- word/substring logic ----- */
function includesWord(hay: string, needle: string) {
  const esc = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${esc}\\b`).test(hay);
}
function smartMatch(hay: string, needle: string) {
  // 1–2 characters => whole word only (avoid “hi” matching “something”)
  // ≥3 characters   => substring OK (so “some” matches “something”)
  return needle.length >= 3 ? hay.includes(needle) : includesWord(hay, needle);
}

export function txMatchesQuery(
  tx: Tx,
  q: string,
  accountById: NameMap,
  categoryById: NameMap
) {
  const tokens = Array.from(
    new Set(norm(q).trim().split(/\s+/).filter(Boolean))
  );
  if (tokens.length === 0) return true;

  const fields = {
    merchant: norm(tx.merchant),
    notes: norm(tx.notes),
    account: norm(accountById[tx.accountId]?.name ?? ""),
    category: norm(
      tx.categoryId ? categoryById[tx.categoryId]?.name ?? "" : ""
    ),
  };

  return tokens.every((raw) => {
    const amt = parseAmountToken(raw);
    if (amt) return cmpAmount(tx.amountCents, amt);

    const { field, text } = splitPrefix(raw);
    const x = text.trim().toLowerCase();
    if (!x) return true;

    if (field === "any")
      return (
        smartMatch(fields.merchant, x) ||
        smartMatch(fields.notes, x) ||
        smartMatch(fields.account, x) ||
        smartMatch(fields.category, x)
      );

    return smartMatch(fields[field], x);
  });
}

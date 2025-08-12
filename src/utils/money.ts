export function formatCurrency(amountCents: number, currency = "CAD") {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
  }).format(amountCents / 100);
}

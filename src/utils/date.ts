// Always treat YYYY-MM-DD as a local date

const isoLocal = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

export const parseISODate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1); // local time
};

export const todayISO = () => isoLocal(new Date());

export const addDaysISO = (iso: string, days: number) => {
  const d = parseISODate(iso);
  d.setDate(d.getDate() + days);
  return isoLocal(d);
};

export const startOfMonthISO = (iso?: string) => {
  const d = iso ? parseISODate(iso) : new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
};

export const endOfMonthISO = (iso?: string) => {
  const d = iso ? parseISODate(iso) : new Date();
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return isoLocal(end);
};

export function formatRangeLabel(startISO: string, endISO: string) {
  const s = parseISODate(startISO);
  const e = parseISODate(endISO);
  const short = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  });
  const full = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return startISO === endISO
    ? full.format(s)
    : `${short.format(s)} – ${full.format(e)}`;
}

export const formatDateLocal = (iso: string) =>
  new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(parseISODate(iso));

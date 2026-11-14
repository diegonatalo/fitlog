/**
 * Calendar days are handled as "YYYY-MM-DD" keys in local time, so a day means
 * the same thing no matter the hour. Nothing here reads the current time.
 */

export const WEEKDAY_NAMES = [
  "domingo",
  "segunda-feira",
  "terça-feira",
  "quarta-feira",
  "quinta-feira",
  "sexta-feira",
  "sábado",
];

/** Short names, indexed like Date#getDay. */
export const WEEKDAY_SHORT = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

const pad = (n: number) => String(n).padStart(2, "0");

export function dateKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const KEY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isDateKey(v: unknown): v is string {
  if (typeof v !== "string") return false;
  const m = KEY_RE.exec(v);
  if (!m) return false;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return dateKey(d) === v;
}

export function parseKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(key: string, days: number): string {
  const d = parseKey(key);
  d.setDate(d.getDate() + days);
  return dateKey(d);
}

/** 0 = Sunday … 6 = Saturday. */
export function weekdayOf(key: string): number {
  return parseKey(key).getDay();
}

/** The weeks of a month, Sunday first; days outside the month are null. */
export function monthGrid(year: number, month: number): (string | null)[][] {
  const first = new Date(year, month, 1);
  const total = new Date(year, month + 1, 0).getDate();
  const cells: (string | null)[] = Array.from(
    { length: first.getDay() },
    () => null,
  );
  for (let day = 1; day <= total; day++) {
    cells.push(dateKey(new Date(year, month, day)));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (string | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

/** Moves a { year, month } by whole months, rolling the year over. */
export function shiftMonth(
  year: number,
  month: number,
  delta: number,
): { year: number; month: number } {
  const d = new Date(year, month + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth() };
}

const monthFmt = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric",
});

export function monthLabel(year: number, month: number): string {
  return monthFmt.format(new Date(year, month, 1));
}

const dayFmt = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

export function longDayLabel(key: string): string {
  return dayFmt.format(parseKey(key));
}

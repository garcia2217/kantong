// ─── Currency ─────────────────────────────────────────────────────────────────

const idrFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/**
 * Formats a number as Indonesian Rupiah.
 * e.g. 1500000 → "Rp 1.500.000"
 */
export const formatIDR = (amount: number): string => idrFormatter.format(amount);

/**
 * Formats a compact amount for stat cards where space is limited.
 * e.g. 1500000 → "Rp 1,5 jt" | 8500000 → "Rp 8,5 jt"
 */
export const formatIDRCompact = (amount: number): string => {
  if (Math.abs(amount) >= 1_000_000_000) {
    return `Rp ${(amount / 1_000_000_000).toFixed(1).replace(".", ",")} M`;
  }
  if (Math.abs(amount) >= 1_000_000) {
    return `Rp ${(amount / 1_000_000).toFixed(1).replace(".", ",")} jt`;
  }
  if (Math.abs(amount) >= 1_000) {
    return `Rp ${(amount / 1_000).toFixed(0)} rb`;
  }
  return formatIDR(amount);
};

// ─── Dates ────────────────────────────────────────────────────────────────────

/**
 * Formats an ISO date string for transaction list group headers.
 * e.g. "2026-03-28T12:30:00Z" → "Today" | "Yesterday" | "Fri, 27 Mar"
 */
export const formatTransactionDate = (isoDate: string): string => {
  const date = new Date(isoDate);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (isSameDay(date, today)) return "Today";
  if (isSameDay(date, yesterday)) return "Yesterday";

  return date.toLocaleDateString("en-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
};

/**
 * Formats an ISO date string as a short time.
 * e.g. "2026-03-28T12:30:00Z" → "12:30"
 */
export const formatTime = (isoDate: string): string =>
  new Date(isoDate).toLocaleTimeString("en-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

/**
 * Formats a month/year pair for budget page header.
 * e.g. (2026, 3) → "March 2026"
 */
export const formatMonthYear = (year: number, month: number): string =>
  new Date(year, month - 1, 1).toLocaleDateString("en-ID", {
    month: "long",
    year: "numeric",
  });

/**
 * Returns a short date label for a due date.
 * e.g. "2026-04-30T00:00:00Z" → "30 Apr 2026"
 */
export const formatDueDate = (isoDate: string): string =>
  new Date(isoDate).toLocaleDateString("en-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

// ─── Helpers ──────────────────────────────────────────────────────────────────

const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/**
 * Returns the current year and month as { year, month }.
 */
export const getCurrentYearMonth = (): { year: number; month: number } => {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
};

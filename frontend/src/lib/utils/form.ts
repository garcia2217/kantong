import type { ZodError } from "zod";

/**
 * Converts a ZodError into a flat field→message map.
 * Only captures the first error per field — that's all the UI shows.
 */
export function parseZodErrors(error: ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  error.issues.forEach((issue) => {
    const key = String(issue.path[0] ?? "");
    if (key && !errors[key]) errors[key] = issue.message;
  });
  return errors;
}

/**
 * Converts a YYYY-MM-DD date string into a local datetime string suitable
 * for submission to the API. Preserves the current wall-clock time so
 * same-day transactions sort by creation order.
 *
 * Intentionally omits the Z suffix — the backend receives local time,
 * not UTC. Using .toISOString() here would shift the date for users
 * in UTC+ timezones (e.g. UTC+7 at 1 AM would store the previous day).
 */
export function dateToLocalIso(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${y}-${pad(m)}-${pad(d)}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

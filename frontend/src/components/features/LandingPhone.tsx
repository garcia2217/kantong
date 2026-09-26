import type { CSSProperties } from "react";
import { formatIDR, formatIDRCompact } from "@/src/lib/utils/format";

interface SampleRow {
  icon: string;
  title: string;
  meta: string;
  amount: number;
}

// Sample data only. Rendered on the server, so Intl output can't mismatch.
const BALANCE = 12_450_000;
const BUDGET_LIMIT = 5_000_000;
const BUDGET_SPENT = 3_180_000;
const BUDGET_SHARE = BUDGET_SPENT / BUDGET_LIMIT;

const ROWS: SampleRow[] = [
  { icon: "☕", title: "Kopi susu", meta: "Dining Out · just now", amount: -25_000 },
  { icon: "🛵", title: "Grab ke kantor", meta: "Transport · 08.15", amount: -28_000 },
  { icon: "💰", title: "Gaji", meta: "Salary · 07.00", amount: 8_500_000 },
];

const RING_STYLE = { "--lp-ring-share": BUDGET_SHARE } as CSSProperties;

const PHONE_LABEL =
  "Kantong on a phone with sample data: a balance of Rp 12,450,000, 64% of the monthly budget spent, and a Telegram notification confirming a Rp 25,000 coffee was recorded.";

export function LandingPhone() {
  return (
    <figure className="lp-phone" role="img" aria-label={PHONE_LABEL}>
      <div className="lp-phone__device" aria-hidden="true">
        <div className="lp-phone__screen">
          <p className="lp-phone__status">
            <span>9:41</span>
            <span className="lp-phone__notch" />
            <span>100%</span>
          </p>

          <p className="lp-phone__label">Total balance</p>
          <p className="lp-phone__balance">{formatIDR(BALANCE)}</p>

          <div className="lp-phone__budget">
            <svg className="lp-phone__ring" viewBox="0 0 36 36" style={RING_STYLE}>
              <circle className="lp-phone__ring-track" cx="18" cy="18" r="15.9" />
              <circle className="lp-phone__ring-fill" cx="18" cy="18" r="15.9" pathLength="1" />
            </svg>
            <div className="lp-phone__budget-text">
              <p className="lp-phone__budget-value">{Math.round(BUDGET_SHARE * 100)}% of budget</p>
              <p className="lp-phone__budget-meta">
                {formatIDRCompact(BUDGET_LIMIT - BUDGET_SPENT)} left this month
              </p>
            </div>
          </div>

          <ul className="lp-phone__rows">
            {ROWS.map((row) => (
              <li key={row.title} className="lp-phone__row">
                <span className="lp-phone__row-icon">{row.icon}</span>
                <span className="lp-phone__row-text">
                  <span className="lp-phone__row-title">{row.title}</span>
                  <span className="lp-phone__row-meta">{row.meta}</span>
                </span>
                <span
                  className={`lp-phone__row-amount ${row.amount > 0 ? "lp-phone__row-amount--in" : ""}`}
                >
                  {row.amount > 0 ? "+" : "−"}
                  {formatIDR(Math.abs(row.amount))}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="lp-phone__toast" aria-hidden="true">
        <span className="lp-phone__toast-icon">✈️</span>
        <span>
          <span className="lp-phone__toast-title">Kantong bot · now</span>
          <span className="lp-phone__toast-body">
            ✅ Kopi susu, {formatIDR(25_000)} recorded to Dining Out
          </span>
        </span>
      </div>
    </figure>
  );
}

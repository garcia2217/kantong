"use client";

import type { Category, Transaction } from "@/src/types";
import { StatCard } from "@/src/components/ui/StatCard";
import { TransactionRow } from "@/src/components/ui/TransactionRow";
import { formatIDRCompact } from "@/src/lib/utils/format";

// Sample data for the signed-out pitch. Dates omit a timezone so the server
// and browser format the same local time and hydration stays consistent.
const SAMPLE_CATEGORIES: Record<string, Category> = {
  dining: { id: "dining", user_id: "demo", name: "Dining Out", type: "expense", created_at: "" },
  salary: { id: "salary", user_id: "demo", name: "Salary", type: "income", created_at: "" },
  transport: { id: "transport", user_id: "demo", name: "Transport", type: "expense", created_at: "" },
};

const SAMPLE_TRANSACTIONS: Transaction[] = [
  {
    id: "tx-1",
    user_id: "demo",
    wallet_id: "demo",
    category_id: "dining",
    amount: 45_000,
    type: "expense",
    description: "Makan siang",
    destination_wallet_id: null,
    transaction_date: "2026-09-25T12:30:00",
    created_at: "",
  },
  {
    id: "tx-2",
    user_id: "demo",
    wallet_id: "demo",
    category_id: "transport",
    amount: 28_000,
    type: "expense",
    description: "Grab ke kantor",
    destination_wallet_id: null,
    transaction_date: "2026-09-25T08:15:00",
    created_at: "",
  },
  {
    id: "tx-3",
    user_id: "demo",
    wallet_id: "demo",
    category_id: "salary",
    amount: 8_500_000,
    type: "income",
    description: "Gaji September",
    destination_wallet_id: null,
    transaction_date: "2026-09-25T07:00:00",
    created_at: "",
  },
];

const SAMPLE_BALANCE = 12_450_000;
const SAMPLE_SPENT = 3_180_000;

const PREVIEW_LABEL =
  "Preview of the Kantong overview with sample data: total balance, spending this month, and recent transactions such as lunch, a ride to the office and a salary payment.";

const noop = (): void => undefined;

export function LoginPreview() {
  return (
    <figure className="login-preview" role="img" aria-label={PREVIEW_LABEL}>
      {/* Decorative sample: rows are real buttons, so keep them out of tab order. */}
      <div className="login-preview__frame" inert>
        <p className="login-preview__caption">Overview · September</p>
        <div className="login-preview__stats">
          <StatCard
            label="Balance"
            value={formatIDRCompact(SAMPLE_BALANCE)}
            subtext="Across 3 wallets"
          />
          <StatCard
            label="Spent"
            value={formatIDRCompact(SAMPLE_SPENT)}
            subtext="64% of monthly budget"
          />
        </div>
        <div className="transactions-list login-preview__list">
          {SAMPLE_TRANSACTIONS.map((tx) => (
            <TransactionRow
              key={tx.id}
              tx={tx}
              category={tx.category_id ? SAMPLE_CATEGORIES[tx.category_id] : undefined}
              onEdit={noop}
            />
          ))}
        </div>
      </div>
    </figure>
  );
}

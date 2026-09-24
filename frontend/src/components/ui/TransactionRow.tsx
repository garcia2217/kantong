"use client";

import type { Category, Transaction } from "@/src/types";
import { formatIDR, formatTime } from "@/src/lib/utils/format";

export const CATEGORY_EMOJI: Record<string, string> = {
  Housing: "🏡",
  Utilities: "⚡",
  Groceries: "🧺",
  Transport: "🛞",
  "Dining Out": "🍱",
  Entertainment: "🍿",
  Shopping: "✨",
  Health: "🌿",
  Travel: "🌴",
  Subscriptions: "🔁",
  "Debt Repayment": "📉",
  Insurance: "🛡️",
  Salary: "💰",
  "Side Hustle": "🚀",
  Investments: "💎",
  Savings: "🍯",
  Gifts: "🎈",
  Fees: "💸",
  Other: "📦",
};

interface TransactionRowProps {
  tx: Transaction;
  category?: Category;
  onEdit: () => void;
}

export function TransactionRow({ tx, category, onEdit }: TransactionRowProps) {
  const isIncome = tx.type === "income";
  const isTransfer = tx.type === "transfer";
  const emoji = category
    ? (CATEGORY_EMOJI[category.name] ?? "•")
    : isTransfer ? "⇄" : "•";
  const amountPrefix = isIncome ? "+" : isTransfer ? "" : "−";
  const amountColor = isIncome
    ? "var(--color-positive)"
    : isTransfer ? "var(--color-text-secondary)" : "var(--color-negative)";

  return (
    <button
      type="button"
      className="tx-row"
      onClick={onEdit}
      aria-label={`${tx.description}, ${tx.type}, ${amountPrefix}${formatIDR(tx.amount)}. View or edit transaction`}
    >
      <span className="tx-row__icon" aria-hidden="true">{emoji}</span>
      <span className="tx-row__details">
        <span className="tx-row__description">{tx.description}</span>
        <span className="tx-row__meta">
          {category?.name ?? (isTransfer ? "Transfer" : "Uncategorized")} · {formatTime(tx.transaction_date)}
        </span>
      </span>
      <span className="tx-row__amount" style={{ color: amountColor }}>
        {amountPrefix}{formatIDR(tx.amount)}
      </span>
      <span className="tx-row__chevron" aria-hidden="true">›</span>
    </button>
  );
}

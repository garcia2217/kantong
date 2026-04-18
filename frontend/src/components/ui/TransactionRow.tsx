import type { Category, Transaction } from "@/src/types";
import { formatIDR, formatTime } from "@/src/lib/utils/format";

// ─── Category emoji mapping ───────────────────────────────────────────────────

export const CATEGORY_EMOJI: Record<string, string> = {
  Housing: "🏠",
  Utilities: "💡",
  Groceries: "🛒",
  Transport: "🚗",
  Entertainment: "🎬",
  Health: "💊",
  Travel: "✈️",
  Subscriptions: "📱",
  "Debt Repayment": "💳",
  Insurance: "🛡️",
  Salary: "💼",
  "Side Hustle": "💻",
  Investments: "📈",
  Savings: "🏦",
  Gifts: "🎁",
  Fees: "🧾",
  Other: "📦",
  Shopping: "🛍️",
  "Dining Out": "🍽️",
};

// ─── Component ────────────────────────────────────────────────────────────────

interface TransactionRowProps {
  tx: Transaction;
  category?: Category;
  onClick?: () => void;
}

export function TransactionRow({ tx, category, onClick }: TransactionRowProps) {
  const isIncome = tx.type === "income";
  const isTransfer = tx.type === "transfer";

  const emoji = category
    ? (CATEGORY_EMOJI[category.name] ?? "•")
    : isTransfer
      ? "⇄"
      : "•";

  const amountPrefix = isIncome ? "+" : isTransfer ? "" : "−";
  const amountColor = isIncome
    ? "var(--color-positive)"
    : "var(--color-text-primary)";

  return (
    <div
      className="tx-row"
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") onClick();
            }
          : undefined
      }
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--space-3)",
        padding: "var(--space-2) var(--space-3)",
        borderRadius: "var(--radius-md)",
        minHeight: 52,
        cursor: onClick ? "pointer" : "default",
      }}
    >
      {/* Category icon */}
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: "var(--radius-md)",
          background: "var(--color-bg-hover)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 13,
          flexShrink: 0,
        }}
      >
        {emoji}
      </div>

      {/* Description + meta */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: "var(--text-base)",
            color: "var(--color-text-primary)",
            fontWeight: "var(--weight-medium)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {tx.description}
        </p>
        <p
          style={{
            fontSize: "var(--text-xs)",
            color: "var(--color-text-tertiary)",
          }}
        >
          {category?.name ?? (isTransfer ? "Transfer" : "—")} ·{" "}
          {formatTime(tx.transaction_date)}
        </p>
      </div>

      {/* Amount */}
      <p
        style={{
          fontSize: "var(--text-sm)",
          color: amountColor,
          fontWeight: "var(--weight-medium)",
          flexShrink: 0,
        }}
      >
        {amountPrefix}
        {formatIDR(tx.amount)}
      </p>
    </div>
  );
}

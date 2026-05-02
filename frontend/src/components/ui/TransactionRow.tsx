"use client";

import { useState, useEffect, useRef } from "react";
import type { Category, Transaction } from "@/src/types";
import { formatIDR, formatTime } from "@/src/lib/utils/format";

// ─── Category emoji mapping ───────────────────────────────────────────────────

export const CATEGORY_EMOJI: Record<string, string> = {
  // --- Essential Living ---
  Housing: "🏡",
  Utilities: "⚡",
  Groceries: "🧺",
  Transport: "🛞",

  // --- Lifestyle ---
  "Dining Out": "🍱",
  Entertainment: "🍿",
  Shopping: "✨",
  Health: "🌿",
  Travel: "🌴",

  // --- Financial & Obligations ---
  Subscriptions: "🔁",
  "Debt Repayment": "📉",
  Insurance: "🛡️",

  // --- Income & Savings ---
  Salary: "💰",
  "Side Hustle": "🚀",
  Investments: "💎",
  Savings: "🍯",
  Gifts: "🎈",

  // --- Miscellaneous ---
  Fees: "💸",
  Other: "📦",
};

// ─── Component ────────────────────────────────────────────────────────────────

interface TransactionRowProps {
  tx: Transaction;
  category?: Category;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function TransactionRow({ tx, category, onEdit, onDelete }: TransactionRowProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });

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
    : isTransfer
      ? "var(--color-text-secondary)"
      : "var(--color-negative)";

  const hasActions = onEdit || onDelete;

  const handleMenuOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = btnRef.current?.getBoundingClientRect();
    if (rect) {
      setMenuPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
    }
    setMenuOpen(true);
  };

  useEffect(() => {
    if (!menuOpen) return;
    const handle = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [menuOpen]);

  return (
    <div
      className="tx-row"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--space-3)",
        padding: "var(--space-2) var(--space-1) var(--space-2) var(--space-3)",
        borderRadius: "var(--radius-md)",
        minHeight: 52,
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

      {/* Three-dot menu trigger */}
      {hasActions && (
        <>
          <button
            ref={btnRef}
            aria-label="Transaction actions"
            aria-haspopup="true"
            aria-expanded={menuOpen}
            onClick={handleMenuOpen}
            style={{
              minWidth: 44,
              minHeight: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--color-text-tertiary)",
              flexShrink: 0,
              padding: 0,
              borderRadius: "var(--radius-md)",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <circle cx="8" cy="3" r="1.5" />
              <circle cx="8" cy="8" r="1.5" />
              <circle cx="8" cy="13" r="1.5" />
            </svg>
          </button>

          {menuOpen && (
            <div
              ref={menuRef}
              role="menu"
              style={{
                position: "fixed",
                top: menuPos.top,
                right: menuPos.right,
                zIndex: 200,
                background: "var(--color-bg-elevated)",
                border: "0.5px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                minWidth: 140,
                overflow: "hidden",
              }}
            >
              {onEdit && (
                <button
                  role="menuitem"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    onEdit();
                  }}
                  style={{
                    width: "100%",
                    padding: "var(--space-3) var(--space-4)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    fontSize: "var(--text-sm)",
                    color: "var(--color-text-primary)",
                    display: "block",
                  }}
                >
                  Edit
                </button>
              )}
              {onEdit && onDelete && (
                <div style={{ height: "0.5px", background: "var(--color-border)", margin: "0 var(--space-3)" }} />
              )}
              {onDelete && (
                <button
                  role="menuitem"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    onDelete();
                  }}
                  style={{
                    width: "100%",
                    padding: "var(--space-3) var(--space-4)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    fontSize: "var(--text-sm)",
                    color: "var(--color-negative)",
                    display: "block",
                  }}
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

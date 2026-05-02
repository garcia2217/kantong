"use client";

import { useMemo, useState } from "react";
import { AddTransactionSheet } from "@/src/components/features/AddTransactionSheet";
import { EditTransactionSheet } from "@/src/components/features/EditTransactionSheet";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TransactionRow } from "@/src/components/ui/TransactionRow";
import { transactionService } from "@/src/lib/api/services/transactions";
import { categoryService } from "@/src/lib/api/services/categories";
import { TRANSACTION_KEYS, CATEGORY_KEYS } from "@/src/lib/api/keys";
import { formatTransactionDate } from "@/src/lib/utils/format";
import type { Transaction, Category } from "@/src/types";

// ─── Date grouping ────────────────────────────────────────────────────────────

interface DateGroup {
  label: string;
  transactions: Transaction[];
}

function groupByDate(transactions: Transaction[]): DateGroup[] {
  const groups = new Map<string, Transaction[]>();
  for (const tx of transactions) {
    const label = formatTransactionDate(tx.transaction_date);
    const existing = groups.get(label) ?? [];
    groups.set(label, [...existing, tx]);
  }
  return Array.from(groups.entries()).map(([label, txs]) => ({
    label,
    transactions: txs,
  }));
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonRows() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          style={{
            height: 52,
            borderRadius: "var(--radius-md)",
            background: "var(--color-bg-subtle)",
          }}
        />
      ))}
    </div>
  );
}

// ─── Transactions Page ────────────────────────────────────────────────────────

export default function TransactionsPage() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => transactionService.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: TRANSACTION_KEYS.all });
    },
  });

  const { data: transactions, isLoading: loadingTx } = useQuery({
    queryKey: TRANSACTION_KEYS.all,
    queryFn: transactionService.getAll,
  });

  const { data: categories } = useQuery({
    queryKey: CATEGORY_KEYS.all,
    queryFn: categoryService.getAll,
  });

  const categoryMap = useMemo<Record<string, Category>>(
    () => Object.fromEntries((categories ?? []).map((c) => [c.id, c])),
    [categories],
  );

  const groups = useMemo(
    () => groupByDate(transactions ?? []),
    [transactions],
  );

  return (
    <>
      {/* Mobile top bar */}
      <header
        className="md:hidden"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "var(--space-3) var(--space-4)",
          background: "var(--color-bg-app)",
          borderBottom: "0.5px solid var(--color-border)",
          minHeight: 52,
          margin: "calc(-1 * var(--space-4))",
          marginBottom: "var(--space-4)",
          width: "calc(100% + 2 * var(--space-4))",
        }}
      >
        <h1
          style={{
            fontSize: "var(--text-lg)",
            fontWeight: "var(--weight-semibold)",
            color: "var(--color-text-primary)",
          }}
        >
          Transactions
        </h1>
        <button
          aria-label="Add transaction"
          onClick={() => setSheetOpen(true)}
          style={{
            minWidth: 44,
            minHeight: 44,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--color-accent)",
            color: "var(--color-accent-fg)",
            border: "none",
            borderRadius: "var(--radius-md)",
            fontSize: "var(--text-lg)",
            cursor: "pointer",
          }}
        >
          +
        </button>
      </header>

      {/* Desktop page title */}
      <h1
        className="hidden md:block"
        style={{
          fontSize: "var(--text-2xl)",
          fontWeight: "var(--weight-semibold)",
          color: "var(--color-text-primary)",
          marginBottom: "var(--space-8)",
        }}
      >
        Transactions
      </h1>

      {/* Add transaction sheet */}
      <AddTransactionSheet isOpen={sheetOpen} onClose={() => setSheetOpen(false)} />

      {/* Edit transaction sheet */}
      <EditTransactionSheet
        tx={selectedTx}
        isOpen={selectedTx !== null}
        onClose={() => setSelectedTx(null)}
      />

      {/* Content */}
      {loadingTx ? (
        <SkeletonRows />
      ) : groups.length === 0 ? (
        <p
          style={{
            textAlign: "center",
            fontSize: "var(--text-sm)",
            color: "var(--color-text-tertiary)",
            padding: "var(--space-12) 0",
          }}
        >
          No transactions yet. Tap + to add your first one.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
          {groups.map((group) => (
            <section key={group.label}>
              {/* Date group header */}
              <p
                style={{
                  fontSize: "var(--text-xs)",
                  fontWeight: "var(--weight-medium)",
                  color: "var(--color-text-tertiary)",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  marginBottom: "var(--space-1)",
                  padding: "0 var(--space-3)",
                }}
              >
                {group.label}
              </p>

              {/* Transaction rows */}
              <div
                style={{
                  background: "var(--color-bg-elevated)",
                  border: "0.5px solid var(--color-border)",
                  borderRadius: "var(--radius-lg)",
                  overflow: "hidden",
                }}
              >
                {group.transactions.map((tx, idx) => (
                  <div key={tx.id}>
                    <TransactionRow
                      tx={tx}
                      category={tx.category_id ? categoryMap[tx.category_id] : undefined}
                      onEdit={() => setSelectedTx(tx)}
                      onDelete={() => deleteMutation.mutate(tx.id)}
                    />
                    {/* Hairline divider between rows, not after the last one */}
                    {idx < group.transactions.length - 1 && (
                      <div
                        style={{
                          height: "0.5px",
                          background: "var(--color-border)",
                          margin: "0 var(--space-3)",
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  );
}

"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AddTransactionSheet } from "@/src/components/features/AddTransactionSheet";
import { EditTransactionSheet } from "@/src/components/features/EditTransactionSheet";
import { TransactionRow } from "@/src/components/ui/TransactionRow";
import { transactionService } from "@/src/lib/api/services/transactions";
import { categoryService } from "@/src/lib/api/services/categories";
import { TRANSACTION_KEYS, CATEGORY_KEYS } from "@/src/lib/api/keys";
import { formatTransactionDate } from "@/src/lib/utils/format";
import type { Transaction, Category } from "@/src/types";

interface DateGroup {
  key: string;
  label: string;
  transactions: Transaction[];
}

function groupByDate(transactions: Transaction[]): DateGroup[] {
  const groups = new Map<string, Transaction[]>();
  for (const transaction of transactions) {
    const date = new Date(transaction.transaction_date);
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    const existing = groups.get(key) ?? [];
    groups.set(key, [...existing, transaction]);
  }
  return Array.from(groups.entries()).map(([key, items]) => ({
    key,
    label: formatTransactionDate(items[0].transaction_date),
    transactions: items,
  }));
}

function SkeletonRows() {
  return (
    <div className="transactions-groups" role="status" aria-label="Loading transactions">
      {Array.from({ length: 3 }, (_, group) => (
        <div key={group} className="transactions-skeleton-group">
          <div className="transactions-skeleton-label" />
          <div className="transactions-list">
            {Array.from({ length: group === 0 ? 3 : 2 }, (_, row) => (
              <div key={row} className="transactions-skeleton-row" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function TransactionsPage() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  // TODO: Add full-history pagination using the existing API metadata, then
  // search and wallet/type filters when server-side query support is added.
  const {
    data: transactions,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: TRANSACTION_KEYS.all,
    queryFn: transactionService.getAll,
  });

  const { data: categories } = useQuery({
    queryKey: CATEGORY_KEYS.all,
    queryFn: categoryService.getAll,
  });

  const categoryMap = useMemo<Record<string, Category>>(
    () => Object.fromEntries((categories ?? []).map((category) => [category.id, category])),
    [categories],
  );
  const groups = useMemo(() => groupByDate(transactions ?? []), [transactions]);

  return (
    <div className="transactions-page">
      <header className="transactions-header">
        <div>
          <h1>Transactions</h1>
          <p className="transactions-subtitle">Review and manage your activity</p>
        </div>
        <button
          type="button"
          className="transactions-add btn-primary"
          onClick={() => setSheetOpen(true)}
          aria-label="Add transaction"
        >
          <span aria-hidden="true">＋</span>
          <span className="transactions-add-label">Add transaction</span>
        </button>
      </header>

      <AddTransactionSheet isOpen={sheetOpen} onClose={() => setSheetOpen(false)} />
      <EditTransactionSheet
        tx={selectedTx}
        isOpen={selectedTx !== null}
        onClose={() => setSelectedTx(null)}
      />

      {isLoading ? (
        <SkeletonRows />
      ) : isError ? (
        <div className="transactions-state" role="alert">
          <h2>Couldn&apos;t load transactions</h2>
          <p>Check your connection and try again.</p>
          <button type="button" className="transactions-secondary-action" onClick={() => void refetch()}>
            Try again
          </button>
        </div>
      ) : groups.length === 0 ? (
        <div className="transactions-state">
          <h2>Your activity starts here</h2>
          <p>Add your first transaction to keep track of where your money goes.</p>
          <button type="button" className="transactions-primary-action btn-primary" onClick={() => setSheetOpen(true)}>
            Add transaction
          </button>
        </div>
      ) : (
        <div className="transactions-groups">
          {groups.map((group) => (
            <section key={group.key} aria-label={group.label}>
              <h2 className="transactions-date">{group.label}</h2>
              <div className="transactions-list">
                {group.transactions.map((transaction) => (
                  <TransactionRow
                    key={transaction.id}
                    tx={transaction}
                    category={transaction.category_id ? categoryMap[transaction.category_id] : undefined}
                    onEdit={() => setSelectedTx(transaction)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

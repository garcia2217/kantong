"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AddTransactionSheet } from "@/src/components/features/AddTransactionSheet";
import { EditTransactionSheet } from "@/src/components/features/EditTransactionSheet";
import { TransactionRow } from "@/src/components/ui/TransactionRow";
import { transactionService } from "@/src/lib/api/services/transactions";
import { categoryService } from "@/src/lib/api/services/categories";
import { TRANSACTION_KEYS, CATEGORY_KEYS } from "@/src/lib/api/keys";
import { formatIDR, formatTransactionDate } from "@/src/lib/utils/format";
import type { Transaction, Category } from "@/src/types";

interface DateGroup {
  key: string;
  label: string;
  transactions: Transaction[];
}

// getAll returns one page from the API; a full page may cut the oldest day short.
const TRANSACTIONS_PAGE_SIZE = 100;

// Income minus expenses; transfers move money between wallets, so they don't count.
function netTotal(transactions: Transaction[]): number {
  return transactions.reduce((sum, transaction) => {
    if (transaction.type === "income") return sum + transaction.amount;
    if (transaction.type === "expense") return sum - transaction.amount;
    return sum;
  }, 0);
}

function formatNet(amount: number): string {
  if (amount === 0) return formatIDR(0);
  return `${amount > 0 ? "+" : "−"}${formatIDR(Math.abs(amount))}`;
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
  const lastGroupMayBePartial = (transactions?.length ?? 0) >= TRANSACTIONS_PAGE_SIZE;

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
          <span className="transactions-state__icon" aria-hidden="true">🧾</span>
          <h2>Your activity starts here</h2>
          <p>
            Add your first transaction here, or send the Kantong bot a message like
            &ldquo;kopi 25rb&rdquo;.
          </p>
          <button type="button" className="transactions-primary-action btn-primary" onClick={() => setSheetOpen(true)}>
            Add transaction
          </button>
        </div>
      ) : (
        <div className="transactions-groups">
          {groups.map((group, index) => {
              const showTotal = !(lastGroupMayBePartial && index === groups.length - 1);
              const net = netTotal(group.transactions);
              return (
              <section key={group.key} aria-label={group.label}>
                <div className="transactions-date-row">
                  <h2 className="transactions-date">{group.label}</h2>
                  {showTotal && (
                    <p className={`transactions-day-total ${net < 0 ? "transactions-day-total--out" : net > 0 ? "transactions-day-total--in" : ""}`}>
                      <span className="sr-only">Net for the day: </span>
                      {formatNet(net)}
                    </p>
                  )}
                </div>
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
              );
          })}
        </div>
      )}
    </div>
  );
}

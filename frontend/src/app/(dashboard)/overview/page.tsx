"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { StatCard } from "@/src/components/ui/StatCard";
import { TransactionRow } from "@/src/components/ui/TransactionRow";
import { walletService } from "@/src/lib/api/services/wallets";
import { transactionService } from "@/src/lib/api/services/transactions";
import { categoryService } from "@/src/lib/api/services/categories";
import { debtService } from "@/src/lib/api/services/debts";
import { WALLET_KEYS, TRANSACTION_KEYS, CATEGORY_KEYS, DEBT_KEYS } from "@/src/lib/api/keys";
import { formatIDRCompact, getCurrentYearMonth } from "@/src/lib/utils/format";


// ─── Overview Page ────────────────────────────────────────────────────────────

export default function OverviewPage() {
  const { year, month } = getCurrentYearMonth();

  const { data: wallets, isLoading: loadingWallets } = useQuery({
    queryKey: WALLET_KEYS.all,
    queryFn: walletService.getAll,
  });

  const { data: netPosition, isLoading: loadingDebts } = useQuery({
    queryKey: DEBT_KEYS.all,
    queryFn: debtService.getNetPosition,
  });

  const { data: monthlySummary, isLoading: loadingSummary } = useQuery({
    queryKey: TRANSACTION_KEYS.byMonth(year, month),
    queryFn: () => transactionService.getMonthlySummary(year, month),
  });

  const { data: recentTx, isLoading: loadingTx } = useQuery({
    queryKey: TRANSACTION_KEYS.recent(5),
    queryFn: () => transactionService.getRecent(5),
  });

  const { data: categories } = useQuery({
    queryKey: CATEGORY_KEYS.all,
    queryFn: categoryService.getAll,
  });

  // ─── Derived values ─────────────────────────────────────────────────────────

  const categoryMap = useMemo(
    () => Object.fromEntries((categories ?? []).map((c) => [c.id, c])),
    [categories],
  );

  const totalWalletBalance = useMemo(
    () => (wallets ?? []).reduce((sum, w) => sum + w.balance, 0),
    [wallets],
  );

  const totalAssets = totalWalletBalance + (netPosition?.totalReceivable ?? 0);
  const totalLiabilities = netPosition?.totalPayable ?? 0;

  const savingsRate = useMemo(() => {
    if (!monthlySummary || monthlySummary.totalIncome === 0) return null;
    return ((monthlySummary.totalIncome - monthlySummary.totalExpense) / monthlySummary.totalIncome) * 100;
  }, [monthlySummary]);

  const isStatsLoading = loadingWallets || loadingDebts || loadingSummary;

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
          Overview
        </h1>
        {/* TODO: wire to Add Transaction sheet in Step 9 */}
        <button
          aria-label="Add transaction"
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
        Overview
      </h1>

      {/* Stat cards */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
        style={{ gap: "var(--space-3)", marginBottom: "var(--space-8)" }}
      >
        <StatCard
          label="Total assets"
          value={formatIDRCompact(totalAssets)}
          subtext={`${formatIDRCompact(totalWalletBalance)} wallets · ${formatIDRCompact(netPosition?.totalReceivable ?? 0)} receivable`}
          isLoading={isStatsLoading}
        />
        <StatCard
          label="Total liabilities"
          value={formatIDRCompact(totalLiabilities)}
          subtext={totalLiabilities > 0 ? "Outstanding payables" : "No outstanding debts"}
          subtextType={totalLiabilities > 0 ? "negative" : "neutral"}
          isLoading={isStatsLoading}
        />
        <StatCard
          label="Savings rate"
          value={savingsRate !== null ? `${savingsRate.toFixed(1)}%` : "—"}
          subtext={
            monthlySummary
              ? `${formatIDRCompact(monthlySummary.totalIncome)} in · ${formatIDRCompact(monthlySummary.totalExpense)} out`
              : "No data this month"
          }
          subtextType={savingsRate !== null && savingsRate >= 20 ? "positive" : "neutral"}
          isLoading={isStatsLoading}
        />
      </div>

      {/* Section divider */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-3)",
          marginBottom: "var(--space-3)",
        }}
      >
        <div style={{ flex: 1, height: "0.5px", background: "var(--color-border)" }} />
        <span
          style={{
            fontSize: "var(--text-xs)",
            color: "var(--color-text-tertiary)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          Recent transactions
        </span>
        <div style={{ flex: 1, height: "0.5px", background: "var(--color-border)" }} />
      </div>

      {/* Transaction list */}
      {loadingTx ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
          {Array.from({ length: 5 }).map((_, i) => (
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
      ) : (recentTx ?? []).length === 0 ? (
        <p
          style={{
            textAlign: "center",
            fontSize: "var(--text-sm)",
            color: "var(--color-text-tertiary)",
            padding: "var(--space-8) 0",
          }}
        >
          No transactions yet
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
          {(recentTx ?? []).map((tx) => (
            <TransactionRow
              key={tx.id}
              tx={tx}
              category={tx.category_id ? categoryMap[tx.category_id] : undefined}
            />
          ))}
        </div>
      )}
    </>
  );
}

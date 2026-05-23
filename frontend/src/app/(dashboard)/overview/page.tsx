"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AddTransactionSheet } from "@/src/components/features/AddTransactionSheet";
import { StatCard } from "@/src/components/ui/StatCard";
import { TransactionRow } from "@/src/components/ui/TransactionRow";
import { walletService } from "@/src/lib/api/services/wallets";
import { transactionService } from "@/src/lib/api/services/transactions";
import { categoryService } from "@/src/lib/api/services/categories";
import { debtService } from "@/src/lib/api/services/debts";
import {
  WALLET_KEYS,
  TRANSACTION_KEYS,
  CATEGORY_KEYS,
  DEBT_KEYS,
} from "@/src/lib/api/keys";
import { formatIDR, formatIDRCompact, getCurrentYearMonth } from "@/src/lib/utils/format";

// ─── Icons ────────────────────────────────────────────────────────────────────

function WalletIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect x="1.5" y="4.5" width="15" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M1.5 8h15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="13.5" cy="11.5" r="1.5" fill="currentColor" opacity="0.75" />
    </svg>
  );
}

function CreditCardIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect x="1.5" y="4" width="15" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M1.5 7.5h15" stroke="currentColor" strokeWidth="1.4" />
      <rect x="3.5" y="10" width="4" height="1.5" rx="0.5" fill="currentColor" opacity="0.7" />
    </svg>
  );
}

function TrendingUpIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <polyline
        points="2,13 6.5,8.5 10,11 16,5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points="12.5,5 16,5 16,8.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M1.5 9C1.5 9 4 3.5 9 3.5S16.5 9 16.5 9 14 14.5 9 14.5 1.5 9 1.5 9Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M2 2L16 16"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M7.5 4C8 3.84 8.49 3.75 9 3.75c5 0 7.5 5.25 7.5 5.25a14.2 14.2 0 0 1-2.1 2.85M5.3 5.55A13.8 13.8 0 0 0 1.5 9S4 14.25 9 14.25c1.47 0 2.78-.47 3.87-1.24"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.17 7.34A2 2 0 0 0 10.8 10.7"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─── Overview Page ────────────────────────────────────────────────────────────

export default function OverviewPage() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);
  const { year, month } = getCurrentYearMonth();

  const { data: wallets, isLoading: loadingWallets } = useQuery({
    queryKey: WALLET_KEYS.all,
    queryFn: walletService.getAll,
  });

  const { data: netPosition, isLoading: loadingDebts } = useQuery({
    queryKey: DEBT_KEYS.netPosition,
    queryFn: debtService.getNetPosition,
  });

  const { data: monthlySummary, isLoading: loadingSummary } = useQuery({
    queryKey: TRANSACTION_KEYS.monthlySummary(year, month),
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
    return (
      ((monthlySummary.totalIncome - monthlySummary.totalExpense) /
        monthlySummary.totalIncome) *
      100
    );
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
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <button
            aria-label={isBalanceHidden ? "Show balances" : "Hide balances"}
            onClick={() => setIsBalanceHidden((prev) => !prev)}
            style={{
              minWidth: 44,
              minHeight: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "transparent",
              color: "var(--color-text-secondary)",
              border: "none",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
            }}
          >
            {isBalanceHidden ? <EyeOffIcon /> : <EyeIcon />}
          </button>
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
        </div>
      </header>

      {/* Desktop page title */}
      <div
        className="hidden md:flex"
        style={{
          alignItems: "center",
          gap: "var(--space-3)",
          marginBottom: "var(--space-8)",
        }}
      >
        <h1
          style={{
            fontSize: "var(--text-2xl)",
            fontWeight: "var(--weight-semibold)",
            color: "var(--color-text-primary)",
          }}
        >
          Overview
        </h1>
        <button
          aria-label={isBalanceHidden ? "Show balances" : "Hide balances"}
          onClick={() => setIsBalanceHidden((prev) => !prev)}
          style={{
            minWidth: 36,
            minHeight: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "transparent",
            color: "var(--color-text-tertiary)",
            border: "none",
            borderRadius: "var(--radius-md)",
            cursor: "pointer",
          }}
        >
          {isBalanceHidden ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>

      {/* Stat cards */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
        style={{ gap: "var(--space-3)", marginBottom: "var(--space-8)" }}
      >
        <StatCard
          label="Total assets"
          value={isBalanceHidden ? "Rp ••••••" : formatIDR(totalAssets)}
          subtext={
            isBalanceHidden
              ? "•••• wallets · •••• receivable"
              : `${formatIDRCompact(totalWalletBalance)} wallets · ${formatIDRCompact(netPosition?.totalReceivable ?? 0)} receivable`
          }
          isLoading={isStatsLoading}
          icon={<WalletIcon />}
        />
        <StatCard
          label="Total liabilities"
          value={isBalanceHidden ? "Rp ••••••" : formatIDR(totalLiabilities)}
          subtext={
            totalLiabilities > 0
              ? "Outstanding payables"
              : "No outstanding debts"
          }
          subtextType={totalLiabilities > 0 ? "negative" : "neutral"}
          isLoading={isStatsLoading}
          icon={<CreditCardIcon />}
        />
        <StatCard
          label="Savings rate"
          value={isBalanceHidden ? "••••" : (savingsRate !== null ? `${savingsRate.toFixed(1)}%` : "—")}
          subtext={
            isBalanceHidden
              ? "•••• in · •••• out"
              : monthlySummary
                ? `${formatIDRCompact(monthlySummary.totalIncome)} in · ${formatIDRCompact(monthlySummary.totalExpense)} out`
                : "No data this month"
          }
          subtextType={
            savingsRate !== null && savingsRate >= 20 ? "positive" : "neutral"
          }
          isLoading={isStatsLoading}
          icon={<TrendingUpIcon />}
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
        <div
          style={{
            flex: 1,
            height: "0.5px",
            background: "var(--color-border)",
          }}
        />
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
        <div
          style={{
            flex: 1,
            height: "0.5px",
            background: "var(--color-border)",
          }}
        />
      </div>

      {/* Add transaction sheet */}
      <AddTransactionSheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
      />

      {/* Transaction list */}
      {loadingTx ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-1)",
          }}
        >
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
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-1)",
          }}
        >
          {(recentTx ?? []).map((tx) => (
            <TransactionRow
              key={tx.id}
              tx={tx}
              category={
                tx.category_id ? categoryMap[tx.category_id] : undefined
              }
            />
          ))}
        </div>
      )}
    </>
  );
}

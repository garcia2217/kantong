"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { budgetService } from "@/src/lib/api/services/budgets";
import { categoryService } from "@/src/lib/api/services/categories";
import { transactionService } from "@/src/lib/api/services/transactions";
import { BUDGET_KEYS, CATEGORY_KEYS, TRANSACTION_KEYS } from "@/src/lib/api/keys";
import { formatIDR, formatIDRCompact, formatMonthYear, getCurrentYearMonth } from "@/src/lib/utils/format";
import { BudgetSheet } from "@/src/components/features/BudgetSheet";
import { CATEGORY_EMOJI } from "@/src/components/ui/TransactionRow";
import type { Budget } from "@/src/types";

// ─── Small icons ──────────────────────────────────────────────────────────────

const strokeProps = {
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const ChevronLeft = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" {...strokeProps}>
    <path d="M10 12L6 8L10 4" />
  </svg>
);

const ChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" {...strokeProps}>
    <path d="M6 12L10 8L6 4" />
  </svg>
);

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ pct }: { pct: number }) {
  const barColor =
    pct > 100 ? "var(--color-negative)" : pct > 80 ? "var(--color-warning)" : "var(--color-positive)";
  return (
    <div
      aria-hidden="true"
      style={{
        height: 6,
        background: "var(--color-bg-subtle)",
        border: "0.5px solid var(--color-border)",
        borderRadius: 3,
        overflow: "hidden",
      }}
    >
      <div
        className="budget-progress-fill"
        style={{
          height: "100%",
          width: `${Math.min(100, pct)}%`,
          background: barColor,
          borderRadius: 3,
        }}
      />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface SheetState {
  open: boolean;
  budget?: Budget;
}

export default function BudgetPage() {
  const today = getCurrentYearMonth();
  const [year, setYear] = useState(today.year);
  const [month, setMonth] = useState(today.month);
  const [sheet, setSheet] = useState<SheetState>({ open: false });

  const goToPrevMonth = () => {
    if (month === 1) { setYear((y) => y - 1); setMonth(12); }
    else setMonth((m) => m - 1);
  };

  const goToNextMonth = () => {
    if (month === 12) { setYear((y) => y + 1); setMonth(1); }
    else setMonth((m) => m + 1);
  };

  const { data: budgets = [], isLoading: budgetsLoading, isError: budgetsError, isFetching: budgetsFetching, refetch: refetchBudgets } = useQuery({
    queryKey: BUDGET_KEYS.byMonth(year, month),
    queryFn: () => budgetService.getForMonth(year, month),
  });

  const { data: categories = [], isLoading: categoriesLoading, isError: categoriesError, isFetching: categoriesFetching, refetch: refetchCategories } = useQuery({
    queryKey: CATEGORY_KEYS.all,
    queryFn: categoryService.getAll,
  });

  const { data: transactionsRaw, isLoading: txLoading, isError: txError, isFetching: txFetching, refetch: refetchTransactions } = useQuery({
    queryKey: TRANSACTION_KEYS.byMonth(year, month),
    queryFn: () => transactionService.getByMonth(year, month),
  });
  const transactions = Array.isArray(transactionsRaw) ? transactionsRaw : [];

  const isLoading = budgetsLoading || categoriesLoading || txLoading;
  const isError = budgetsError || categoriesError || txError;
  const isRetrying = isError && (budgetsFetching || categoriesFetching || txFetching);
  const retryLoading = () => {
    void Promise.all([refetchBudgets(), refetchCategories(), refetchTransactions()]);
  };

  // Lookup maps
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  const spentByCategoryId = new Map<string, number>();
  transactions
    .filter((t) => t.type === "expense" && t.category_id)
    .forEach((t) => {
      spentByCategoryId.set(
        t.category_id!,
        (spentByCategoryId.get(t.category_id!) ?? 0) + t.amount,
      );
    });

  const rows = budgets.map((b) => ({
    budget: b,
    category: categoryMap.get(b.category_id),
    spent: spentByCategoryId.get(b.category_id) ?? 0,
  }));

  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = rows.reduce((sum, r) => sum + r.spent, 0);
  const remaining = totalBudget - totalSpent;
  const takenCategoryIds = budgets.map((b) => b.category_id);
  const hasExpenseCategories = categories.some((category) => category.type === "expense");

  const divider: React.CSSProperties = {
    margin: "0 var(--space-4)",
    height: "0.5px",
    background: "var(--color-border)",
  };

  return (
    <div className="budget-page">
      <header className="budget-header">
        <div>
          <h1>Budget</h1>
          <p className="budget-subtitle">Keep each category on track</p>
        </div>
        {!isLoading && !isError && hasExpenseCategories && (
          <button type="button" className="budget-add btn-primary" onClick={() => setSheet({ open: true })} aria-label="Add budget">
            <span aria-hidden="true">＋</span>
            <span className="budget-add-label">Add budget</span>
          </button>
        )}
      </header>

      <div className="budget-content">
        {/* Month navigation */}
        <div className="budget-month-nav">
          <button
            type="button"
            className="budget-month-button"
            onClick={goToPrevMonth}
            aria-label="Previous month"
          >
            <ChevronLeft />
          </button>
          <p
            style={{
              fontSize: "var(--text-base)",
              fontWeight: "var(--weight-semibold)",
              color: "var(--color-text-primary)",
            }}
          >
            {formatMonthYear(year, month)}
          </p>
          <button
            type="button"
            className="budget-month-button"
            onClick={goToNextMonth}
            aria-label="Next month"
          >
            <ChevronRight />
          </button>
        </div>

        {isError ? (
          <div role="alert" style={{ padding: "var(--space-6)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", background: "var(--color-bg-elevated)" }}>
            <h2 style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "var(--color-text-primary)" }}>Couldn&apos;t load this month&apos;s budget</h2>
            <p style={{ marginTop: "var(--space-2)", color: "var(--color-text-secondary)" }}>Check your connection and try again. No totals are shown until the data is complete.</p>
            <button type="button" onClick={retryLoading} disabled={isRetrying} style={{ minHeight: 44, marginTop: "var(--space-4)", padding: "0 var(--space-4)", border: "1px solid var(--color-border-strong)", borderRadius: "var(--radius-md)", background: "var(--color-bg-elevated)", color: "var(--color-text-primary)", cursor: isRetrying ? "not-allowed" : "pointer" }}>
              {isRetrying ? "Trying again…" : "Try again"}
            </button>
          </div>
        ) : isLoading ? (
          <section role="status" aria-label="Loading budget summary" style={{ padding: "var(--space-5)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", background: "var(--color-bg-elevated)" }}>
            <div style={{ width: 150, height: 16, borderRadius: "var(--radius-sm)", background: "var(--color-bg-subtle)" }} />
            <div style={{ width: 220, maxWidth: "100%", height: 36, marginTop: "var(--space-3)", borderRadius: "var(--radius-sm)", background: "var(--color-bg-subtle)" }} />
            <div style={{ width: "100%", height: 52, marginTop: "var(--space-5)", borderRadius: "var(--radius-sm)", background: "var(--color-bg-subtle)" }} />
          </section>
        ) : rows.length > 0 ? (
          <section aria-label="Budget summary" style={{ padding: "var(--space-5)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", background: "var(--color-bg-elevated)" }}>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)" }}>
              {remaining < 0 ? "Over budget by" : "Budget remaining"}
            </p>
            <p style={{ marginTop: "var(--space-1)", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", color: remaining < 0 ? "var(--color-negative)" : "var(--color-text-primary)" }}>
              {formatIDR(Math.abs(remaining))}
            </p>
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2" style={{ marginTop: "var(--space-5)", paddingTop: "var(--space-4)", borderTop: "1px solid var(--color-border)" }}>
              <div>
                <dt style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)" }}>Total budget</dt>
                <dd style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-medium)", color: "var(--color-text-primary)" }}>{formatIDR(totalBudget)}</dd>
              </div>
              <div>
                <dt style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)" }}>Spent in budgeted categories</dt>
                <dd style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-medium)", color: "var(--color-text-primary)" }}>{formatIDR(totalSpent)}</dd>
              </div>
            </dl>
          </section>
        ) : null}

        {/* Budget breakdown */}
        {!isError && <section>
          <div
            style={{
              background: "var(--color-bg-elevated)",
              border: "0.5px solid var(--color-border)",
              borderRadius: "var(--radius-lg)",
              overflow: "hidden",
            }}
          >
            {/* Section header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "var(--space-3) var(--space-4)",
                borderBottom: "0.5px solid var(--color-border)",
              }}
            >
              <h2
                style={{
                  fontSize: "var(--text-base)",
                  fontWeight: "var(--weight-semibold)",
                  color: "var(--color-text-primary)",
                }}
              >
                Breakdown
              </h2>
              <span
                style={{ fontSize: "var(--text-sm)", color: "var(--color-text-tertiary)" }}
              >
                {isLoading ? "…" : `${rows.length} ${rows.length === 1 ? "category" : "categories"}`}
              </span>
            </div>

            {/* Budget rows */}
            {isLoading ? (
              // Skeleton
              [0, 1, 2].map((i) => (
                <div key={i}>
                  {i > 0 && <div style={divider} />}
                  <div
                    style={{
                      padding: "var(--space-4)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "var(--space-2)",
                    }}
                  >
                    <div
                      style={{
                        height: 16,
                        width: "40%",
                        background: "var(--color-bg-subtle)",
                        borderRadius: "var(--radius-sm)",
                      }}
                    />
                    <div
                      style={{
                        height: 6,
                        width: "100%",
                        background: "var(--color-bg-subtle)",
                        borderRadius: 3,
                      }}
                    />
                    <div
                      style={{
                        height: 12,
                        width: "55%",
                        background: "var(--color-bg-subtle)",
                        borderRadius: "var(--radius-sm)",
                      }}
                    />
                  </div>
                </div>
              ))
            ) : rows.length === 0 ? (
              <div style={{ padding: "var(--space-8) var(--space-4)", textAlign: "center" }}>
                <h3 style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "var(--color-text-primary)" }}>
                  {hasExpenseCategories ? `No budgets for ${formatMonthYear(year, month)}` : "No expense categories yet"}
                </h3>
                <p style={{ margin: "var(--space-2) auto var(--space-4)", fontSize: "var(--text-base)", color: "var(--color-text-secondary)" }}>
                  {hasExpenseCategories ? "Set a limit for a category to track its spending here." : "Create an expense category before setting a budget."}
                </p>
                {hasExpenseCategories ? (
                  <button type="button" onClick={() => setSheet({ open: true })} style={{ minHeight: 44, padding: "0 var(--space-4)", border: "none", borderRadius: "var(--radius-md)", background: "var(--color-accent)", color: "var(--color-accent-fg)", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}>
                    Add budget
                  </button>
                ) : (
                  <Link href="/settings" style={{ display: "inline-flex", alignItems: "center", minHeight: 44, padding: "0 var(--space-4)", borderRadius: "var(--radius-md)", background: "var(--color-accent)", color: "var(--color-accent-fg)", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", textDecoration: "none" }}>
                    Manage categories
                  </Link>
                )}
              </div>
            ) : (
              rows.map(({ budget, category, spent }) => {
                const pct = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
                const emoji = CATEGORY_EMOJI[category?.name ?? ""] ?? "📦";
                const isOver = spent > budget.amount;
                const categoryName = category?.name ?? "Unknown category";

                return (
                  <button
                    key={budget.id}
                    type="button"
                    className="budget-row"
                    onClick={() => setSheet({ open: true, budget })}
                    aria-label={`${categoryName} budget, ${budget.is_default ? "every month" : `${formatMonthYear(year, month)} only`}. ${formatIDR(spent)} spent of ${formatIDR(budget.amount)}. ${isOver ? `${formatIDR(spent - budget.amount)} over` : `${formatIDR(budget.amount - spent)} left`}. View or edit budget`}
                  >
                    <span className="budget-row__top">
                      <span className="budget-row__icon" aria-hidden="true">{emoji}</span>
                      <span className="budget-row__identity">
                        <span className="budget-row__name">{categoryName}</span>
                        <span className="budget-row__scope">
                          {budget.is_default ? "Every month" : `${formatMonthYear(year, month)} only`}
                        </span>
                      </span>
                      <span className="budget-row__status" style={{ color: isOver ? "var(--color-negative)" : "var(--color-text-secondary)" }}>
                        {isOver
                          ? `${formatIDRCompact(spent - budget.amount)} over`
                          : `${formatIDRCompact(budget.amount - spent)} left`}
                      </span>
                      <span className="budget-row__chevron" aria-hidden="true">›</span>
                    </span>
                    <ProgressBar pct={pct} />
                    <span className="budget-row__figures">
                      <span>{formatIDR(spent)} spent of {formatIDR(budget.amount)}</span>
                      <span>{Math.round(pct)}%</span>
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </section>}
      </div>

      <BudgetSheet
        isOpen={sheet.open}
        onClose={() => setSheet({ open: false })}
        budget={sheet.budget}
        year={year}
        month={month}
        categories={categories}
        takenCategoryIds={takenCategoryIds}
      />
    </div>
  );
}

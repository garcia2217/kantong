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

// ─── Budget meter ─────────────────────────────────────────────────────────────

type BudgetTone = "ok" | "near" | "over";

// Same colour steps as the Overview meter: calm, nearly spent, over. The
// figures next to every bar say the same thing, so colour is never the only
// signal.
function budgetTone(percentageUsed: number): BudgetTone {
  if (percentageUsed > 100) return "over";
  if (percentageUsed >= 80) return "near";
  return "ok";
}

function BudgetMeter({ pct }: { pct: number }) {
  return (
    <span aria-hidden="true" className="budget-meter">
      <span
        className={`budget-meter__fill budget-meter__fill--${budgetTone(pct)}`}
        style={{ width: `${Math.min(100, pct)}%` }}
      />
    </span>
  );
}

// Days left in the viewed month, counting today. Null for any other month,
// because a daily allowance only makes sense while the month is running.
function daysLeftInMonth(year: number, month: number, now: Date): number | null {
  if (now.getFullYear() !== year || now.getMonth() + 1 !== month) return null;
  const daysInMonth = new Date(year, month, 0).getDate();
  return daysInMonth - now.getDate() + 1;
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

  const percentageUsed = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
  const daysLeft = daysLeftInMonth(year, month, new Date());
  const dailyAllowance = daysLeft && remaining > 0 ? remaining / daysLeft : null;

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
        <div className="budget-month-nav">
          <button
            type="button"
            className="budget-month-button"
            onClick={goToPrevMonth}
            aria-label="Previous month"
          >
            <ChevronLeft />
          </button>
          <p className="budget-month-label" aria-live="polite">{formatMonthYear(year, month)}</p>
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
          <div role="alert" className="budget-state">
            <span className="budget-state__icon" aria-hidden="true">⚠️</span>
            <h2>Couldn&apos;t load this month&apos;s budget</h2>
            <p>Check your connection and try again. No totals are shown until the data is complete.</p>
            <button type="button" className="budget-secondary-action" onClick={retryLoading} disabled={isRetrying}>
              {isRetrying ? "Trying again…" : "Try again"}
            </button>
          </div>
        ) : isLoading ? (
          <section role="status" aria-label="Loading budget summary" className="budget-summary budget-summary--loading">
            <span className="budget-skeleton budget-skeleton--label" />
            <span className="budget-skeleton budget-skeleton--value" />
            <span className="budget-skeleton budget-skeleton--meter" />
          </section>
        ) : rows.length > 0 ? (
          <section aria-labelledby="budget-summary-heading" className="budget-summary">
            <h2 id="budget-summary-heading" className="budget-summary__label">
              {remaining < 0 ? "Over budget by" : "Left to spend"}
            </h2>
            <p className={`budget-summary__value${remaining < 0 ? " budget-summary__value--over" : ""}`}>
              {formatIDR(Math.abs(remaining))}
            </p>
            {dailyAllowance !== null && (
              <p className="budget-summary__hint">
                About {formatIDRCompact(dailyAllowance)} a day for the next {daysLeft} {daysLeft === 1 ? "day" : "days"}
              </p>
            )}
            <div
              role="progressbar"
              aria-label="Budget used this month"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.min(100, percentageUsed)}
              aria-valuetext={`${percentageUsed}% used`}
              className="budget-summary__meter"
            >
              <BudgetMeter pct={percentageUsed} />
            </div>
            <p className="budget-summary__caption">{percentageUsed}% of your budget used</p>
            <dl className="budget-summary__figures">
              <div>
                <dt>Spent in budgeted categories</dt>
                <dd>{formatIDR(totalSpent)}</dd>
              </div>
              <div>
                <dt>Total budget</dt>
                <dd>{formatIDR(totalBudget)}</dd>
              </div>
            </dl>
          </section>
        ) : null}

        {!isError && (
          <section aria-labelledby="budget-breakdown-heading" className="budget-card">
            <div className="budget-card__head">
              <h2 id="budget-breakdown-heading" className="budget-card__title">Breakdown</h2>
              <span className="budget-card__meta">
                {isLoading ? "…" : `${rows.length} ${rows.length === 1 ? "category" : "categories"}`}
              </span>
            </div>

            {isLoading ? (
              [0, 1, 2].map((i) => (
                <div key={i} className="budget-row budget-row--skeleton" aria-hidden="true">
                  <span className="budget-skeleton budget-skeleton--name" />
                  <span className="budget-skeleton budget-skeleton--bar" />
                  <span className="budget-skeleton budget-skeleton--figures" />
                </div>
              ))
            ) : rows.length === 0 ? (
              <div className="budget-empty">
                <span className="budget-state__icon" aria-hidden="true">🎯</span>
                <h3>
                  {hasExpenseCategories ? `No budgets for ${formatMonthYear(year, month)}` : "No expense categories yet"}
                </h3>
                <p>
                  {hasExpenseCategories
                    ? "Give a category a monthly limit and Kantong shows what's left before you spend."
                    : "Create an expense category before setting a budget."}
                </p>
                {hasExpenseCategories ? (
                  <button type="button" className="btn-primary budget-empty__action" onClick={() => setSheet({ open: true })}>
                    Add budget
                  </button>
                ) : (
                  <Link href="/settings" className="btn-primary budget-empty__action">
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
                      <span className={`budget-row__status${isOver ? " budget-row__status--over" : ""}`}>
                        {isOver
                          ? `${formatIDRCompact(spent - budget.amount)} over`
                          : `${formatIDRCompact(budget.amount - spent)} left`}
                      </span>
                      <span className="budget-row__chevron" aria-hidden="true">›</span>
                    </span>
                    <BudgetMeter pct={pct} />
                    <span className="budget-row__figures">
                      <span>{formatIDR(spent)} spent of {formatIDR(budget.amount)}</span>
                      <span>{Math.round(pct)}%</span>
                    </span>
                  </button>
                );
              })
            )}
          </section>
        )}
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

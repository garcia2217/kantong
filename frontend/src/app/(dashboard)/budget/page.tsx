"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { budgetService } from "@/src/lib/api/services/budgets";
import { categoryService } from "@/src/lib/api/services/categories";
import { transactionService } from "@/src/lib/api/services/transactions";
import { BUDGET_KEYS, CATEGORY_KEYS, TRANSACTION_KEYS } from "@/src/lib/api/keys";
import { formatIDRCompact, formatMonthYear, getCurrentYearMonth } from "@/src/lib/utils/format";
import { StatCard } from "@/src/components/ui/StatCard";
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

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" {...strokeProps}>
    <path d="M9.5 2.5L11.5 4.5L4.5 11.5H2.5V9.5L9.5 2.5Z" />
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" {...strokeProps}>
    <path d="M2 3.5H12M5 3.5V2.5C5 2 5.5 1.5 6 1.5H8C8.5 1.5 9 2 9 2.5V3.5M5.5 6V11M8.5 6V11M2.5 3.5L3 12C3 12.5 3.5 13 4 13H10C10.5 13 11 12.5 11 12L11.5 3.5" />
  </svg>
);

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" {...strokeProps}>
    <path d="M7 2V12M2 7H12" />
  </svg>
);

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ pct }: { pct: number }) {
  const barColor =
    pct > 100 ? "var(--color-negative)" : pct > 80 ? "#F59E0B" : "var(--color-positive)";
  return (
    <div
      style={{
        height: 6,
        background: "var(--color-bg-subtle)",
        border: "0.5px solid var(--color-border)",
        borderRadius: 3,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${Math.min(100, pct)}%`,
          background: barColor,
          borderRadius: 3,
          transition: "width 0.4s ease",
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
  const queryClient = useQueryClient();
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

  const { data: budgets = [], isLoading: budgetsLoading } = useQuery({
    queryKey: BUDGET_KEYS.byMonth(year, month),
    queryFn: () => budgetService.getForMonth(year, month),
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: CATEGORY_KEYS.all,
    queryFn: categoryService.getAll,
  });

  const { data: transactionsRaw, isLoading: txLoading } = useQuery({
    queryKey: TRANSACTION_KEYS.byMonth(year, month),
    queryFn: () => transactionService.getByMonth(year, month),
  });
  const transactions = Array.isArray(transactionsRaw) ? transactionsRaw : [];

  const deleteBudget = useMutation({
    mutationFn: budgetService.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: BUDGET_KEYS.all }),
  });

  const isLoading = budgetsLoading || categoriesLoading || txLoading;

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

  const handleDelete = (budget: Budget, categoryName: string) => {
    const msg = budget.is_default
      ? `Remove "${categoryName}" budget? This removes the default for all months.`
      : `Remove "${categoryName}" override for ${formatMonthYear(year, month)}?`;
    if (window.confirm(msg)) deleteBudget.mutate(budget.id);
  };

  // Shared style atoms
  const actionBtn: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 44,
    minHeight: 44,
    padding: "var(--space-2)",
    background: "transparent",
    border: "none",
    borderRadius: "var(--radius-sm)",
    cursor: "pointer",
  };

  const divider: React.CSSProperties = {
    margin: "0 var(--space-4)",
    height: "0.5px",
    background: "var(--color-border)",
  };

  return (
    <>
      {/* Mobile sticky top bar */}
      <header
        className="md:hidden"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          display: "flex",
          alignItems: "center",
          height: 56,
          padding: "0 var(--space-4)",
          background: "var(--color-bg-base)",
          borderBottom: "0.5px solid var(--color-border)",
        }}
      >
        <h1
          style={{
            fontSize: "var(--text-lg)",
            fontWeight: "var(--weight-semibold)",
            color: "var(--color-text-primary)",
          }}
        >
          Budget
        </h1>
      </header>

      <main
        style={{
          maxWidth: 640,
          margin: "0 auto",
          padding: "var(--space-6) var(--space-4)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-6)",
        }}
      >
        {/* Desktop title */}
        <h1
          className="hidden md:block"
          style={{
            fontSize: "var(--text-2xl)",
            fontWeight: "var(--weight-semibold)",
            color: "var(--color-text-primary)",
          }}
        >
          Budget
        </h1>

        {/* Month navigation */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <button
            onClick={goToPrevMonth}
            aria-label="Previous month"
            style={{ ...actionBtn, color: "var(--color-text-secondary)" }}
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
            onClick={goToNextMonth}
            aria-label="Next month"
            style={{ ...actionBtn, color: "var(--color-text-secondary)" }}
          >
            <ChevronRight />
          </button>
        </div>

        {/* Summary stat cards */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Total budget" value={formatIDRCompact(totalBudget)} isLoading={isLoading} />
          <StatCard
            label="Spent"
            value={formatIDRCompact(totalSpent)}
            subtextType={totalSpent > totalBudget && !isLoading ? "negative" : "neutral"}
            isLoading={isLoading}
          />
          <StatCard
            label="Remaining"
            value={formatIDRCompact(Math.abs(remaining))}
            subtext={remaining < 0 && !isLoading ? "over budget" : undefined}
            subtextType={remaining < 0 ? "negative" : "positive"}
            isLoading={isLoading}
          />
        </div>

        {/* Budget breakdown */}
        <section>
          <div
            style={{
              background: "var(--color-bg-card)",
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
              <p
                style={{
                  padding: "var(--space-8) var(--space-4)",
                  textAlign: "center",
                  fontSize: "var(--text-sm)",
                  color: "var(--color-text-tertiary)",
                }}
              >
                No budgets for this month. Add one below.
              </p>
            ) : (
              rows.map(({ budget, category, spent }, idx) => {
                const pct = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
                const emoji = CATEGORY_EMOJI[category?.name ?? ""] ?? "📦";
                const isOver = spent > budget.amount;

                return (
                  <div key={budget.id}>
                    {idx > 0 && <div style={divider} />}
                    <div style={{ padding: "var(--space-4)" }}>
                      {/* Name + actions */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: "var(--space-2)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "var(--space-2)",
                            minWidth: 0,
                          }}
                        >
                          <span style={{ flexShrink: 0 }}>{emoji}</span>
                          <span
                            style={{
                              fontSize: "var(--text-sm)",
                              fontWeight: "var(--weight-medium)",
                              color: "var(--color-text-primary)",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {category?.name ?? "Unknown"}
                          </span>
                        </div>
                        <div style={{ display: "flex", flexShrink: 0 }}>
                          <button
                            onClick={() => setSheet({ open: true, budget })}
                            aria-label={`Edit ${category?.name ?? "budget"}`}
                            style={{ ...actionBtn, color: "var(--color-text-secondary)" }}
                          >
                            <EditIcon />
                          </button>
                          <button
                            onClick={() => handleDelete(budget, category?.name ?? "this budget")}
                            aria-label={`Delete ${category?.name ?? "budget"}`}
                            style={{ ...actionBtn, color: "var(--color-negative)" }}
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <ProgressBar pct={pct} />

                      {/* Spent / remaining labels */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginTop: "var(--space-1)",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "var(--text-xs)",
                            color: "var(--color-text-tertiary)",
                          }}
                        >
                          {formatIDRCompact(spent)} spent
                        </span>
                        <span
                          style={{
                            fontSize: "var(--text-xs)",
                            fontWeight: "var(--weight-medium)",
                            color: isOver
                              ? "var(--color-negative)"
                              : "var(--color-text-secondary)",
                          }}
                        >
                          {isOver
                            ? `+${formatIDRCompact(spent - budget.amount)} over`
                            : `${formatIDRCompact(budget.amount - spent)} left`}
                          {" · "}
                          {Math.round(pct)}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* Add budget row */}
            <button
              onClick={() => setSheet({ open: true })}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-2)",
                width: "100%",
                minHeight: 44,
                padding: "var(--space-2) var(--space-4)",
                background: "transparent",
                border: "none",
                borderTop: "0.5px solid var(--color-border)",
                cursor: "pointer",
                color: "var(--color-accent)",
                fontSize: "var(--text-sm)",
                fontWeight: "var(--weight-medium)",
                textAlign: "left",
              }}
            >
              <PlusIcon />
              Add budget
            </button>
          </div>
        </section>
      </main>

      <BudgetSheet
        isOpen={sheet.open}
        onClose={() => setSheet({ open: false })}
        budget={sheet.budget}
        year={year}
        month={month}
        categories={categories}
        takenCategoryIds={takenCategoryIds}
      />
    </>
  );
}

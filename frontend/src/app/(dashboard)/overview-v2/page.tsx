"use client";

import Link from "next/link";
import { useState } from "react";
import { AddTransactionSheet } from "@/src/components/features/AddTransactionSheet";
import { CashFlowChart } from "@/src/components/features/CashFlowChart";
import { SpendingBreakdownChart } from "@/src/components/features/SpendingBreakdownChart";
import { formatIDR, formatIDRCompact, formatTime } from "@/src/lib/utils/format";
import { useOverviewData } from "@/src/lib/api/useOverviewData";
import { useAuthStore } from "@/src/store/auth";
import type { DashboardAttentionTone } from "@/src/lib/mock/mock-dashboard";

const ATTENTION_SYMBOL: Record<DashboardAttentionTone, string> = {
  warning: "!",
  danger: "!",
  info: "i",
};

// Budget bar colour steps: calm, nearly spent, over. The text beside the bar
// says the same thing, so colour is never the only signal.
function budgetTone(percentageUsed: number): "ok" | "near" | "over" {
  if (percentageUsed > 100) return "over";
  if (percentageUsed >= 80) return "near";
  return "ok";
}

function greeting(date: Date): string {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 18) return "Good afternoon";
  return "Good evening";
}

function EyeIcon({ hidden }: { hidden: boolean }) {
  return hidden ? (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M2 2L16 16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path
        d="M7.5 4C8 3.84 8.49 3.75 9 3.75c5 0 7.5 5.25 7.5 5.25a14.2 14.2 0 0 1-2.1 2.85M5.3 5.55A13.8 13.8 0 0 0 1.5 9S4 14.25 9 14.25c1.47 0 2.78-.47 3.87-1.24"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M1.5 9S4 3.5 9 3.5 16.5 9 16.5 9 14 14.5 9 14.5 1.5 9 1.5 9Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export default function OverviewV2Page() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [valuesHidden, setValuesHidden] = useState(false);
  const userName = useAuthStore((state) => state.user?.username) || "there";
  const { data, isLoading, isError, hasBudget } = useOverviewData(userName);
  if (isLoading) {
    return <div className="ov-page ov-status" role="status" aria-live="polite">Loading your overview…</div>;
  }
  if (isError || !data) {
    return <div className="ov-page ov-status ov-status--error" role="alert">Your overview could not be loaded. Please refresh the page to try again.</div>;
  }
  const latestCashFlow = data.cashFlow.at(-1);
  const monthlySaved = latestCashFlow
    ? latestCashFlow.income - latestCashFlow.expenses
    : 0;
  const displayAmount = (amount: number, compact = false): string =>
    valuesHidden ? "Rp ••••••" : compact ? formatIDRCompact(amount) : formatIDR(amount);
  const summary = [
    { label: "Income", value: latestCashFlow?.income ?? 0, tone: "in" },
    { label: "Expenses", value: latestCashFlow?.expenses ?? 0, tone: "out" },
    { label: "Saved", value: monthlySaved, tone: "neutral" },
  ] as const;

  return (
    <>
      <div className="ov-page">
        <header>
          <p className="ov-eyebrow">{data.periodLabel}</p>
          <h1 className="ov-title">
            {greeting(new Date())}, {data.userName}
          </h1>
          <p className="ov-subtitle">Here&apos;s how your money is doing this month.</p>
        </header>

        <section aria-labelledby="available-balance-heading" className="ov-balance">
          <div className="min-w-0">
            <div className="ov-balance__label-row">
              <h2 id="available-balance-heading" className="ov-balance__label">
                Available balance
              </h2>
              <button
                type="button"
                className="ov-icon-button"
                aria-label={valuesHidden ? "Show financial values" : "Hide financial values"}
                aria-pressed={valuesHidden}
                onClick={() => setValuesHidden((hidden) => !hidden)}
              >
                <EyeIcon hidden={valuesHidden} />
              </button>
            </div>
            <p className="ov-balance__value">{displayAmount(data.balance.availableBalance)}</p>
            <p className="ov-balance__meta">Across {data.balance.walletCount} wallets</p>
          </div>
          <button
            type="button"
            className="btn-primary ov-balance__action"
            onClick={() => setSheetOpen(true)}
          >
            <span aria-hidden="true">＋</span> Add transaction
          </button>
        </section>

        <div className="ov-grid ov-grid--main">
          <section aria-labelledby="cash-flow-heading" className="ov-card ov-card--padded">
            <div className="ov-card__head ov-card__head--flush">
              <div>
                <h2 id="cash-flow-heading" className="ov-card__title ov-card__title--lg">Cash flow</h2>
                <p className="ov-card__subtitle">Income and expenses over time</p>
              </div>
              <span className="ov-chip">Last 6 months</span>
            </div>

            {valuesHidden ? (
              <div className="ov-hidden-chart">Financial values are hidden</div>
            ) : (
              <CashFlowChart data={data.cashFlow} />
            )}

            <dl className="ov-summary">
              {summary.map((item) => (
                <div key={item.label} className="min-w-0">
                  <dt className="ov-summary__label">{item.label}</dt>
                  <dd className={`ov-summary__value ov-amount--${item.tone}`}>
                    {displayAmount(item.value, true)}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <div className="ov-stack">
            <section aria-labelledby="budget-heading" className="ov-card ov-card--padded">
              <div className="ov-budget__head">
                <div>
                  <h2 id="budget-heading" className="ov-card__title">Monthly budget</h2>
                  <p className="ov-card__subtitle">
                    {hasBudget ? `${displayAmount(data.budget.spent, true)} of ${displayAmount(data.budget.limit, true)}` : "No budgets set for this month"}
                  </p>
                </div>
                <strong className="ov-budget__percent">
                  {hasBudget ? `${data.budget.percentageUsed}%` : "—"}
                </strong>
              </div>
              {hasBudget && (
                <div
                  role="progressbar"
                  aria-label="Monthly budget used"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.min(100, data.budget.percentageUsed)}
                  aria-valuetext={`${data.budget.percentageUsed}% used`}
                  className="ov-meter"
                >
                  <div
                    className={`ov-meter__fill ov-meter__fill--${budgetTone(data.budget.percentageUsed)}`}
                    style={{ width: `${Math.min(100, data.budget.percentageUsed)}%` }}
                  />
                </div>
              )}
              <div className="ov-budget__foot">
                <span className={hasBudget && data.budget.remaining < 0 ? "ov-amount--out" : undefined}>
                  {hasBudget ? data.budget.remaining < 0 ? `${displayAmount(-data.budget.remaining, true)} over budget` : `${displayAmount(data.budget.remaining, true)} remaining` : "Start with a category budget"}
                </span>
                <Link href="/budget" className="ov-link">View budget</Link>
              </div>
            </section>

            <section aria-labelledby="attention-heading" className="ov-card">
              <div className="ov-card__head">
                <h2 id="attention-heading" className="ov-card__title">Needs attention</h2>
              </div>
              {data.attentionItems.length === 0 && (
                <p className="ov-empty">✓ Nothing needs your attention right now.</p>
              )}
              {data.attentionItems.map((item) => (
                <Link key={item.id} href={item.href} className="ov-row ov-attention">
                  <span aria-hidden="true" className={`ov-attention__badge ov-attention__badge--${item.tone}`}>
                    {ATTENTION_SYMBOL[item.tone]}
                  </span>
                  <span className="min-w-0">
                    <strong className="ov-row__title">{item.title}</strong>
                    <span className="ov-row__meta">{item.description}</span>
                  </span>
                </Link>
              ))}
            </section>
          </div>
        </div>

        <div className="ov-grid ov-grid--halves">
          <section aria-labelledby="categories-heading" className="ov-card">
            <div className="ov-card__head">
              <div>
                <h2 id="categories-heading" className="ov-card__title">Top spending</h2>
                <p className="ov-card__subtitle">Largest categories this month</p>
              </div>
              <Link href="/transactions" className="ov-link">View all</Link>
            </div>
            <div className="ov-categories">
              <SpendingBreakdownChart data={data.topCategories} />

              <div aria-label="Spending categories">
                {data.topCategories.map((category) => (
                  <div key={category.id} className="ov-category">
                    <span
                      aria-hidden="true"
                      className="ov-category__swatch"
                      style={{ background: category.color }}
                    />
                    <span className="ov-row__title ov-truncate">{category.name}</span>
                    <span className="ov-category__amount">
                      <span className="ov-row__title">{displayAmount(category.amount, true)}</span>
                      <span className="ov-row__meta">{category.percentage.toFixed(1)}%</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section aria-labelledby="recent-heading" className="ov-card">
            <div className="ov-card__head">
              <div>
                <h2 id="recent-heading" className="ov-card__title">Recent activity</h2>
                <p className="ov-card__subtitle">Latest account movements</p>
              </div>
              <Link href="/transactions" className="ov-link">View all</Link>
            </div>
            {data.recentTransactions.length === 0 && (
              <p className="ov-empty">No transactions yet. Add one to see your activity here.</p>
            )}
            {data.recentTransactions.map((transaction) => (
              <div key={transaction.id} className="ov-row ov-recent">
                <div className="min-w-0 flex-1">
                  <p className="ov-row__title ov-truncate">{transaction.description}</p>
                  <p className="ov-row__meta">
                    {transaction.category} · {formatTime(transaction.occurredAt)}
                  </p>
                </div>
                <p className={`ov-recent__amount ov-amount--${transaction.type === "income" ? "in" : "neutral"}`}>
                  {transaction.type === "income" ? "+" : transaction.type === "expense" ? "−" : ""}
                  {displayAmount(transaction.amount, true)}
                </p>
              </div>
            ))}
          </section>
        </div>
      </div>

      <AddTransactionSheet isOpen={sheetOpen} onClose={() => setSheetOpen(false)} />
    </>
  );
}

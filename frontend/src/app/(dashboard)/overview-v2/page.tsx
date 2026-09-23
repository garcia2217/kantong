"use client";

import Link from "next/link";
import { useState } from "react";
import { AddTransactionSheet } from "@/src/components/features/AddTransactionSheet";
import { CashFlowChart } from "@/src/components/features/CashFlowChart";
import { SpendingBreakdownChart } from "@/src/components/features/SpendingBreakdownChart";
import { formatIDR, formatIDRCompact, formatTime } from "@/src/lib/utils/format";
import { mockDashboardData } from "@/src/lib/mock/mock-dashboard";
import type { DashboardAttentionTone } from "@/src/lib/mock/mock-dashboard";

const cardStyle: React.CSSProperties = {
  background: "var(--color-bg-elevated)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-lg)",
};

const attentionStyles: Record<
  DashboardAttentionTone,
  { color: string; background: string; symbol: string }
> = {
  warning: {
    color: "var(--color-warning)",
    background: "var(--color-warning-bg)",
    symbol: "!",
  },
  danger: {
    color: "var(--color-negative)",
    background: "var(--color-negative-bg)",
    symbol: "!",
  },
  info: {
    color: "var(--color-text-secondary)",
    background: "var(--color-bg-subtle)",
    symbol: "i",
  },
};

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
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const data = mockDashboardData;
  const latestCashFlow = data.cashFlow.at(-1);
  const monthlySaved = latestCashFlow
    ? latestCashFlow.income - latestCashFlow.expenses
    : 0;
  const displayAmount = (amount: number, compact = false): string =>
    valuesHidden ? "Rp ••••••" : compact ? formatIDRCompact(amount) : formatIDR(amount);

  return (
    <>
      <div
        className="overview-v2"
        data-dashboard-theme={theme}
        style={{
          width: "100%",
          maxWidth: 1180,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-6)",
        }}
      >
        <header
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "var(--space-4)",
          }}
        >
          <div>
            <p
              style={{
                marginBottom: "var(--space-1)",
                color: "var(--color-text-secondary)",
                fontSize: "var(--text-xs)",
                fontWeight: "var(--weight-medium)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              {data.periodLabel}
            </p>
            <h1
              style={{
                color: "var(--color-text-primary)",
                fontSize: "var(--text-2xl)",
                fontWeight: "var(--weight-semibold)",
                letterSpacing: "-0.025em",
                lineHeight: "var(--leading-tight)",
              }}
            >
              Good morning, {data.userName}
            </h1>
            <p
              className="hidden sm:block"
              style={{
                marginTop: "var(--space-1)",
                color: "var(--color-text-secondary)",
                fontSize: "var(--text-sm)",
              }}
            >
              Here&apos;s how your money is doing this month.
            </p>
          </div>

          <button
            type="button"
            className="btn-primary"
            onClick={() => setSheetOpen(true)}
            style={{
              minHeight: 44,
              flexShrink: 0,
              padding: "0 var(--space-4)",
              border: "none",
              borderRadius: "var(--radius-md)",
              background: "var(--color-accent)",
              color: "var(--color-accent-fg)",
              cursor: "pointer",
              fontSize: "var(--text-sm)",
              fontWeight: "var(--weight-medium)",
            }}
          >
            <span aria-hidden="true">＋</span> Add transaction
          </button>
        </header>

        <div
          role="group"
          aria-label="Dashboard theme"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "var(--space-2)",
          }}
        >
          <span style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-sm)" }}>
            Theme
          </span>
          {(["light", "dark"] as const).map((option) => (
            <button
              key={option}
              type="button"
              className="overview-v2-theme-toggle"
              aria-pressed={theme === option}
              onClick={() => setTheme(option)}
              style={{
                minWidth: 60,
                minHeight: 44,
                padding: "0 var(--space-3)",
                border: "1px solid var(--color-border-strong)",
                borderRadius: "var(--radius-md)",
                background: theme === option ? "var(--color-accent)" : "var(--color-bg-elevated)",
                color: theme === option ? "var(--color-accent-fg)" : "var(--color-text-primary)",
                cursor: "pointer",
                fontSize: "var(--text-sm)",
                fontWeight: "var(--weight-medium)",
                textTransform: "capitalize",
              }}
            >
              {option}
            </button>
          ))}
        </div>

        <section
          aria-labelledby="available-balance-heading"
          style={{
            paddingBottom: "var(--space-6)",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            <h2
              id="available-balance-heading"
              style={{
                color: "var(--color-text-secondary)",
                fontSize: "var(--text-sm)",
                fontWeight: "var(--weight-medium)",
              }}
            >
              Available balance
            </h2>
            <button
              type="button"
              aria-label={valuesHidden ? "Show financial values" : "Hide financial values"}
              aria-pressed={valuesHidden}
              onClick={() => setValuesHidden((hidden) => !hidden)}
              style={{
                width: 44,
                height: 44,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                margin: -10,
                marginLeft: -6,
                border: 0,
                borderRadius: "var(--radius-md)",
                background: "transparent",
                color: "var(--color-text-secondary)",
                cursor: "pointer",
              }}
            >
              <EyeIcon hidden={valuesHidden} />
            </button>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              flexWrap: "wrap",
              gap: "var(--space-3)",
              marginTop: "var(--space-1)",
            }}
          >
            <p
              style={{
                color: "var(--color-text-primary)",
                fontSize: "clamp(30px, 5vw, 44px)",
                fontWeight: "var(--weight-semibold)",
                letterSpacing: "-0.04em",
                lineHeight: 1.1,
              }}
            >
              {displayAmount(data.balance.availableBalance)}
            </p>
            <p
              style={{
                color: "var(--color-positive)",
                fontSize: "var(--text-sm)",
                fontWeight: "var(--weight-medium)",
              }}
            >
              ↑ {data.balance.changePercentage}% this month
            </p>
          </div>
          <p
            style={{
              marginTop: "var(--space-2)",
              color: "var(--color-text-secondary)",
              fontSize: "var(--text-sm)",
            }}
          >
            Across {data.balance.walletCount} wallets
          </p>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(280px,0.85fr)]">
          <section aria-labelledby="cash-flow-heading" style={{ ...cardStyle, padding: "var(--space-5)" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "var(--space-3)",
                marginBottom: "var(--space-5)",
              }}
            >
              <div>
                <h2
                  id="cash-flow-heading"
                  style={{
                    color: "var(--color-text-primary)",
                    fontSize: "var(--text-lg)",
                    fontWeight: "var(--weight-semibold)",
                  }}
                >
                  Cash flow
                </h2>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-sm)" }}>
                  Income and expenses over time
                </p>
              </div>
              <span
                style={{
                  padding: "var(--space-1) var(--space-2)",
                  borderRadius: "var(--radius-md)",
                  background: "var(--color-bg-subtle)",
                  color: "var(--color-text-secondary)",
                  fontSize: "var(--text-xs)",
                  whiteSpace: "nowrap",
                }}
              >
                Last 6 months
              </span>
            </div>

            {valuesHidden ? (
              <div
                style={{
                  minHeight: 270,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "var(--radius-md)",
                  background: "var(--color-bg-subtle)",
                  color: "var(--color-text-secondary)",
                  fontSize: "var(--text-sm)",
                }}
              >
                Financial values are hidden
              </div>
            ) : (
              <CashFlowChart data={data.cashFlow} />
            )}

            <dl
              className="grid grid-cols-3"
              style={{
                gap: "var(--space-3)",
                marginTop: "var(--space-4)",
                paddingTop: "var(--space-4)",
                borderTop: "1px solid var(--color-border)",
              }}
            >
              {[
                { label: "Income", value: latestCashFlow?.income ?? 0, color: "var(--color-positive)" },
                { label: "Expenses", value: latestCashFlow?.expenses ?? 0, color: "var(--color-negative)" },
                { label: "Saved", value: monthlySaved, color: "var(--color-text-primary)" },
              ].map((item) => (
                <div key={item.label} style={{ minWidth: 0 }}>
                  <dt style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-xs)" }}>
                    {item.label}
                  </dt>
                  <dd
                    style={{
                      marginTop: 2,
                      overflow: "hidden",
                      color: item.color,
                      fontSize: "var(--text-sm)",
                      fontWeight: "var(--weight-semibold)",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {displayAmount(item.value, true)}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
            <section aria-labelledby="budget-heading" style={{ ...cardStyle, padding: "var(--space-5)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--space-3)" }}>
                <div>
                  <h2
                    id="budget-heading"
                    style={{
                      color: "var(--color-text-primary)",
                      fontSize: "var(--text-base)",
                      fontWeight: "var(--weight-semibold)",
                    }}
                  >
                    Monthly budget
                  </h2>
                  <p
                    style={{
                      marginTop: "var(--space-1)",
                      color: "var(--color-text-secondary)",
                      fontSize: "var(--text-sm)",
                    }}
                  >
                    {displayAmount(data.budget.spent, true)} of {displayAmount(data.budget.limit, true)}
                  </p>
                </div>
                <strong style={{ color: "var(--color-text-primary)", fontSize: "var(--text-lg)" }}>
                  {data.budget.percentageUsed}%
                </strong>
              </div>
              <div
                role="progressbar"
                aria-label="Monthly budget used"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={data.budget.percentageUsed}
                style={{
                  height: 8,
                  marginTop: "var(--space-4)",
                  overflow: "hidden",
                  borderRadius: 4,
                  background: "var(--color-bg-subtle)",
                }}
              >
                <div
                  style={{
                    width: `${Math.min(100, data.budget.percentageUsed)}%`,
                    height: "100%",
                    borderRadius: 4,
                    background: "var(--color-positive)",
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "var(--space-3)",
                  marginTop: "var(--space-3)",
                  color: "var(--color-text-secondary)",
                  fontSize: "var(--text-xs)",
                }}
              >
                <span>{displayAmount(data.budget.remaining, true)} remaining</span>
                <Link href="/budget" style={{ color: "inherit", fontWeight: "var(--weight-medium)" }}>
                  View budget
                </Link>
              </div>
            </section>

            <section aria-labelledby="attention-heading" style={cardStyle}>
              <div style={{ padding: "var(--space-4) var(--space-5)", borderBottom: "1px solid var(--color-border)" }}>
                <h2
                  id="attention-heading"
                  style={{
                    color: "var(--color-text-primary)",
                    fontSize: "var(--text-base)",
                    fontWeight: "var(--weight-semibold)",
                  }}
                >
                  Needs attention
                </h2>
              </div>
              <div>
                {data.attentionItems.map((item, index) => {
                  const tone = attentionStyles[item.tone];
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      style={{
                        display: "flex",
                        gap: "var(--space-3)",
                        padding: "var(--space-4) var(--space-5)",
                        borderBottom:
                          index < data.attentionItems.length - 1
                            ? "1px solid var(--color-border)"
                            : undefined,
                        color: "inherit",
                        textDecoration: "none",
                      }}
                    >
                      <span
                        aria-hidden="true"
                        style={{
                          width: 24,
                          height: 24,
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "50%",
                          background: tone.background,
                          color: tone.color,
                          fontSize: "var(--text-xs)",
                          fontWeight: "var(--weight-semibold)",
                        }}
                      >
                        {tone.symbol}
                      </span>
                      <span style={{ minWidth: 0 }}>
                        <strong
                          style={{
                            display: "block",
                            color: "var(--color-text-primary)",
                            fontSize: "var(--text-sm)",
                            fontWeight: "var(--weight-medium)",
                          }}
                        >
                          {item.title}
                        </strong>
                        <span
                          style={{
                            display: "block",
                            marginTop: 2,
                            color: "var(--color-text-secondary)",
                            fontSize: "var(--text-xs)",
                            lineHeight: "var(--leading-normal)",
                          }}
                        >
                          {item.description}
                        </span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section aria-labelledby="categories-heading" style={cardStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "var(--space-4) var(--space-5)",
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              <div>
                <h2
                  id="categories-heading"
                  style={{
                    color: "var(--color-text-primary)",
                    fontSize: "var(--text-base)",
                    fontWeight: "var(--weight-semibold)",
                  }}
                >
                  Top spending
                </h2>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-xs)" }}>
                  Largest categories this month
                </p>
              </div>
              <Link href="/transactions" style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-xs)" }}>
                View all
              </Link>
            </div>
            <div
              className="grid grid-cols-1 items-center sm:grid-cols-[minmax(180px,0.8fr)_minmax(0,1.2fr)]"
              style={{ gap: "var(--space-4)", padding: "var(--space-4) var(--space-5)" }}
            >
              <SpendingBreakdownChart data={data.topCategories} />

              <div aria-label="Spending categories">
                {data.topCategories.map((category, index) => (
                  <div
                    key={category.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "12px minmax(0, 1fr) auto",
                      alignItems: "center",
                      columnGap: "var(--space-2)",
                      minHeight: 48,
                      borderBottom:
                        index < data.topCategories.length - 1
                          ? "1px solid var(--color-border)"
                          : undefined,
                    }}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 3,
                        background: category.color,
                      }}
                    />
                    <span
                      style={{
                        minWidth: 0,
                        overflow: "hidden",
                        color: "var(--color-text-primary)",
                        fontSize: "var(--text-sm)",
                        fontWeight: "var(--weight-medium)",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {category.name}
                    </span>
                    <span style={{ textAlign: "right" }}>
                      <span
                        style={{
                          display: "block",
                          color: "var(--color-text-primary)",
                          fontSize: "var(--text-sm)",
                          fontWeight: "var(--weight-medium)",
                        }}
                      >
                        {displayAmount(category.amount, true)}
                      </span>
                      <span
                        style={{
                          display: "block",
                          color: "var(--color-text-secondary)",
                          fontSize: "var(--text-xs)",
                        }}
                      >
                        {category.percentage.toFixed(1)}%
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section aria-labelledby="recent-heading" style={cardStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "var(--space-4) var(--space-5)",
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              <div>
                <h2
                  id="recent-heading"
                  style={{
                    color: "var(--color-text-primary)",
                    fontSize: "var(--text-base)",
                    fontWeight: "var(--weight-semibold)",
                  }}
                >
                  Recent activity
                </h2>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-xs)" }}>
                  Latest account movements
                </p>
              </div>
              <Link href="/transactions" style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-xs)" }}>
                View all
              </Link>
            </div>
            <div>
              {data.recentTransactions.map((transaction, index) => (
                <div
                  key={transaction.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-3)",
                    minHeight: 62,
                    padding: "var(--space-2) var(--space-5)",
                    borderBottom:
                      index < data.recentTransactions.length - 1
                        ? "1px solid var(--color-border)"
                        : undefined,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        overflow: "hidden",
                        color: "var(--color-text-primary)",
                        fontSize: "var(--text-sm)",
                        fontWeight: "var(--weight-medium)",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {transaction.description}
                    </p>
                    <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-xs)" }}>
                      {transaction.category} · {formatTime(transaction.occurredAt)}
                    </p>
                  </div>
                  <p
                    style={{
                      flexShrink: 0,
                      color:
                        transaction.type === "income"
                          ? "var(--color-positive)"
                          : "var(--color-text-primary)",
                      fontSize: "var(--text-sm)",
                      fontWeight: "var(--weight-semibold)",
                    }}
                  >
                    {transaction.type === "income" ? "+" : "−"}
                    {displayAmount(transaction.amount, true)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <AddTransactionSheet isOpen={sheetOpen} onClose={() => setSheetOpen(false)} />
    </>
  );
}

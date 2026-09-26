import type { CSSProperties } from "react";
import type { DemoEntry } from "@/src/lib/utils/parseDemoMessage";
import { formatIDR } from "@/src/lib/utils/format";

export interface DemoOutcome {
  id: number;
  entry: DemoEntry;
  budgetLimit: number;
  spentBefore: number;
  spentAfter: number;
  walletBalance: number;
}

interface LandingTryItResultProps {
  outcome: DemoOutcome | null;
}

interface BudgetMeterProps {
  outcome: DemoOutcome;
}

function BudgetMeter({ outcome }: BudgetMeterProps) {
  const { budgetLimit, spentBefore, spentAfter, entry } = outcome;
  const isOver = spentAfter > budgetLimit;
  const afterShare = Math.min(spentAfter / budgetLimit, 1);
  const beforeShare = Math.min(spentBefore / budgetLimit, 1);
  // The fill grows from the old total to the new one when a result lands.
  const fillStyle = {
    width: `${afterShare * 100}%`,
    "--lp-fill-from": afterShare > 0 ? beforeShare / afterShare : 0,
  } as CSSProperties;

  return (
    <div className={`lp-try-budget ${isOver ? "lp-try-budget--over" : ""}`}>
      <p className="lp-try-budget__label">
        <span>{entry.category.name} budget</span>
        <span>
          {formatIDR(spentAfter)} of {formatIDR(budgetLimit)}
        </span>
      </p>
      <div className="lp-try-budget__track">
        <div className="lp-try-budget__fill" style={fillStyle} />
      </div>
      <p className="lp-try-budget__note">
        {isOver
          ? `⚠️ Over by ${formatIDR(spentAfter - budgetLimit)}. Kantong would warn you here.`
          : `${formatIDR(budgetLimit - spentAfter)} left this month`}
      </p>
    </div>
  );
}

export function LandingTryItResult({ outcome }: LandingTryItResultProps) {
  if (!outcome) {
    return (
      <div className="lp-try-result lp-try-result--empty">
        <p className="lp-try-result__caption">In Kantong</p>
        <p className="lp-try-result__empty">
          Send a message and watch it land here: sorted, counted and checked against your
          budget.
        </p>
      </div>
    );
  }

  const { entry, walletBalance } = outcome;
  const isIncome = entry.category.type === "income";

  // Keyed by outcome id so each new entry replays the entrance animation.
  return (
    <div key={outcome.id} className="lp-try-result">
      <p className="lp-try-result__caption">In Kantong</p>
      <div className="lp-try-row">
        <span className="lp-phone__row-icon">{entry.category.icon}</span>
        <span className="lp-phone__row-text">
          <span className="lp-try-row__title">{entry.description}</span>
          <span className="lp-try-row__meta">
            {entry.category.name} · {entry.wallet} · just now
          </span>
        </span>
        <span className={`lp-try-row__amount ${isIncome ? "lp-try-row__amount--in" : ""}`}>
          {isIncome ? "+" : "−"}
          {formatIDR(entry.amount)}
        </span>
      </div>

      {isIncome ? (
        <p className="lp-try-result__income">
          {entry.wallet} balance is now <strong>{formatIDR(walletBalance)}</strong>
        </p>
      ) : (
        <BudgetMeter outcome={outcome} />
      )}
    </div>
  );
}

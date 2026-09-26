import type { CSSProperties, ReactNode } from "react";
import { formatIDR } from "@/src/lib/utils/format";

interface Feature {
  id: string;
  before: string;
  title: string;
  body: string;
  visual: ReactNode;
}

interface BudgetSample {
  name: string;
  share: number;
}

const WALLETS = [
  { name: "BCA", balance: 8_250_000, tone: "#2f5a86" },
  { name: "GoPay", balance: 1_255_000, tone: "#00a5cf" },
  { name: "Cash", balance: 850_000, tone: "#1e7a57" },
] as const;

const BUDGETS: BudgetSample[] = [
  { name: "Groceries", share: 0.42 },
  { name: "Transport", share: 0.71 },
  { name: "Dining Out", share: 0.93 },
];

function WalletsVisual() {
  return (
    <ul className="lp-feature-visual lp-feature-wallets">
      {WALLETS.map((wallet) => (
        <li key={wallet.name} style={{ "--lp-wallet-tone": wallet.tone } as CSSProperties}>
          <span className="lp-feature-wallets__dot" />
          <span className="lp-feature-wallets__name">{wallet.name}</span>
          <span className="lp-feature-wallets__amount">{formatIDR(wallet.balance)}</span>
        </li>
      ))}
    </ul>
  );
}

function BudgetsVisual() {
  return (
    <ul className="lp-feature-visual lp-feature-budgets">
      {BUDGETS.map((budget) => (
        <li key={budget.name}>
          <span className="lp-feature-budgets__label">
            <span>{budget.name}</span>
            <span>{Math.round(budget.share * 100)}%</span>
          </span>
          <span className="lp-feature-budgets__track">
            <span
              className={`lp-feature-budgets__fill ${budget.share > 0.9 ? "lp-feature-budgets__fill--hot" : ""}`}
              style={{ width: `${budget.share * 100}%` }}
            />
          </span>
        </li>
      ))}
    </ul>
  );
}

function DebtsVisual() {
  return (
    <ul className="lp-feature-visual lp-feature-debts">
      <li>
        <span>Andi owes you</span>
        <span className="lp-feature-debts__in">{formatIDR(150_000)}</span>
        <span className="lp-feature-debts__due">Due Friday</span>
      </li>
      <li>
        <span>You owe Sari</span>
        <span className="lp-feature-debts__out">{formatIDR(80_000)}</span>
        <span className="lp-feature-debts__due">Due in 12 days</span>
      </li>
    </ul>
  );
}

const FEATURES: Feature[] = [
  {
    id: "wallets",
    before: "Checking three apps to know what you have",
    title: "Every wallet, one number",
    body: "Bank accounts, e-wallets and cash side by side, each with its own balance and one total at the top.",
    visual: <WalletsVisual />,
  },
  {
    id: "budgets",
    before: "Finding out the budget is gone at the end of the month",
    title: "See what's left before you spend",
    body: "Set a monthly limit per category. Kantong shows what's left, and flags a category the moment it goes over.",
    visual: <BudgetsVisual />,
  },
  {
    id: "debts",
    before: "“Wait, did you ever pay me back?”",
    title: "Debts nobody forgets",
    body: "Track who owes you, what you owe, and when it's due, so it never gets awkward.",
    visual: <DebtsVisual />,
  },
];

export function LandingFeatures() {
  return (
    <section className="lp-section lp-features" aria-labelledby="lp-features-title">
      <div className="lp-container">
        <p className="lp-eyebrow">What you get</p>
        <h2 id="lp-features-title" className="lp-display lp-section__title">
          Everything your money needs. Nothing it doesn&apos;t.
        </h2>

        <ul className="lp-features__grid">
          {FEATURES.map((feature) => (
            <li key={feature.id} className="lp-feature-card">
              <div aria-hidden="true">{feature.visual}</div>
              <p className="lp-feature-card__before">
                <span className="sr-only">Before Kantong: </span>
                {feature.before}
              </p>
              <h3 className="lp-feature-card__title">{feature.title}</h3>
              <p className="lp-feature-card__body">{feature.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

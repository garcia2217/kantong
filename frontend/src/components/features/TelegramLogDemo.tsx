"use client";

import { useLayoutEffect, useRef, type CSSProperties } from "react";
import type { Category, Transaction } from "@/src/types";
import { TransactionRow } from "@/src/components/ui/TransactionRow";
import { formatIDR } from "@/src/lib/utils/format";

const DEMO_CATEGORY: Category = {
  id: "dining",
  user_id: "demo",
  name: "Dining Out",
  type: "expense",
  created_at: "",
};

// No timezone suffix, so server and browser render the same time.
const DEMO_TRANSACTION: Transaction = {
  id: "tx-demo",
  user_id: "demo",
  wallet_id: "demo",
  category_id: "dining",
  amount: 45_000,
  type: "expense",
  description: "Makan siang",
  destination_wallet_id: null,
  transaction_date: "2026-09-25T12:30:00",
  created_at: "",
};

const BUDGET_LIMIT = 1_000_000;
const BUDGET_SPENT_BEFORE = 600_000;
const BUDGET_SPENT_AFTER = 645_000;

// The bar grows from the old total to the new one when the expense lands.
const BUDGET_FILL_STYLE = {
  width: `${(BUDGET_SPENT_AFTER / BUDGET_LIMIT) * 100}%`,
  "--budget-start-scale": BUDGET_SPENT_BEFORE / BUDGET_SPENT_AFTER,
} as CSSProperties;

const DEMO_LABEL =
  "Example: a Telegram message saying 'Makan siang 45rb pake GoPay' is recorded by the Kantong bot as a Rp 45,000 Dining Out expense, which then appears in your transactions and your Dining Out budget.";

const noop = (): void => undefined;

// The resting markup (no data-state) is the finished frame, so no-JS and
// reduced-motion visitors see the full story without any animation.
function playDemo(el: HTMLElement): void {
  el.dataset.state = "ready";
  void el.offsetWidth; // Restart the CSS animations on replay.
  el.dataset.state = "playing";
}

export function TelegramLogDemo() {
  const demoRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = demoRef.current;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!el || prefersReducedMotion || !("IntersectionObserver" in window)) return;

    // Hide the frame before first paint, then play once it scrolls into view.
    el.dataset.state = "ready";
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.dataset.state = "playing";
        observer.disconnect();
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleReplay = (): void => {
    if (demoRef.current) playDemo(demoRef.current);
  };

  return (
    <section className="login-telegram" aria-labelledby="login-telegram-title">
      <h2 id="login-telegram-title" className="login-section-title">
        Log spending in one message
      </h2>
      <p className="login-telegram__body">
        Tell the Kantong bot on Telegram what you spent, in your own words. It records
        the transaction in the right wallet, and your budget updates on its own.
      </p>

      <figure className="login-telegram__figure" role="img" aria-label={DEMO_LABEL}>
        <div ref={demoRef} className="login-telegram__demo" inert>
          <div className="login-chat">
            <p className="login-chat__header">Telegram · Kantong bot</p>
            <p className="login-chat__bubble login-chat__bubble--user">
              Makan siang 45rb pake GoPay
            </p>
            <p className="login-chat__bubble login-chat__bubble--bot">
              ✅ Recorded: Expense of Rp 45,000 for Dining Out (Makan siang).
              <br />
              New GoPay balance: Rp 1,255,000
            </p>
          </div>

          <div className="login-telegram__result">
            <p className="login-preview__caption">In Kantong</p>
            <div className="transactions-list login-preview__list login-telegram__row">
              <TransactionRow tx={DEMO_TRANSACTION} category={DEMO_CATEGORY} onEdit={noop} />
            </div>
            <div className="login-budget">
              <p className="login-budget__label">
                <span>Dining Out budget</span>
                <span>
                  {formatIDR(BUDGET_SPENT_AFTER)} of {formatIDR(BUDGET_LIMIT)}
                </span>
              </p>
              <div className="login-budget__track">
                <div className="login-budget__fill" style={BUDGET_FILL_STYLE} />
              </div>
            </div>
          </div>
        </div>
      </figure>

      <button type="button" className="login-telegram__replay" onClick={handleReplay}>
        Play again
      </button>
    </section>
  );
}

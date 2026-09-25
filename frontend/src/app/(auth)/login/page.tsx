import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginPanel } from "@/src/components/features/LoginPanel";
import { LoginPreview } from "@/src/components/features/LoginPreview";

export const metadata: Metadata = {
  title: "Sign in · Kantong",
  description:
    "Track wallets, budgets and debts in one place, and log spending from Telegram.",
};

const FEATURES = [
  {
    title: "Wallets",
    body: "Cash, bank accounts and e-wallets in one view, each with its own balance.",
  },
  {
    title: "Budgets",
    body: "Set a monthly limit per category and see what's left before you spend.",
  },
  {
    title: "Debts",
    body: "Keep track of who owes you, what you owe, and when it's due.",
  },
] as const;

function KantongMark() {
  return (
    <span className="login-brand__mark" aria-hidden="true">
      <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
        <rect x="2" y="12" width="4" height="8" rx="1" fill="currentColor" opacity="0.55" />
        <rect x="9" y="7" width="4" height="13" rx="1" fill="currentColor" />
        <rect x="16" y="2" width="4" height="18" rx="1" fill="currentColor" opacity="0.7" />
      </svg>
    </span>
  );
}

export default function LoginPage() {
  return (
    <main className="login-page">
      <div className="login-layout">
        <header className="login-intro">
          <p className="login-brand">
            <KantongMark />
            Kantong
          </p>
          <h1 className="login-headline">Your money, in your pocket.</h1>
          <p className="login-lede">
            Track wallets, budgets and debts in one place, and log spending with a
            single Telegram message.
          </p>
        </header>

        <div className="login-panel-slot">
          {/* useSearchParams needs a Suspense boundary for static rendering. */}
          <Suspense>
            <LoginPanel />
          </Suspense>
        </div>

        <div className="login-details">
          <LoginPreview />

          <section className="login-features" aria-labelledby="login-features-title">
            <h2 id="login-features-title" className="login-section-title">
              Everything your money needs
            </h2>
            <ul className="login-features__list">
              {FEATURES.map((feature) => (
                <li key={feature.title} className="login-feature">
                  <h3 className="login-feature__title">{feature.title}</h3>
                  <p className="login-feature__body">{feature.body}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}

import { Suspense } from "react";
import type { Metadata } from "next";
import { GoogleSignInButton } from "@/src/components/features/GoogleSignInButton";
import { LandingHero } from "@/src/components/features/LandingHero";
import { LoginPanel } from "@/src/components/features/LoginPanel";
import { LandingFeatures } from "@/src/components/features/LandingFeatures";
import { LandingProblem } from "@/src/components/features/LandingProblem";
import { LandingTryIt } from "@/src/components/features/LandingTryIt";
import { displayFont } from "@/src/lib/fonts";
import "./landing.css";

export const metadata: Metadata = {
  title: "Kantong · Know where your money goes",
  description:
    "Track wallets, budgets and debts in one place, and log spending from Telegram.",
};

export default function LandingPage() {
  return (
    <div className={`landing ${displayFont.variable}`}>
      <LandingHero />

      <LandingProblem />

      <section className="lp-section lp-try-section" aria-labelledby="lp-try-title">
        <div className="lp-container">
          <p className="lp-eyebrow">Try it now · no sign-up needed</p>
          <h2 id="lp-try-title" className="lp-display lp-section__title">
            Type it like you&apos;d text a friend.
          </h2>
          <p className="lp-section__lede">
            No forms, no dropdowns. Send the Kantong bot one message and it works out the
            amount, the category and the wallet. Go on, try one.
          </p>
          <LandingTryIt />
          <p className="lp-try-footnote">
            This demo runs in your browser and saves nothing. The real bot understands
            far more than these examples.
          </p>
        </div>
      </section>

      <LandingFeatures />

      {/* TODO: the sections below keep the old layout until step 6 replaces them. */}
      <main className="login-page">
        <div className="login-layout">
          <div className="login-panel-slot">
            {/* useSearchParams needs a Suspense boundary for static rendering. */}
            <Suspense>
              <LoginPanel />
            </Suspense>
          </div>

          <div className="login-details">
            <section className="login-closing" aria-labelledby="login-closing-title">
              <h2 id="login-closing-title" className="login-section-title">
                Ready to try Kantong?
              </h2>
              <GoogleSignInButton />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

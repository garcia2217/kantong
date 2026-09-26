import type { Metadata } from "next";
import { LandingHero } from "@/src/components/features/LandingHero";
import { LoginPanel } from "@/src/components/features/LoginPanel";
import { LandingFaq } from "@/src/components/features/LandingFaq";
import { LandingFeatures } from "@/src/components/features/LandingFeatures";
import { LandingProblem } from "@/src/components/features/LandingProblem";
import { LandingStickyCta } from "@/src/components/features/LandingStickyCta";
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

      <main>
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

        <LandingFaq />

        <LoginPanel />
      </main>

      <LandingStickyCta />
    </div>
  );
}

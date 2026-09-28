import Link from "next/link";
import { GoogleSignInButton } from "@/src/components/features/GoogleSignInButton";
import { LandingPhone } from "@/src/components/features/LandingPhone";
import { KantongMark } from "@/src/components/ui/KantongMark";

// Friction removers shown under the CTA; each answers a reason not to click.
const REASSURANCES = ["Free to use", "No bank login", "Ready in under a minute"] as const;

export function LandingHero() {
  return (
    <header className="lp-hero">
      <nav className="lp-container lp-nav" aria-label="Kantong">
        <Link href="/" className="lp-nav__brand">
          <KantongMark className="lp-nav__mark" />
          Kantong
        </Link>
        <Link href="#sign-in" className="lp-nav__signin">
          Sign in
        </Link>
      </nav>

      <div className="lp-container lp-hero__body">
        <div className="lp-hero__copy">
          <p className="lp-eyebrow lp-hero__eyebrow">Money tracking without the spreadsheet</p>
          <h1 className="lp-display lp-hero__title">
            Payday lands. Three days later, <span className="lp-hero__accent">where did it go?</span>
          </h1>
          <p className="lp-hero__lede">
            Kantong shows you where every rupiah goes. Text what you spent to our Telegram
            bot and it&apos;s logged, sorted and counted against your budget in seconds.
          </p>

          <div className="lp-hero__cta">
            <GoogleSignInButton variant="landing" label="Start free with Google" />
            <ul className="lp-reassure lp-hero__reassure">
              {REASSURANCES.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <LandingPhone />
      </div>
    </header>
  );
}

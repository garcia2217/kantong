import { formatIDR } from "@/src/lib/utils/format";

interface Leak {
  label: string;
  unit: number;
  times: number;
  cadence: string;
}

// An illustrative month: each item is small, the total is not.
const LEAKS: Leak[] = [
  { label: "☕ Coffee on the way in", unit: 25_000, times: 22, cadence: "workdays" },
  { label: "🛵 Ojol when you're running late", unit: 30_000, times: 15, cadence: "rides" },
  { label: "🍢 Snacks and jajan", unit: 15_000, times: 30, cadence: "days" },
  { label: "📺 Subscriptions you forgot", unit: 55_000, times: 3, cadence: "apps" },
];

const TOTAL = LEAKS.reduce((sum, leak) => sum + leak.unit * leak.times, 0);

export function LandingProblem() {
  return (
    <section className="lp-section lp-problem" aria-labelledby="lp-problem-title">
      <div className="lp-container lp-problem__grid">
        <div>
          <p className="lp-eyebrow">The problem</p>
          <h2 id="lp-problem-title" className="lp-display lp-section__title">
            Small spends don&apos;t feel like much. Until you add them up.
          </h2>
          <p className="lp-section__lede">
            Nobody decides to spend {formatIDR(TOTAL)} a month on little things. It just
            happens, a few thousand at a time, and you only notice when the balance is low.
            Kantong makes each one visible the moment it happens.
          </p>
        </div>

        <figure className="lp-receipt" aria-labelledby="lp-receipt-caption">
          <figcaption id="lp-receipt-caption" className="lp-receipt__caption">
            A typical month, for example
          </figcaption>
          <ul className="lp-receipt__list">
            {LEAKS.map((leak) => (
              <li key={leak.label} className="lp-receipt__item">
                <span className="lp-receipt__label">
                  {leak.label}
                  <span className="lp-receipt__math">
                    {formatIDR(leak.unit)} × {leak.times} {leak.cadence}
                  </span>
                </span>
                <span className="lp-receipt__amount">{formatIDR(leak.unit * leak.times)}</span>
              </li>
            ))}
          </ul>
          <p className="lp-receipt__total">
            <span>Gone without a decision</span>
            <strong>{formatIDR(TOTAL)}</strong>
          </p>
        </figure>
      </div>
    </section>
  );
}

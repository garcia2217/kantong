interface FaqItem {
  question: string;
  answer: string;
}

// Ordered by how often each worry stops someone signing up.
// TODO: keep these in step with the product (pricing, OAuth scopes, the bot's parser).
const FAQ: FaqItem[] = [
  {
    question: "Is Kantong free?",
    answer: "Yes, Kantong is currently free to use. There's no card to enter when you sign up.",
  },
  {
    question: "Does Kantong connect to my bank?",
    answer:
      "No. Kantong never asks for bank logins, PINs or card numbers. You record what you spend, by Telegram message or in the app, and your balances update from that.",
  },
  {
    question: "Who can see my financial data?",
    answer:
      "Only you. Your wallets, transactions, budgets and debts belong to your account and aren't shared. Messages you send the bot are read by an AI model only to work out the amount, category and wallet.",
  },
  {
    question: "Why sign in with Google?",
    answer:
      "It's one tap and there's no new password to remember. Kantong only receives your name, email and profile picture to confirm it's you. It can't see your Gmail, Drive or anything else.",
  },
  {
    question: "Do I need Telegram?",
    answer:
      "No. You can add and edit everything in the web app. Telegram is simply the fastest way to log spending while you're out.",
  },
  {
    question: "Can I delete my account?",
    answer: "Yes. You can delete your account and all of its data whenever you want.",
  },
];

export function LandingFaq() {
  return (
    <section className="lp-section lp-faq" aria-labelledby="lp-faq-title">
      <div className="lp-container lp-faq__grid">
        <div>
          <p className="lp-eyebrow">Questions</p>
          <h2 id="lp-faq-title" className="lp-display lp-section__title">
            Fair questions, straight answers.
          </h2>
        </div>

        <div className="lp-faq__list">
          {FAQ.map((item) => (
            <details key={item.question} className="lp-faq__item">
              <summary className="lp-faq__question">{item.question}</summary>
              <p className="lp-faq__answer">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

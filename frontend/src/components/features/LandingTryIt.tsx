"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { GoogleSignInButton } from "@/src/components/features/GoogleSignInButton";
import {
  LandingTryItResult,
  type DemoOutcome,
} from "@/src/components/features/LandingTryItResult";
import { formatIDR } from "@/src/lib/utils/format";
import { parseDemoMessage, type DemoEntry } from "@/src/lib/utils/parseDemoMessage";

interface ChatMessage {
  id: number;
  from: "user" | "bot";
  text: string;
}

const SUGGESTIONS = [
  "kopi susu 25rb",
  "makan siang 45rb pake gopay",
  "grab ke kantor 32k",
  "gaji 8,5jt",
] as const;

// Sample month so the budget bar has somewhere to start.
const BUDGET_LIMITS: Record<string, number> = {
  "Dining Out": 1_500_000,
  Transport: 800_000,
  Groceries: 2_000_000,
  Bills: 1_000_000,
  Entertainment: 300_000,
  Shopping: 500_000,
  Other: 500_000,
};

const INITIAL_SPENT: Record<string, number> = {
  "Dining Out": 1_180_000,
  Transport: 310_000,
  Groceries: 1_240_000,
  Bills: 650_000,
  Entertainment: 186_000,
  Shopping: 320_000,
  Other: 120_000,
};

const INITIAL_BALANCES: Record<string, number> = { Cash: 850_000, GoPay: 1_300_000 };
const DEFAULT_BALANCE = 1_000_000;

const GREETING: ChatMessage = {
  id: 0,
  from: "bot",
  text: "Hi! Tell me what you spent, the way you'd text a friend. 👋",
};

const MAX_MESSAGES = 6;
const BOT_DELAY_MS = 650;

function botReply(entry: DemoEntry, walletBalance: number): string {
  const kind = entry.category.type === "income" ? "Income" : "Expense";
  return `✅ Recorded: ${kind} of ${formatIDR(entry.amount)} for ${entry.category.name} (${entry.description}).\nNew ${entry.wallet} balance: ${formatIDR(walletBalance)}`;
}

export function LandingTryIt() {
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [draft, setDraft] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [outcome, setOutcome] = useState<DemoOutcome | null>(null);
  const spentRef = useRef<Record<string, number>>({ ...INITIAL_SPENT });
  const balancesRef = useRef<Record<string, number>>({ ...INITIAL_BALANCES });
  const nextIdRef = useRef(1);
  const timerRef = useRef<number | null>(null);
  const logRef = useRef<HTMLOListElement>(null);

  // Keep the newest message in view inside the fixed-height chat.
  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [messages, isTyping]);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  const pushMessage = (from: ChatMessage["from"], text: string): void => {
    const message = { id: nextIdRef.current++, from, text };
    setMessages((current) => [...current, message].slice(-MAX_MESSAGES));
  };

  const respond = (text: string): void => {
    const entry = parseDemoMessage(text);
    if (!entry) {
      pushMessage("bot", "🤔 I couldn't find an amount in that. Try something like “kopi 25rb”.");
      return;
    }

    const isIncome = entry.category.type === "income";
    const walletBefore = balancesRef.current[entry.wallet] ?? DEFAULT_BALANCE;
    const walletBalance = walletBefore + (isIncome ? entry.amount : -entry.amount);
    balancesRef.current[entry.wallet] = walletBalance;

    const spentBefore = spentRef.current[entry.category.name] ?? 0;
    const spentAfter = isIncome ? spentBefore : spentBefore + entry.amount;
    spentRef.current[entry.category.name] = spentAfter;

    pushMessage("bot", botReply(entry, walletBalance));
    setOutcome({
      id: nextIdRef.current,
      entry,
      budgetLimit: BUDGET_LIMITS[entry.category.name] ?? 0,
      spentBefore,
      spentAfter,
      walletBalance,
    });
  };

  const send = (text: string): void => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;
    pushMessage("user", trimmed);
    setDraft("");
    setIsTyping(true);
    timerRef.current = window.setTimeout(() => {
      setIsTyping(false);
      respond(trimmed);
    }, BOT_DELAY_MS);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    send(draft);
  };

  return (
    <div className="lp-try">
      <div className="lp-try-chat">
        <p className="lp-try-chat__header">
          <span className="lp-phone__toast-icon" aria-hidden="true">✈️</span>
          <span>
            <span className="lp-try-chat__name">Kantong bot</span>
            <span className="lp-try-chat__status">{isTyping ? "typing…" : "online"}</span>
          </span>
        </p>

        <ol
          ref={logRef}
          className="lp-try-chat__log"
          role="log"
          aria-live="polite"
          aria-label="Demo chat"
        >
          {messages.map((message) => (
            <li key={message.id} className={`lp-try-bubble lp-try-bubble--${message.from}`}>
              {message.text}
            </li>
          ))}
          {isTyping && (
            <li className="lp-try-bubble lp-try-bubble--bot lp-try-bubble--typing" aria-hidden="true">
              <span />
              <span />
              <span />
            </li>
          )}
        </ol>

        <div className="lp-try-chips" aria-label="Example messages">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              className="lp-try-chip"
              onClick={() => send(suggestion)}
              disabled={isTyping}
            >
              {suggestion}
            </button>
          ))}
        </div>

        <form className="lp-try-form" onSubmit={handleSubmit}>
          <label htmlFor="lp-try-input" className="sr-only">
            Type what you spent
          </label>
          <input
            id="lp-try-input"
            className="lp-try-form__input"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="e.g. bakso 20rb pake ovo"
            maxLength={80}
            autoComplete="off"
            enterKeyHint="send"
          />
          <button
            type="submit"
            className="lp-try-form__send"
            disabled={!draft.trim() || isTyping}
            aria-label="Send"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 12l16-8-6 16-2.5-6.5L4 12z" fill="currentColor" />
            </svg>
          </button>
        </form>
      </div>

      <div className="lp-try-side">
        <LandingTryItResult outcome={outcome} />

        {outcome && (
          <div className="lp-try-cta">
            <p className="lp-try-cta__text">
              That&apos;s the whole habit. Ready to do it with your real money?
            </p>
            <GoogleSignInButton variant="landing" label="Start free with Google" />
          </div>
        )}
      </div>
    </div>
  );
}

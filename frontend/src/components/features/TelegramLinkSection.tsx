"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/src/store/auth";
import { userService } from "@/src/lib/api/services/users";

const CODE_LIFETIME_MS = 5 * 60 * 1000;
const BOT_URL = "https://t.me/garcia_finance_bot";
const actionClass = "inline-flex min-h-11 items-center justify-center rounded-[var(--radius-md)] px-4 text-[var(--text-sm)] font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] disabled:opacity-50";

export function TelegramLinkSection() {
  const user = useAuthStore((state) => state.user);
  const isConnected = user?.telegram_chat_id != null;
  const [linkCode, setLinkCode] = useState<{ value: string; expiresAt: number } | null>(null);
  const [now, setNow] = useState(0);
  const [copyStatus, setCopyStatus] = useState<"copied" | "failed" | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);

  const generateCode = useMutation({
    mutationFn: async (requestedAt: number) => ({
      ...(await userService.generateTelegramLinkCode()),
      requestedAt,
    }),
    onSuccess: ({ code, requestedAt }) => {
      setLinkCode({ value: code, expiresAt: requestedAt + CODE_LIFETIME_MS });
      setNow(Date.now());
      setCopyStatus(null);
      setConnectionStatus(null);
    },
  });

  const checkConnection = useMutation({
    mutationFn: userService.getCurrentUser,
    onSuccess: (freshUser) => {
      if (freshUser.telegram_chat_id != null) {
        useAuthStore.setState({ user: freshUser });
        setConnectionStatus(null);
      } else {
        setConnectionStatus(
          linkCode && Date.now() >= linkCode.expiresAt
            ? "Still not connected. Generate a new code and send it to the bot."
            : "Still waiting for the bot message. Send the command above, then check again.",
        );
      }
    },
  });

  useEffect(() => {
    if (!linkCode || isConnected) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [linkCode, isConnected]);

  const secondsLeft = linkCode ? Math.max(0, Math.ceil((linkCode.expiresAt - now) / 1000)) : 0;
  const isExpired = !!linkCode && secondsLeft === 0;
  const command = linkCode ? `/link ${linkCode.value}` : "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }
  };

  return (
    <section aria-labelledby="telegram-settings-title" className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border)] px-4 py-3">
        <h2 id="telegram-settings-title" className="font-semibold text-[var(--color-text-primary)]">Telegram</h2>
        <span className={`rounded-full px-2 py-1 text-[var(--text-xs)] font-medium ${isConnected ? "bg-[var(--color-positive-bg)] text-[var(--color-positive)]" : "bg-[var(--color-tag-bg)] text-[var(--color-text-secondary)]"}`}>
          {isConnected ? "Connected" : "Not connected"}
        </span>
      </div>

      {isConnected ? (
        <p className="px-4 py-4 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
          Your Telegram account is linked. You can record transactions with the bot.
        </p>
      ) : (
        <div className="flex flex-col gap-3 px-4 py-4">
          <p className="text-[var(--text-sm)] text-[var(--color-text-secondary)]">
            Link Telegram to record transactions through the bot.
          </p>

          {linkCode && !isExpired ? (
            <>
              <p className="text-[var(--text-sm)] text-[var(--color-text-secondary)]">
                Copy this command, open the bot, and send it as a message.
              </p>
              <code className="break-all rounded-[var(--radius-md)] bg-[var(--color-bg-subtle)] px-4 py-3 text-center text-[var(--text-base)] font-semibold text-[var(--color-text-primary)]">
                {command}
              </code>
              <p className="text-[var(--text-sm)] text-[var(--color-text-secondary)]">
                Code expires in {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, "0")}
              </p>
              <div className="flex flex-wrap gap-2">
                <button type="button" className={`${actionClass} bg-[var(--color-accent)] text-[var(--color-accent-fg)]`} onClick={() => void handleCopy()}>
                  Copy command
                </button>
                <a href={BOT_URL} target="_blank" rel="noopener noreferrer" className={`${actionClass} border border-[var(--color-border-strong)] text-[var(--color-text-primary)]`}>
                  Open Telegram bot
                </a>
              </div>
              {copyStatus === "copied" && <p role="status" className="text-[var(--text-sm)] text-[var(--color-positive)]">Command copied.</p>}
              {copyStatus === "failed" && <p role="alert" className="text-[var(--text-sm)] text-[var(--color-negative)]">Could not copy automatically. Select and copy the command above.</p>}
              <button type="button" className={`${actionClass} self-start text-[var(--color-accent)] underline`} onClick={() => checkConnection.mutate()} disabled={checkConnection.isPending}>
                {checkConnection.isPending ? "Checking…" : "Check connection"}
              </button>
              {connectionStatus && <p role="status" className="text-[var(--text-sm)] text-[var(--color-text-secondary)]">{connectionStatus}</p>}
            </>
          ) : (
            <>
              {isExpired && <p role="alert" className="text-[var(--text-sm)] text-[var(--color-negative)]">This code has expired. Generate a new one to connect.</p>}
              <button type="button" className={`${actionClass} w-full bg-[var(--color-accent)] text-[var(--color-accent-fg)]`} onClick={() => generateCode.mutate(Date.now())} disabled={generateCode.isPending}>
                {generateCode.isPending ? "Generating…" : isExpired ? "Generate new code" : "Generate link code"}
              </button>
              {isExpired && (
                <button type="button" className={`${actionClass} self-start text-[var(--color-accent)] underline`} onClick={() => checkConnection.mutate()} disabled={checkConnection.isPending}>
                  {checkConnection.isPending ? "Checking…" : "Already sent it? Check connection"}
                </button>
              )}
            </>
          )}
          {generateCode.isError && <p role="alert" className="text-[var(--text-sm)] text-[var(--color-negative)]">Could not generate a link code. Try again.</p>}
          {checkConnection.isError && <p role="alert" className="text-[var(--text-sm)] text-[var(--color-negative)]">Could not check your Telegram connection. Try again.</p>}
        </div>
      )}
    </section>
  );
}

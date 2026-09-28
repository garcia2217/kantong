"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/src/store/auth";
import { userService } from "@/src/lib/api/services/users";

const CODE_LIFETIME_MS = 5 * 60 * 1000;
const BOT_URL = "https://t.me/garcia_finance_bot";

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
    <section aria-labelledby="telegram-settings-title" className="settings-card">
      <div className="settings-card__head">
        <div className="min-w-0">
          <h2 id="telegram-settings-title" className="settings-card__title">Telegram</h2>
          <p className="settings-card__subtitle">Record money by texting the Kantong bot, like &ldquo;kopi 25rb&rdquo;.</p>
        </div>
        <span className={`settings-badge${isConnected ? "" : " settings-badge--muted"}`}>
          {isConnected ? "Connected" : "Not connected"}
        </span>
      </div>

      {isConnected ? (
        <div className="settings-telegram">
          <p>Your Telegram account is linked. Send the bot a message and it lands in your transactions.</p>
          <a href={BOT_URL} target="_blank" rel="noopener noreferrer" className="settings-pill settings-telegram__self-start">
            Open Telegram bot
          </a>
        </div>
      ) : (
        <div className="settings-telegram">
          {linkCode && !isExpired ? (
            <>
              <p>Copy this command, open the bot, and send it as a message.</p>
              <code className="settings-telegram__code">{command}</code>
              <p className="settings-telegram__timer">
                Code expires in {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, "0")}
              </p>
              <div className="settings-telegram__actions">
                <button type="button" className="btn-primary" onClick={() => void handleCopy()}>
                  Copy command
                </button>
                <a href={BOT_URL} target="_blank" rel="noopener noreferrer" className="settings-pill">
                  Open Telegram bot
                </a>
              </div>
              {copyStatus === "copied" && <p role="status" className="settings-telegram__ok">✓ Command copied.</p>}
              {copyStatus === "failed" && <p role="alert" className="settings-telegram__error">Could not copy automatically. Select and copy the command above.</p>}
              <button type="button" className="settings-text-button settings-telegram__self-start" onClick={() => checkConnection.mutate()} disabled={checkConnection.isPending}>
                {checkConnection.isPending ? "Checking…" : "Check connection"}
              </button>
              {connectionStatus && <p role="status">{connectionStatus}</p>}
            </>
          ) : (
            <>
              <p>Link Telegram to record transactions through the bot. It takes under a minute.</p>
              {isExpired && <p role="alert" className="settings-telegram__error">This code has expired. Generate a new one to connect.</p>}
              <button type="button" className="btn-primary w-full" onClick={() => generateCode.mutate(Date.now())} disabled={generateCode.isPending}>
                {generateCode.isPending ? "Generating…" : isExpired ? "Generate new code" : "Generate link code"}
              </button>
              {isExpired && (
                <button type="button" className="settings-text-button settings-telegram__self-start" onClick={() => checkConnection.mutate()} disabled={checkConnection.isPending}>
                  {checkConnection.isPending ? "Checking…" : "Already sent it? Check connection"}
                </button>
              )}
            </>
          )}
          {generateCode.isError && <p role="alert" className="settings-telegram__error">Could not generate a link code. Try again.</p>}
          {checkConnection.isError && <p role="alert" className="settings-telegram__error">Could not check your Telegram connection. Try again.</p>}
        </div>
      )}
    </section>
  );
}

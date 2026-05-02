"use client";

import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/src/store/auth";
import { userService } from "@/src/lib/api/services/users";

export function TelegramLinkSection() {
  const user = useAuthStore((s) => s.user);
  const isConnected = user?.telegram_chat_id != null;

  const { mutate, isPending, isError, data } = useMutation({
    mutationFn: userService.generateTelegramLinkCode,
  });

  const code = data?.code;

  const cardStyle: React.CSSProperties = {
    background: "var(--color-bg-card)",
    border: "0.5px solid var(--color-border)",
    borderRadius: "var(--radius-lg)",
    overflow: "hidden",
  };

  const headerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "var(--space-3) var(--space-4)",
    borderBottom: "0.5px solid var(--color-border)",
  };

  const bodyStyle: React.CSSProperties = {
    padding: "var(--space-4)",
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-3)",
  };

  return (
    <section>
      <div style={cardStyle}>
        <div style={headerStyle}>
          <h2
            style={{
              fontSize: "var(--text-base)",
              fontWeight: "var(--weight-semibold)",
              color: "var(--color-text-primary)",
            }}
          >
            Telegram
          </h2>
          {isConnected && (
            <span
              style={{
                fontSize: "var(--text-xs)",
                fontWeight: "var(--weight-medium)",
                color: "var(--color-positive)",
                background: "var(--color-positive-bg)",
                padding: "1px 6px",
                borderRadius: "var(--radius-full)",
              }}
            >
              Connected
            </span>
          )}
        </div>

        {isConnected ? (
          <p style={{ padding: "var(--space-4)", fontSize: "var(--text-sm)", color: "var(--color-text-secondary)" }}>
            Your Telegram account is linked. You can receive notifications and manage finances via the bot.
          </p>
        ) : code ? (
          <div style={bodyStyle}>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)" }}>
              Open Telegram and send the following message to{" "}
              <strong style={{ color: "var(--color-text-primary)" }}>
                @garcia_finance_bot
              </strong>
              :
            </p>
            <div
              style={{
                padding: "var(--space-3)",
                background: "var(--color-bg-subtle)",
                borderRadius: "var(--radius-md)",
                fontFamily: "monospace",
                fontSize: "var(--text-base)",
                fontWeight: "var(--weight-semibold)",
                color: "var(--color-text-primary)",
                letterSpacing: "0.08em",
                textAlign: "center",
              }}
            >
              /link {code}
            </div>
            <p
              style={{
                fontSize: "var(--text-xs)",
                color: "var(--color-text-tertiary)",
              }}
            >
              This code expires in 5 minutes.
            </p>
            <a
              href="https://t.me/garcia_finance_bot"
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 44,
                padding: "var(--space-2) var(--space-4)",
                background: "var(--color-accent)",
                color: "var(--color-accent-fg)",
                borderRadius: "var(--radius-md)",
                fontSize: "var(--text-sm)",
                fontWeight: "var(--weight-medium)",
                textDecoration: "none",
              }}
            >
              Open Telegram Bot
            </a>
            <button
              type="button"
              onClick={() => mutate()}
              disabled={isPending}
              style={{
                background: "transparent",
                border: "none",
                cursor: isPending ? "not-allowed" : "pointer",
                fontSize: "var(--text-sm)",
                color: "var(--color-text-tertiary)",
                padding: 0,
                textDecoration: "underline",
                opacity: isPending ? 0.5 : 1,
              }}
            >
              Generate a new code
            </button>
          </div>
        ) : (
          <div style={bodyStyle}>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)" }}>
              Link your Telegram account to receive transaction notifications and manage your finances from the bot.
            </p>
            {isError && (
              <p
                role="alert"
                style={{ fontSize: "var(--text-sm)", color: "var(--color-negative)" }}
              >
                Failed to generate code. Please try again.
              </p>
            )}
            <button
              type="button"
              onClick={() => mutate()}
              disabled={isPending}
              style={{
                width: "100%",
                minHeight: 44,
                padding: "var(--space-2) var(--space-4)",
                background: "var(--color-accent)",
                color: "var(--color-accent-fg)",
                border: "none",
                borderRadius: "var(--radius-md)",
                fontSize: "var(--text-sm)",
                fontWeight: "var(--weight-medium)",
                cursor: isPending ? "not-allowed" : "pointer",
                opacity: isPending ? 0.7 : 1,
              }}
            >
              {isPending ? "Generating…" : "Generate Linking Code"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

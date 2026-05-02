"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/src/store/auth";

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  oauth_failed: "Google sign-in failed. Please try again.",
  no_user_info: "Could not retrieve your Google profile. Please try again.",
  invalid_user_info: "Your Google account is missing required information.",
};

const FEATURES = [
  "Track income & expenses across multiple wallets",
  "Set monthly budgets and monitor spending",
  "Manage debts and receivables with ease",
];

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function LoginPage() {
  const { initiateOAuth } = useAuthStore();
  const [oauthError, setOauthError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    if (error) {
      setOauthError(
        OAUTH_ERROR_MESSAGES[error] ?? "Authentication failed. Please try again.",
      );
      window.history.replaceState({}, "", "/login");
    }
  }, []);

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-bg-subtle)",
        padding: "var(--space-4)",
        minHeight: "100dvh",
      }}
    >
      <div style={{ width: "100%", maxWidth: 400 }}>
        {/* Card */}
        <div
          style={{
            background: "var(--color-bg-elevated)",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--color-border)",
            overflow: "hidden",
            boxShadow:
              "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)",
          }}
        >
          {/* Brand section */}
          <div
            style={{
              padding: "var(--space-8) var(--space-6) var(--space-6)",
              textAlign: "center",
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "var(--radius-lg)",
                background: "var(--color-accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto var(--space-4)",
              }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 22 22"
                fill="none"
                aria-hidden="true"
              >
                <rect
                  x="2"
                  y="12"
                  width="4"
                  height="8"
                  rx="1"
                  fill="var(--color-accent-fg)"
                  opacity="0.55"
                />
                <rect
                  x="9"
                  y="7"
                  width="4"
                  height="13"
                  rx="1"
                  fill="var(--color-accent-fg)"
                />
                <rect
                  x="16"
                  y="2"
                  width="4"
                  height="18"
                  rx="1"
                  fill="var(--color-accent-fg)"
                  opacity="0.7"
                />
              </svg>
            </div>

            <h1
              style={{
                fontSize: "var(--text-2xl)",
                fontWeight: "var(--weight-semibold)",
                color: "var(--color-text-primary)",
                letterSpacing: "-0.02em",
                lineHeight: "var(--leading-tight)",
                marginBottom: "var(--space-1)",
              }}
            >
              Finance Tracker
            </h1>
            <p
              style={{
                fontSize: "var(--text-sm)",
                color: "var(--color-text-secondary)",
                lineHeight: "var(--leading-normal)",
              }}
            >
              Your personal money dashboard
            </p>
          </div>

          {/* Feature list */}
          <div
            style={{
              padding: "var(--space-5) var(--space-6)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-3)",
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            {FEATURES.map((label) => (
              <div
                key={label}
                style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  style={{ flexShrink: 0 }}
                  aria-hidden="true"
                >
                  <circle cx="7" cy="7" r="6.5" stroke="var(--color-border-strong)" />
                  <path
                    d="M4.5 7l1.8 1.8L9.5 5.5"
                    stroke="var(--color-positive)"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span
                  style={{
                    fontSize: "var(--text-sm)",
                    color: "var(--color-text-secondary)",
                    lineHeight: "var(--leading-normal)",
                  }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* Sign-in section */}
          <div style={{ padding: "var(--space-6)" }}>
            {oauthError && (
              <div
                role="alert"
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "var(--space-2)",
                  background: "var(--color-negative-bg)",
                  color: "var(--color-negative)",
                  borderRadius: "var(--radius-md)",
                  padding: "var(--space-3) var(--space-4)",
                  marginBottom: "var(--space-4)",
                  fontSize: "var(--text-sm)",
                  lineHeight: "var(--leading-normal)",
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  style={{ flexShrink: 0, marginTop: 1 }}
                  aria-hidden="true"
                >
                  <circle cx="7" cy="7" r="6.5" stroke="currentColor" opacity="0.6" />
                  <path
                    d="M7 4v3.5M7 9.5v.5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
                {oauthError}
              </div>
            )}

            <button
              type="button"
              onClick={initiateOAuth}
              style={{
                width: "100%",
                minHeight: 44,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "var(--space-3)",
                background: "var(--color-bg-elevated)",
                color: "var(--color-text-primary)",
                border: "1.5px solid var(--color-border-strong)",
                borderRadius: "var(--radius-md)",
                fontSize: "var(--text-base)",
                fontWeight: "var(--weight-medium)",
                cursor: "pointer",
                padding: "0 var(--space-4)",
                transition: "background 0.12s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "var(--color-bg-hover)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "var(--color-bg-elevated)";
              }}
            >
              <GoogleIcon />
              Continue with Google
            </button>

            <p
              style={{
                marginTop: "var(--space-4)",
                fontSize: "var(--text-xs)",
                color: "var(--color-text-tertiary)",
                textAlign: "center",
                lineHeight: "var(--leading-relaxed)",
              }}
            >
              Only you have access to your financial data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

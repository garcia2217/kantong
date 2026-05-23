"use client";

import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

function AlertCircleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10.5" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M12 7.5v5M12 15.5v1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function DashboardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Forward to error monitoring (e.g. Sentry) once wired up
    console.error(error);
  }, [error]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-8) var(--space-4)",
        minHeight: 360,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          background: "var(--color-bg-elevated)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-xl)",
          padding: "var(--space-8) var(--space-6)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)",
          textAlign: "center",
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: "var(--radius-lg)",
            background: "var(--color-negative-bg)",
            color: "var(--color-negative)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto var(--space-5)",
          }}
        >
          <AlertCircleIcon />
        </div>

        {/* Title */}
        <p
          style={{
            fontSize: "var(--text-lg)",
            fontWeight: "var(--weight-semibold)",
            color: "var(--color-text-primary)",
            letterSpacing: "-0.02em",
            lineHeight: "var(--leading-tight)",
            marginBottom: "var(--space-2)",
          }}
        >
          Something went wrong
        </p>

        {/* Description */}
        <p
          style={{
            fontSize: "var(--text-sm)",
            color: "var(--color-text-secondary)",
            lineHeight: "var(--leading-relaxed)",
            marginBottom: "var(--space-6)",
          }}
        >
          An unexpected error occurred. Your data is safe — please try reloading this page.
        </p>

        {/* Primary CTA */}
        <button
          type="button"
          onClick={reset}
          className="btn-primary"
          style={{
            width: "100%",
            minHeight: 44,
            background: "var(--color-accent)",
            color: "var(--color-accent-fg)",
            border: "none",
            borderRadius: "var(--radius-md)",
            fontSize: "var(--text-base)",
            fontWeight: "var(--weight-medium)",
            cursor: "pointer",
            letterSpacing: "-0.01em",
          }}
        >
          Try again
        </button>

        {/* Error digest for support reference */}
        {error.digest && (
          <p
            style={{
              marginTop: "var(--space-4)",
              fontSize: "var(--text-xs)",
              color: "var(--color-text-tertiary)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}

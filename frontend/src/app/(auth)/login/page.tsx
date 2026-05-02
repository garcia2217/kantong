"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/src/store/auth";

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  oauth_failed: "Google sign-in failed. Please try again.",
  no_user_info: "Could not retrieve your Google profile. Please try again.",
  invalid_user_info: "Your Google account is missing required information.",
};

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
      // Remove ?error from the URL so refreshing doesn't re-show the error
      window.history.replaceState({}, "", "/login");
    }
  }, []);

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-bg-app)",
        padding: "var(--space-4)",
      }}
    >
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div style={{ marginBottom: "var(--space-8)", textAlign: "center" }}>
          <h1
            style={{
              fontSize: "var(--text-2xl)",
              fontWeight: "var(--weight-semibold)",
              color: "var(--color-text-primary)",
              marginBottom: "var(--space-1)",
            }}
          >
            Finance Tracker
          </h1>
          <p
            style={{
              fontSize: "var(--text-sm)",
              color: "var(--color-text-secondary)",
            }}
          >
            Sign in to continue
          </p>
        </div>

        {oauthError && (
          <p
            role="alert"
            style={{
              fontSize: "var(--text-sm)",
              color: "var(--color-negative)",
              textAlign: "center",
              marginBottom: "var(--space-4)",
            }}
          >
            {oauthError}
          </p>
        )}

        <button
          type="button"
          onClick={initiateOAuth}
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
          }}
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

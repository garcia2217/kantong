"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuthStore } from "@/src/store/auth";

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  oauth_failed: "Google sign-in failed. Please try again.",
  no_user_info: "Could not retrieve your Google profile. Please try again.",
  invalid_user_info: "Your Google account is missing required information.",
};

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

export function LoginPanel() {
  const { initiateOAuth } = useAuthStore();
  const searchParams = useSearchParams();
  // Captured once so the message survives the URL cleanup below.
  const [oauthError] = useState<string | null>(() => {
    const error = searchParams.get("error");
    if (!error) return null;
    return OAUTH_ERROR_MESSAGES[error] ?? "Authentication failed. Please try again.";
  });

  useEffect(() => {
    if (oauthError) window.history.replaceState({}, "", "/login");
  }, [oauthError]);

  return (
    <section id="sign-in" className="login-panel" aria-labelledby="login-panel-title">
      <h2 id="login-panel-title" className="login-panel__title">
        Sign in to Kantong
      </h2>
      <p className="login-panel__subtitle">Use your Google account to get started.</p>

      {oauthError && (
        <div role="alert" className="login-panel__error">
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            className="login-panel__error-icon"
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

      <button type="button" onClick={initiateOAuth} className="login-google">
        <GoogleIcon />
        Continue with Google
      </button>

      <ul className="login-panel__trust">
        <li>Only you can see your financial data.</li>
        <li>No bank login. Kantong never connects to your bank.</li>
        <li>Google is only used to confirm it&apos;s you.</li>
      </ul>
    </section>
  );
}

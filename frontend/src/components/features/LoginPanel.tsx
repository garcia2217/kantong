"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/src/store/auth";
import { GoogleSignInButton } from "@/src/components/features/GoogleSignInButton";

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  oauth_failed: "Google sign-in failed. Please try again.",
  no_user_info: "Could not retrieve your Google profile. Please try again.",
  invalid_user_info: "Your Google account is missing required information.",
};

export function LoginPanel() {
  const router = useRouter();
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const searchParams = useSearchParams();
  // Captured once so the message survives the URL cleanup below.
  const [oauthError] = useState<string | null>(() => {
    const error = searchParams.get("error");
    if (!error) return null;
    return OAUTH_ERROR_MESSAGES[error] ?? "Authentication failed. Please try again.";
  });

  useEffect(() => {
    if (oauthError) window.history.replaceState({}, "", "/");
  }, [oauthError]);

  // Signed-in visitors skip the pitch. Checked against the API rather than in
  // the proxy: a stale cookie there would bounce between / and /overview.
  useEffect(() => {
    checkAuth().then(() => {
      if (useAuthStore.getState().isAuthenticated) router.replace("/overview");
    });
  }, [checkAuth, router]);

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

      <GoogleSignInButton />

      <ul className="login-panel__trust">
        <li>Only you can see your financial data.</li>
        <li>No bank login. Kantong never connects to your bank.</li>
        <li>Google is only used to confirm it&apos;s you.</li>
      </ul>
    </section>
  );
}

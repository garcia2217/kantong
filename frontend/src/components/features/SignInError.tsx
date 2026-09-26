"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  oauth_failed: "Google sign-in failed. Please try again.",
  no_user_info: "Could not retrieve your Google profile. Please try again.",
  invalid_user_info: "Your Google account is missing required information.",
};

// Split out of LoginPanel so only this alert waits on useSearchParams, and the
// #sign-in section itself still renders statically.
export function SignInError() {
  const searchParams = useSearchParams();
  // Captured once so the message survives the URL cleanup below.
  const [oauthError] = useState<string | null>(() => {
    const error = searchParams.get("error");
    if (!error) return null;
    return OAUTH_ERROR_MESSAGES[error] ?? "Authentication failed. Please try again.";
  });

  useEffect(() => {
    if (oauthError) window.history.replaceState({}, "", "/#sign-in");
  }, [oauthError]);

  if (!oauthError) return null;

  return (
    <div role="alert" className="lp-closing__error">
      <svg width="16" height="16" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <circle cx="7" cy="7" r="6.5" stroke="currentColor" opacity="0.6" />
        <path d="M7 4v3.5M7 9.5v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
      {oauthError}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/src/store/auth";

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

interface GoogleSignInButtonProps {
  /** "landing" is the marigold marketing CTA; "default" is the quiet panel button. */
  variant?: "default" | "landing";
  label?: string;
}

const VARIANT_CLASS: Record<NonNullable<GoogleSignInButtonProps["variant"]>, string> = {
  default: "login-google",
  landing: "lp-cta",
};

export function GoogleSignInButton({
  variant = "default",
  label = "Continue with Google",
}: GoogleSignInButtonProps) {
  const initiateOAuth = useAuthStore((s) => s.initiateOAuth);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Coming back from Google with the browser's Back button can restore this
  // page from the back/forward cache, still disabled. Re-enable it.
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent): void => {
      if (event.persisted) setIsRedirecting(false);
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  const handleClick = (): void => {
    setIsRedirecting(true);
    initiateOAuth();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isRedirecting}
      aria-busy={isRedirecting}
      className={VARIANT_CLASS[variant]}
    >
      {isRedirecting ? (
        <span className={`${VARIANT_CLASS[variant]}__spinner`} aria-hidden="true" />
      ) : variant === "landing" ? (
        // The multicolour G needs a light disc to read on marigold.
        <span className="lp-cta__icon">
          <GoogleIcon />
        </span>
      ) : (
        <GoogleIcon />
      )}
      {isRedirecting ? "Opening Google…" : label}
    </button>
  );
}

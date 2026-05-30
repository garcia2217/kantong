"use client";

import { Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "@/src/lib/api/services/auth";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Ref guard prevents React StrictMode's double-invoke from consuming the
  // single-use exchange code twice (refs survive the simulated remount).
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    const code = searchParams.get("code");
    if (!code) {
      router.replace("/login?error=oauth_failed");
      return;
    }

    authService
      .exchangeOAuthCode(code)
      .then(() => router.replace("/overview"))
      .catch(() => router.replace("/login?error=oauth_failed"));
  }, [router, searchParams]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100dvh",
        background: "var(--color-bg-app)",
      }}
    >
      <p
        style={{
          fontSize: "var(--text-sm)",
          color: "var(--color-text-tertiary)",
        }}
      >
        Completing sign in…
      </p>
    </div>
  );
}

// Suspense is required by Next.js App Router when useSearchParams() is used
// in a client component — without it the build fails.
export default function AuthCallbackPage() {
  return (
    <Suspense>
      <AuthCallbackContent />
    </Suspense>
  );
}

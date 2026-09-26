"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/src/store/auth";
import { GoogleSignInButton } from "@/src/components/features/GoogleSignInButton";
import { SignInError } from "@/src/components/features/SignInError";

export function LoginPanel() {
  const router = useRouter();
  const checkAuth = useAuthStore((s) => s.checkAuth);

  // Signed-in visitors skip the pitch. Checked against the API rather than in
  // the proxy: a stale cookie there would bounce between / and /overview.
  useEffect(() => {
    checkAuth().then(() => {
      if (useAuthStore.getState().isAuthenticated) router.replace("/overview");
    });
  }, [checkAuth, router]);

  return (
    <section id="sign-in" className="lp-closing" aria-labelledby="login-panel-title">
      <div className="lp-container lp-closing__inner">
        <h2 id="login-panel-title" className="lp-display lp-closing__title">
          Make next payday <span className="lp-hero__accent">last all month.</span>
        </h2>
        <p className="lp-closing__subtitle">
          Start with one message. You&apos;ll know where your money goes by the end of the week.
        </p>

        {/* useSearchParams needs a Suspense boundary for static rendering. */}
        <Suspense>
          <SignInError />
        </Suspense>

        <GoogleSignInButton variant="landing" label="Start free with Google" />

        <ul className="lp-closing__trust">
          <li>Only you can see your financial data</li>
          <li>No bank login, ever</li>
          <li>Google only confirms it&apos;s you</li>
        </ul>
      </div>
    </section>
  );
}

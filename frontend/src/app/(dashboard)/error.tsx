"use client";

import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Forward to error monitoring (e.g. Sentry) once wired up
    console.error(error);
  }, [error]);

  return (
    <div className="app-error">
      <div role="alert" className="app-error__card">
        <span className="app-error__icon" aria-hidden="true">⚠️</span>
        <h1 className="app-error__title">Something went wrong</h1>
        <p className="app-error__text">
          An unexpected error occurred. Your data is safe. Try again, or reload the page if it keeps happening.
        </p>
        <button type="button" onClick={reset} className="btn-primary w-full">
          Try again
        </button>
        {error.digest && <p className="app-error__digest">Error ID: {error.digest}</p>}
      </div>
    </div>
  );
}

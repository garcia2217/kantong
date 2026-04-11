"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginSchema } from "@/src/lib/validations/auth";
import { useAuthStore } from "@/src/store/auth";

interface FieldErrors {
  username?: string;
  password?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const result = loginSchema.safeParse({ username, password });
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        username: fieldErrors.username?.[0],
        password: fieldErrors.password?.[0],
      });
      return;
    }

    setErrors({});
    setServerError(null);
    try {
      await login(result.data.username, result.data.password);
      router.push("/overview");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong. Please try again.";
      setServerError(message);
    }
  };

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
        {/* App name */}
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

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          noValidate
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-4)",
          }}
        >
          {/* Username */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-1)",
            }}
          >
            <label
              htmlFor="username"
              style={{
                fontSize: "var(--text-sm)",
                fontWeight: "var(--weight-medium)",
                color: "var(--color-text-secondary)",
              }}
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              style={{
                width: "100%",
                minHeight: 44,
                fontSize: 16,
                padding: "var(--space-2) var(--space-3)",
                background: "var(--color-bg-subtle)",
                border: `0.5px solid ${errors.username ? "var(--color-negative)" : "var(--color-border)"}`,
                borderRadius: "var(--radius-md)",
                color: "var(--color-text-primary)",
                outline: "none",
              }}
            />
            {errors.username && (
              <p
                style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--color-negative)",
                }}
              >
                {errors.username}
              </p>
            )}
          </div>

          {/* Password */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-1)",
            }}
          >
            <label
              htmlFor="password"
              style={{
                fontSize: "var(--text-sm)",
                fontWeight: "var(--weight-medium)",
                color: "var(--color-text-secondary)",
              }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={{
                width: "100%",
                minHeight: 44,
                fontSize: 16,
                padding: "var(--space-2) var(--space-3)",
                background: "var(--color-bg-subtle)",
                border: `0.5px solid ${errors.password ? "var(--color-negative)" : "var(--color-border)"}`,
                borderRadius: "var(--radius-md)",
                color: "var(--color-text-primary)",
                outline: "none",
              }}
            />
            {errors.password && (
              <p
                style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--color-negative)",
                }}
              >
                {errors.password}
              </p>
            )}
          </div>

          {/* Server error */}
          {serverError && (
            <p
              role="alert"
              style={{
                fontSize: "var(--text-sm)",
                color: "var(--color-negative)",
                textAlign: "center",
              }}
            >
              {serverError}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary"
            style={{
              width: "100%",
              minHeight: 44,
              marginTop: "var(--space-2)",
              background: "var(--color-accent)",
              color: "var(--color-accent-fg)",
              border: "none",
              borderRadius: "var(--radius-md)",
              fontSize: "var(--text-base)",
              fontWeight: "var(--weight-medium)",
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.7 : 1,
              transition: "opacity 0.15s ease",
            }}
          >
            {isLoading ? "Signing in…" : "Sign in"}
          </button>
        </form>

      </div>
    </div>
  );
}

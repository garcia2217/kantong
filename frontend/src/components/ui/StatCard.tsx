import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string;
  subtext?: string;
  subtextType?: "positive" | "negative" | "neutral";
  isLoading?: boolean;
  icon?: ReactNode;
}

export function StatCard({
  label,
  value,
  subtext,
  subtextType = "neutral",
  isLoading = false,
  icon,
}: StatCardProps) {
  const subtextColor =
    subtextType === "positive"
      ? "var(--color-positive)"
      : subtextType === "negative"
        ? "var(--color-negative)"
        : "var(--color-text-tertiary)";

  return (
    <div
      style={{
        background: "var(--color-bg-elevated)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-4) var(--space-5)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.05)",
      }}
    >
      {/* Icon + label row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-2)",
          marginBottom: "var(--space-3)",
        }}
      >
        {icon && (
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "var(--radius-sm)",
              background: "var(--color-bg-subtle)",
              border: "1px solid var(--color-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              color: "var(--color-text-secondary)",
            }}
          >
            {icon}
          </div>
        )}
        <p
          style={{
            fontSize: "var(--text-xs)",
            fontWeight: "var(--weight-medium)",
            color: "var(--color-text-tertiary)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          {label}
        </p>
      </div>

      {/* Value */}
      {isLoading ? (
        <div
          style={{
            height: 26,
            width: "65%",
            borderRadius: "var(--radius-sm)",
            background: "var(--color-bg-hover)",
            marginBottom: subtext ? "var(--space-2)" : 0,
          }}
        />
      ) : (
        <p
          style={{
            fontSize: "var(--text-lg)",
            fontWeight: "var(--weight-semibold)",
            color: "var(--color-text-primary)",
            lineHeight: "var(--leading-tight)",
            letterSpacing: "-0.02em",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {value}
        </p>
      )}

      {/* Subtext */}
      {subtext && !isLoading && (
        <p
          style={{
            fontSize: "var(--text-xs)",
            color: subtextColor,
            marginTop: "var(--space-1)",
            lineHeight: "var(--leading-normal)",
          }}
        >
          {subtext}
        </p>
      )}
    </div>
  );
}

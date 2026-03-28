interface StatCardProps {
  label: string;
  value: string;
  subtext?: string;
  subtextType?: "positive" | "negative" | "neutral";
  isLoading?: boolean;
}

export function StatCard({
  label,
  value,
  subtext,
  subtextType = "neutral",
  isLoading = false,
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
        background: "var(--color-bg-subtle)",
        border: "0.5px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-4) var(--space-5)",
      }}
    >
      <p
        style={{
          fontSize: "var(--text-sm)",
          color: "var(--color-text-secondary)",
          marginBottom: "var(--space-1)",
        }}
      >
        {label}
      </p>

      {isLoading ? (
        <div
          style={{
            height: 28,
            width: "60%",
            borderRadius: "var(--radius-sm)",
            background: "var(--color-bg-hover)",
          }}
        />
      ) : (
        <p
          style={{
            fontSize: "var(--text-lg)",
            fontWeight: "var(--weight-semibold)",
            color: "var(--color-text-primary)",
            lineHeight: "var(--leading-tight)",
          }}
          className="md:text-xl"
        >
          {value}
        </p>
      )}

      {subtext && !isLoading && (
        <p
          style={{
            fontSize: "var(--text-xs)",
            color: subtextColor,
            marginTop: "var(--space-1)",
          }}
        >
          {subtext}
        </p>
      )}
    </div>
  );
}

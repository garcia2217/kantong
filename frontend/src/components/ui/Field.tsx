interface FieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  children: React.ReactNode;
}

export function Field({ label, htmlFor, error, children }: FieldProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
      <label
        htmlFor={htmlFor}
        style={{
          fontSize: "var(--text-sm)",
          fontWeight: "var(--weight-medium)",
          color: "var(--color-text-secondary)",
        }}
      >
        {label}
      </label>
      {children}
      {error && (
        <p style={{ fontSize: "var(--text-sm)", color: "var(--color-negative)" }}>
          {error}
        </p>
      )}
    </div>
  );
}

export const inputBaseStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 44,
  fontSize: 16,
  padding: "var(--space-2) var(--space-3)",
  background: "var(--color-bg-subtle)",
  borderRadius: "var(--radius-md)",
  color: "var(--color-text-primary)",
  outline: "none",
};

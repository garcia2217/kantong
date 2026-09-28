interface FieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  children: React.ReactNode;
}

export function Field({ label, htmlFor, error, children }: FieldProps) {
  return (
    <div className="field">
      <label htmlFor={htmlFor} className="field__label">
        {label}
      </label>
      {children}
      {error && (
        <p id={htmlFor ? `${htmlFor}-error` : undefined} role="alert" className="field__error">
          {error}
        </p>
      )}
    </div>
  );
}

// Inputs sit on the elevated surface so they read as editable, not disabled.
// Focus styling lives in globals.css (.field) so every sheet gets the same ring.
export const inputBaseStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 44,
  fontSize: 16,
  padding: "var(--space-2) var(--space-3)",
  background: "var(--color-bg-elevated)",
  borderRadius: "var(--radius-md)",
  color: "var(--color-text-primary)",
};

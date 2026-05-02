interface SheetSubmitButtonProps {
  isPending: boolean;
  label: string;
  pendingLabel: string;
}

export function SheetSubmitButton({ isPending, label, pendingLabel }: SheetSubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={isPending}
      style={{
        width: "100%",
        minHeight: 44,
        background: "var(--color-accent)",
        color: "var(--color-accent-fg)",
        border: "none",
        borderRadius: "var(--radius-md)",
        fontSize: "var(--text-base)",
        fontWeight: "var(--weight-medium)",
        cursor: isPending ? "not-allowed" : "pointer",
        opacity: isPending ? 0.7 : 1,
      }}
    >
      {isPending ? pendingLabel : label}
    </button>
  );
}

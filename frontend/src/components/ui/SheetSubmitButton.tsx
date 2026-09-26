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
      className="btn-primary w-full"
    >
      {isPending ? pendingLabel : label}
    </button>
  );
}

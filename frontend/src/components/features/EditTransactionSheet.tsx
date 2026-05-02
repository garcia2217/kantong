"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BottomSheet } from "@/src/components/ui/BottomSheet";
import { AmountInput } from "@/src/components/ui/AmountInput";
import { Field, inputBaseStyle } from "@/src/components/ui/Field";
import { SheetSubmitButton } from "@/src/components/ui/SheetSubmitButton";
import { transactionSchema } from "@/src/lib/validations/transaction";
import { transactionService } from "@/src/lib/api/services/transactions";
import { categoryService } from "@/src/lib/api/services/categories";
import { walletService } from "@/src/lib/api/services/wallets";
import { TRANSACTION_KEYS, WALLET_KEYS, CATEGORY_KEYS } from "@/src/lib/api/keys";
import { parseZodErrors, dateToLocalIso } from "@/src/lib/utils/form";
import type { Transaction, TransactionType, TransactionUpdate } from "@/src/types";

const txToFormValues = (tx: Transaction) => ({
  type: tx.type,
  amount: String(tx.amount),
  description: tx.description,
  wallet_id: tx.wallet_id,
  category_id: tx.category_id ?? "",
  destination_wallet_id: tx.destination_wallet_id ?? "",
  transaction_date: tx.transaction_date.split("T")[0],
});

const BLANK_FORM = {
  type: "expense" as TransactionType,
  amount: "",
  description: "",
  wallet_id: "",
  category_id: "",
  destination_wallet_id: "",
  transaction_date: "",
};

// ─── DeleteConfirmation ───────────────────────────────────────────────────────

interface DeleteConfirmationProps {
  isPending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteConfirmation({ isPending, onConfirm, onCancel }: DeleteConfirmationProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-2)",
        padding: "var(--space-3)",
        background: "var(--color-bg-subtle)",
        border: "0.5px solid var(--color-negative)",
        borderRadius: "var(--radius-md)",
      }}
    >
      <p
        style={{
          fontSize: "var(--text-sm)",
          color: "var(--color-text-secondary)",
          textAlign: "center",
        }}
      >
        This cannot be undone.
      </p>
      <div style={{ display: "flex", gap: "var(--space-2)" }}>
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          style={{
            flex: 1,
            minHeight: 44,
            background: "transparent",
            border: "0.5px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            fontSize: "var(--text-sm)",
            color: "var(--color-text-secondary)",
            cursor: isPending ? "not-allowed" : "pointer",
          }}
        >
          Never mind
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isPending}
          style={{
            flex: 1,
            minHeight: 44,
            background: "var(--color-negative)",
            border: "none",
            borderRadius: "var(--radius-md)",
            fontSize: "var(--text-sm)",
            fontWeight: "var(--weight-medium)",
            color: "#fff",
            cursor: isPending ? "not-allowed" : "pointer",
            opacity: isPending ? 0.7 : 1,
          }}
        >
          {isPending ? "Deleting…" : "Yes, delete"}
        </button>
      </div>
    </div>
  );
}

// ─── EditTransactionSheet ─────────────────────────────────────────────────────

interface EditTransactionSheetProps {
  tx: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditTransactionSheet({ tx, isOpen, onClose }: EditTransactionSheetProps) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(BLANK_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  // Sync form state whenever the selected transaction changes
  useEffect(() => {
    if (tx) {
      setForm(txToFormValues(tx));
      setErrors({});
      setIsConfirmingDelete(false);
    }
  }, [tx]);

  const { data: wallets } = useQuery({
    queryKey: WALLET_KEYS.all,
    queryFn: walletService.getAll,
    enabled: isOpen,
  });

  const { data: categories } = useQuery({
    queryKey: CATEGORY_KEYS.all,
    queryFn: categoryService.getAll,
    enabled: isOpen,
  });

  const handleClose = () => {
    setErrors({});
    setIsConfirmingDelete(false);
    onClose();
  };

  const updateMutation = useMutation({
    mutationFn: (payload: TransactionUpdate) => transactionService.update(tx!.id, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData<Transaction[]>(TRANSACTION_KEYS.all, (old) =>
        old?.map((t) => (t.id === updated.id ? updated : t)) ?? [],
      );
      queryClient.invalidateQueries({ queryKey: WALLET_KEYS.all });
      handleClose();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => transactionService.delete(tx!.id),
    onSuccess: () => {
      const deletedId = tx!.id;
      queryClient.setQueryData<Transaction[]>(TRANSACTION_KEYS.all, (old) =>
        old?.filter((t) => t.id !== deletedId) ?? [],
      );
      queryClient.invalidateQueries({ queryKey: WALLET_KEYS.all });
      handleClose();
    },
  });

  const availableCategories = useMemo(
    () => (categories ?? []).filter((c) => c.type === form.type),
    [categories, form.type],
  );

  const destinationWallets = useMemo(
    () => (wallets ?? []).filter((w) => w.id !== form.wallet_id),
    [wallets, form.wallet_id],
  );

  const set =
    (key: keyof typeof BLANK_FORM) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleTypeChange = (type: TransactionType) =>
    setForm((f) => ({ ...f, type, category_id: "", destination_wallet_id: "" }));

  const borderFor = (field: string): React.CSSProperties => ({
    ...inputBaseStyle,
    border: `0.5px solid ${errors[field] ? "var(--color-negative)" : "var(--color-border)"}`,
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = transactionSchema.safeParse({
      type: form.type,
      amount: form.amount !== "" ? parseFloat(form.amount) : NaN,
      description: form.description,
      wallet_id: form.wallet_id,
      category_id: form.category_id || undefined,
      destination_wallet_id: form.destination_wallet_id || undefined,
      transaction_date: form.transaction_date,
    });

    if (!result.success) {
      setErrors(parseZodErrors(result.error));
      return;
    }

    setErrors({});
    updateMutation.mutate({
      ...result.data,
      transaction_date: dateToLocalIso(result.data.transaction_date),
      // Explicitly null out the field that doesn't apply to the current type
      ...(result.data.type === "transfer"
        ? { category_id: null }
        : { destination_wallet_id: null }),
    });
  };

  const isTransfer = form.type === "transfer";
  const isBusy = updateMutation.isPending || deleteMutation.isPending;

  if (!tx) return null;

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose} title="Edit transaction">
      <form
        onSubmit={handleSubmit}
        noValidate
        style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}
      >
        {/* Type selector */}
        <div
          style={{
            display: "flex",
            gap: "var(--space-1)",
            background: "var(--color-bg-subtle)",
            border: "0.5px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-1)",
          }}
        >
          {(["expense", "income", "transfer"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => handleTypeChange(t)}
              style={{
                flex: 1,
                padding: "var(--space-2)",
                borderRadius: "var(--radius-sm)",
                fontSize: "var(--text-sm)",
                fontWeight: form.type === t ? "var(--weight-medium)" : "var(--weight-normal)",
                background: form.type === t ? "var(--color-accent)" : "transparent",
                color:
                  form.type === t ? "var(--color-accent-fg)" : "var(--color-text-secondary)",
                border: "none",
                cursor: "pointer",
                minHeight: 36,
                textTransform: "capitalize",
              }}
            >
              {t}
            </button>
          ))}
        </div>

        <Field label="Amount (Rp)" htmlFor="edit-amount" error={errors.amount}>
          <AmountInput
            id="edit-amount"
            value={form.amount}
            onChange={(raw) => setForm((f) => ({ ...f, amount: raw }))}
            style={borderFor("amount")}
          />
        </Field>

        <Field label="Description" htmlFor="edit-description" error={errors.description}>
          <input
            id="edit-description"
            type="text"
            inputMode="text"
            autoComplete="off"
            placeholder={isTransfer ? "e.g. ATM withdrawal" : "e.g. Lunch at Warung"}
            value={form.description}
            onChange={set("description")}
            style={borderFor("description")}
          />
        </Field>

        <Field label={isTransfer ? "From wallet" : "Wallet"} htmlFor="edit-wallet" error={errors.wallet_id}>
          <select
            id="edit-wallet"
            value={form.wallet_id}
            onChange={set("wallet_id")}
            style={borderFor("wallet_id")}
          >
            <option value="">Select wallet</option>
            {(wallets ?? []).map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </Field>

        {isTransfer && (
          <Field label="To wallet" htmlFor="edit-dest-wallet" error={errors.destination_wallet_id}>
            <select
              id="edit-dest-wallet"
              value={form.destination_wallet_id}
              onChange={set("destination_wallet_id")}
              style={borderFor("destination_wallet_id")}
            >
              <option value="">Select destination</option>
              {destinationWallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </Field>
        )}

        {!isTransfer && (
          <Field label="Category" htmlFor="edit-category" error={errors.category_id}>
            <select
              id="edit-category"
              value={form.category_id}
              onChange={set("category_id")}
              style={borderFor("category_id")}
            >
              <option value="">Select category</option>
              {availableCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
        )}

        <Field label="Date" htmlFor="edit-date" error={errors.transaction_date}>
          <input
            id="edit-date"
            type="date"
            value={form.transaction_date}
            onChange={set("transaction_date")}
            style={borderFor("transaction_date")}
          />
        </Field>

        {(updateMutation.isError || deleteMutation.isError) && (
          <p style={{ fontSize: "var(--text-sm)", color: "var(--color-negative)" }}>
            Something went wrong. Please try again.
          </p>
        )}

        <SheetSubmitButton
          isPending={isBusy}
          label="Save changes"
          pendingLabel="Saving…"
        />

        {!isConfirmingDelete ? (
          <button
            type="button"
            onClick={() => setIsConfirmingDelete(true)}
            disabled={isBusy}
            style={{
              width: "100%",
              minHeight: 44,
              background: "transparent",
              border: "0.5px solid var(--color-negative)",
              borderRadius: "var(--radius-md)",
              fontSize: "var(--text-base)",
              color: "var(--color-negative)",
              cursor: isBusy ? "not-allowed" : "pointer",
              opacity: isBusy ? 0.5 : 1,
            }}
          >
            Delete transaction
          </button>
        ) : (
          <DeleteConfirmation
            isPending={deleteMutation.isPending}
            onConfirm={() => deleteMutation.mutate()}
            onCancel={() => setIsConfirmingDelete(false)}
          />
        )}
      </form>
    </BottomSheet>
  );
}

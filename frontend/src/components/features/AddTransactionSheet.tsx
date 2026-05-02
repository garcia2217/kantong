"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BottomSheet } from "@/src/components/ui/BottomSheet";
import { AmountInput } from "@/src/components/ui/AmountInput";
import { transactionSchema } from "@/src/lib/validations/transaction";
import { transactionService } from "@/src/lib/api/services/transactions";
import { categoryService } from "@/src/lib/api/services/categories";
import { walletService } from "@/src/lib/api/services/wallets";
import { TRANSACTION_KEYS, WALLET_KEYS, CATEGORY_KEYS } from "@/src/lib/api/keys";
import type { TransactionType } from "@/src/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const todayIso = () => new Date().toISOString().split("T")[0];

const dateToLocalIso = (dateStr: string): string => {
  const [y, m, d] = dateStr.split("-").map(Number);
  const now = new Date();
  return new Date(y, m - 1, d, now.getHours(), now.getMinutes(), now.getSeconds()).toISOString();
};

const DEFAULT_FORM = {
  type: "expense" as TransactionType,
  amount: "",
  description: "",
  wallet_id: "",
  category_id: "",
  destination_wallet_id: "",
  transaction_date: todayIso(),
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 44,
  fontSize: 16,
  padding: "var(--space-2) var(--space-3)",
  background: "var(--color-bg-subtle)",
  borderRadius: "var(--radius-md)",
  color: "var(--color-text-primary)",
  outline: "none",
};

// ─── Field wrapper ────────────────────────────────────────────────────────────

interface FieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
}

function Field({ label, error, children }: FieldProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
      <label
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

// ─── AddTransactionSheet ──────────────────────────────────────────────────────

interface AddTransactionSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddTransactionSheet({ isOpen, onClose }: AddTransactionSheetProps) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(DEFAULT_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    setForm({ ...DEFAULT_FORM, transaction_date: todayIso() });
    setErrors({});
    onClose();
  };

  const mutation = useMutation({
    mutationFn: (payload: Parameters<typeof transactionService.create>[0]) =>
      transactionService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSACTION_KEYS.all });
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

  const set = (key: keyof typeof DEFAULT_FORM) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleTypeChange = (type: TransactionType) =>
    setForm((f) => ({ ...f, type, category_id: "", destination_wallet_id: "" }));

  const borderFor = (field: string): React.CSSProperties => ({
    ...inputStyle,
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
      const errs: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        const key = String(err.path[0] ?? "");
        if (key && !errs[key]) errs[key] = err.message;
      });
      setErrors(errs);
      return;
    }

    setErrors({});
    mutation.mutate({
      ...result.data,
      transaction_date: dateToLocalIso(result.data.transaction_date),
    });
  };

  const isTransfer = form.type === "transfer";

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose} title="Add transaction">
      <form
        onSubmit={handleSubmit}
        noValidate
        style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}
      >
        {/* Type tabs */}
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
                fontWeight:
                  form.type === t ? "var(--weight-medium)" : "var(--weight-normal)",
                background: form.type === t ? "var(--color-accent)" : "transparent",
                color:
                  form.type === t
                    ? "var(--color-accent-fg)"
                    : "var(--color-text-secondary)",
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

        {/* Amount */}
        <Field label="Amount (Rp)" error={errors.amount}>
          <AmountInput
            value={form.amount}
            onChange={(raw) => setForm((f) => ({ ...f, amount: raw }))}
            style={borderFor("amount")}
          />
        </Field>

        {/* Description */}
        <Field label="Description" error={errors.description}>
          <input
            type="text"
            inputMode="text"
            autoComplete="off"
            placeholder={isTransfer ? "e.g. ATM withdrawal" : "e.g. Lunch at Warung"}
            value={form.description}
            onChange={set("description")}
            style={borderFor("description")}
          />
        </Field>

        {/* Source wallet */}
        <Field label={isTransfer ? "From wallet" : "Wallet"} error={errors.wallet_id}>
          <select value={form.wallet_id} onChange={set("wallet_id")} style={borderFor("wallet_id")}>
            <option value="">Select wallet</option>
            {(wallets ?? []).map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </Field>

        {/* Destination wallet (transfer only) */}
        {isTransfer && (
          <Field label="To wallet" error={errors.destination_wallet_id}>
            <select
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

        {/* Category (income + expense only) */}
        {!isTransfer && (
          <Field label="Category" error={errors.category_id}>
            <select value={form.category_id} onChange={set("category_id")} style={borderFor("category_id")}>
              <option value="">Select category</option>
              {availableCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
        )}

        {/* Date */}
        <Field label="Date" error={errors.transaction_date}>
          <input
            type="date"
            value={form.transaction_date}
            onChange={set("transaction_date")}
            style={borderFor("transaction_date")}
          />
        </Field>

        {/* Mutation error */}
        {mutation.isError && (
          <p style={{ fontSize: "var(--text-sm)", color: "var(--color-negative)" }}>
            Something went wrong. Please try again.
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={mutation.isPending}
          className="btn-primary"
          style={{
            width: "100%",
            minHeight: 44,
            background: "var(--color-accent)",
            color: "var(--color-accent-fg)",
            border: "none",
            borderRadius: "var(--radius-md)",
            fontSize: "var(--text-base)",
            fontWeight: "var(--weight-medium)",
            cursor: mutation.isPending ? "not-allowed" : "pointer",
            opacity: mutation.isPending ? 0.7 : 1,
          }}
        >
          {mutation.isPending ? "Saving…" : "Save transaction"}
        </button>
      </form>
    </BottomSheet>
  );
}

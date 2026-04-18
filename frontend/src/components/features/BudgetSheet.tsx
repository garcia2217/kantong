"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BottomSheet } from "@/src/components/ui/BottomSheet";
import { budgetSchema } from "@/src/lib/validations/budget";
import { budgetService } from "@/src/lib/api/services/budgets";
import { BUDGET_KEYS } from "@/src/lib/api/keys";
import type { Budget, Category } from "@/src/types";

interface BudgetSheetProps {
  isOpen: boolean;
  onClose: () => void;
  budget?: Budget;         // undefined = add mode
  year: number;
  month: number;
  categories: Category[];
  takenCategoryIds: string[]; // effective budget category IDs for the selected month
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 44,
  fontSize: 16,
  padding: "var(--space-2) var(--space-3)",
  background: "var(--color-bg-subtle)",
  border: "0.5px solid var(--color-border)",
  borderRadius: "var(--radius-md)",
  color: "var(--color-text-primary)",
  outline: "none",
};

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
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

export function BudgetSheet({
  isOpen,
  onClose,
  budget,
  year,
  month,
  categories,
  takenCategoryIds,
}: BudgetSheetProps) {
  const queryClient = useQueryClient();
  const isEdit = !!budget;

  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Expense categories not yet assigned a budget for this month
  const availableCategories = categories.filter(
    (c) =>
      c.type === "expense" &&
      (!takenCategoryIds.includes(c.id) || c.id === budget?.category_id),
  );

  const currentCategory = budget
    ? categories.find((c) => c.id === budget.category_id)
    : undefined;

  useEffect(() => {
    if (isOpen) {
      setCategoryId(budget?.category_id ?? "");
      setAmount(budget ? String(budget.amount) : "");
      setErrors({});
    }
  }, [isOpen, budget]);

  const mutation = useMutation({
    mutationFn: (data: { category_id: string; amount: number }) =>
      budget
        ? budgetService.update(budget.id, { amount: data.amount })
        : budgetService.create({
            category_id: data.category_id,
            amount: data.amount,
            month: null,
            year: null,
            is_default: true,
          }),
    onSuccess: () => {
      // Invalidating the root key cascades to all byMonth sub-keys
      queryClient.invalidateQueries({ queryKey: BUDGET_KEYS.all });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = budgetSchema.safeParse({
      category_id: categoryId,
      amount: amount !== "" ? parseFloat(amount) : NaN,
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
    mutation.mutate(result.data);
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit budget" : "Add budget"}
    >
      <form
        onSubmit={handleSubmit}
        noValidate
        style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}
      >
        {/* Category */}
        <Field label="Category" error={errors.category_id}>
          {isEdit ? (
            <div
              style={{
                ...inputStyle,
                display: "flex",
                alignItems: "center",
                color: "var(--color-text-primary)",
                cursor: "default",
              }}
            >
              {currentCategory?.name ?? "Unknown category"}
            </div>
          ) : (
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              style={{
                ...inputStyle,
                border: `0.5px solid ${errors.category_id ? "var(--color-negative)" : "var(--color-border)"}`,
                cursor: "pointer",
              }}
            >
              <option value="">Select a category…</option>
              {availableCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
        </Field>

        {/* Amount */}
        <Field label="Monthly budget amount (Rp)" error={errors.amount}>
          <input
            type="number"
            inputMode="decimal"
            autoComplete="off"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{
              ...inputStyle,
              border: `0.5px solid ${errors.amount ? "var(--color-negative)" : "var(--color-border)"}`,
            }}
          />
        </Field>

        {/* Hint when editing a default budget */}
        {isEdit && budget?.is_default && (
          <p
            style={{
              fontSize: "var(--text-xs)",
              color: "var(--color-text-tertiary)",
              marginTop: "calc(var(--space-1) * -1)",
            }}
          >
            This is your default budget — changes apply to all months.
          </p>
        )}

        {mutation.isError && (
          <p style={{ fontSize: "var(--text-sm)", color: "var(--color-negative)" }}>
            Something went wrong. Please try again.
          </p>
        )}

        <button
          type="submit"
          disabled={mutation.isPending}
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
          {mutation.isPending ? "Saving…" : isEdit ? "Save changes" : "Add budget"}
        </button>
      </form>
    </BottomSheet>
  );
}

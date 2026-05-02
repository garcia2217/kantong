"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BottomSheet } from "@/src/components/ui/BottomSheet";
import { AmountInput } from "@/src/components/ui/AmountInput";
import { Field, inputBaseStyle } from "@/src/components/ui/Field";
import { SheetSubmitButton } from "@/src/components/ui/SheetSubmitButton";
import { budgetSchema } from "@/src/lib/validations/budget";
import { budgetService } from "@/src/lib/api/services/budgets";
import { BUDGET_KEYS } from "@/src/lib/api/keys";
import { parseZodErrors } from "@/src/lib/utils/form";
import type { Budget, Category } from "@/src/types";

interface BudgetSheetProps {
  isOpen: boolean;
  onClose: () => void;
  budget?: Budget;
  year: number;
  month: number;
  categories: Category[];
  takenCategoryIds: string[];
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
      setErrors(parseZodErrors(result.error));
      return;
    }
    setErrors({});
    mutation.mutate(result.data);
  };

  const selectBorderStyle: React.CSSProperties = {
    ...inputBaseStyle,
    border: `0.5px solid ${errors.category_id ? "var(--color-negative)" : "var(--color-border)"}`,
    cursor: "pointer",
  };

  const amountBorderStyle: React.CSSProperties = {
    ...inputBaseStyle,
    border: `0.5px solid ${errors.amount ? "var(--color-negative)" : "var(--color-border)"}`,
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
        <Field label="Category" htmlFor="budget-category" error={errors.category_id}>
          {isEdit ? (
            <div
              style={{
                ...inputBaseStyle,
                display: "flex",
                alignItems: "center",
                color: "var(--color-text-primary)",
                cursor: "default",
                border: "0.5px solid var(--color-border)",
              }}
            >
              {currentCategory?.name ?? "Unknown category"}
            </div>
          ) : (
            <select
              id="budget-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              style={selectBorderStyle}
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

        <Field label="Monthly budget amount (Rp)" htmlFor="budget-amount" error={errors.amount}>
          <AmountInput
            id="budget-amount"
            value={amount}
            onChange={setAmount}
            style={amountBorderStyle}
          />
        </Field>

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

        <SheetSubmitButton
          isPending={mutation.isPending}
          label={isEdit ? "Save changes" : "Add budget"}
          pendingLabel="Saving…"
        />
      </form>
    </BottomSheet>
  );
}

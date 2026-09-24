"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BottomSheet } from "@/src/components/ui/BottomSheet";
import { AmountInput } from "@/src/components/ui/AmountInput";
import { Field, inputBaseStyle } from "@/src/components/ui/Field";
import { SheetSubmitButton } from "@/src/components/ui/SheetSubmitButton";
import { budgetSchema } from "@/src/lib/validations/budget";
import { budgetService } from "@/src/lib/api/services/budgets";
import { BUDGET_KEYS } from "@/src/lib/api/keys";
import { parseZodErrors } from "@/src/lib/utils/form";
import { formatMonthYear } from "@/src/lib/utils/format";
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
  if (!isOpen) return null;

  return (
    <OpenBudgetSheet
      key={`${budget?.id ?? "new"}-${year}-${month}`}
      onClose={onClose}
      budget={budget}
      year={year}
      month={month}
      categories={categories}
      takenCategoryIds={takenCategoryIds}
    />
  );
}

type BudgetScope = "month" | "every";

function OpenBudgetSheet({
  onClose,
  budget,
  year,
  month,
  categories,
  takenCategoryIds,
}: Omit<BudgetSheetProps, "isOpen">) {
  const queryClient = useQueryClient();
  const isEdit = !!budget;
  const periodLabel = formatMonthYear(year, month);

  const [categoryId, setCategoryId] = useState(budget?.category_id ?? "");
  const [amount, setAmount] = useState(budget ? String(budget.amount) : "");
  const [scope, setScope] = useState<BudgetScope>(
    budget?.is_default ? "every" : "month",
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const deleteTriggerRef = useRef<HTMLButtonElement>(null);
  const keepBudgetRef = useRef<HTMLButtonElement>(null);
  const wasConfirmingRef = useRef(false);

  useEffect(() => {
    if (isConfirmingDelete) keepBudgetRef.current?.focus();
    else if (wasConfirmingRef.current) deleteTriggerRef.current?.focus();
    wasConfirmingRef.current = isConfirmingDelete;
  }, [isConfirmingDelete]);

  const availableCategories = categories.filter(
    (c) =>
      c.type === "expense" &&
      (!takenCategoryIds.includes(c.id) || c.id === budget?.category_id),
  );

  const currentCategory = budget
    ? categories.find((c) => c.id === budget.category_id)
    : undefined;

  const mutation = useMutation({
    mutationFn: (data: { category_id: string; amount: number }) => {
      if (budget && (!budget.is_default || scope === "every")) {
        return budgetService.update(budget.id, { amount: data.amount });
      }
      return budgetService.create({
        category_id: data.category_id,
        amount: data.amount,
        month: scope === "month" ? month : null,
        year: scope === "month" ? year : null,
        is_default: scope === "every",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUDGET_KEYS.all });
      onClose();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => budgetService.delete(budget!.id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: BUDGET_KEYS.all });
      onClose();
    },
  });
  const isBusy = mutation.isPending || deleteMutation.isPending;

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
      isOpen
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

        {!isEdit && scope === "month" && takenCategoryIds.length > 0 && (
          <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)" }}>
            To change an existing recurring budget for {periodLabel}, edit that category instead.
          </p>
        )}

        <Field label="Monthly budget amount (Rp)" htmlFor="budget-amount" error={errors.amount}>
          <AmountInput
            id="budget-amount"
            value={amount}
            onChange={setAmount}
            style={amountBorderStyle}
          />
        </Field>

        {budget && !budget.is_default ? (
          <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)" }}>
            This budget applies only to {periodLabel}.
          </p>
        ) : (
          <fieldset style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            <legend style={{ marginBottom: "var(--space-2)", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "var(--color-text-secondary)" }}>
              Applies to
            </legend>
            {([
              { value: "month", title: "This month only", description: periodLabel },
              { value: "every", title: "Every month", description: "Your recurring budget" },
            ] as const).map((option) => (
              <label
                key={option.value}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-3)",
                  minHeight: 52,
                  padding: "var(--space-2) var(--space-3)",
                  border: `1px solid ${scope === option.value ? "var(--color-border-strong)" : "var(--color-border)"}`,
                  borderRadius: "var(--radius-md)",
                  background: scope === option.value ? "var(--color-bg-subtle)" : "transparent",
                  cursor: "pointer",
                }}
              >
                <input
                  type="radio"
                  name="budget-scope"
                  value={option.value}
                  checked={scope === option.value}
                  onChange={() => setScope(option.value)}
                  style={{ accentColor: "var(--color-accent)", width: 18, height: 18 }}
                />
                <span style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-medium)", color: "var(--color-text-primary)" }}>{option.title}</span>
                  <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)" }}>{option.description}</span>
                </span>
              </label>
            ))}
          </fieldset>
        )}

        {budget?.is_default && scope === "month" && (
          <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)" }}>
            This creates a {periodLabel} amount. Your every-month budget stays the same.
          </p>
        )}

        {(mutation.isError || deleteMutation.isError) && (
          <p role="alert" style={{ fontSize: "var(--text-sm)", color: "var(--color-negative)" }}>
            Something went wrong. Please try again.
          </p>
        )}

        {!isConfirmingDelete && (
          <SheetSubmitButton
            isPending={isBusy}
            label={isEdit && budget?.is_default && scope === "month" ? `Set for ${periodLabel}` : isEdit ? "Save changes" : "Add budget"}
            pendingLabel="Saving…"
          />
        )}

        {budget && (isConfirmingDelete ? (
          <div role="group" aria-label="Confirm budget deletion" style={{ padding: "var(--space-4)", border: "1px solid var(--color-border-strong)", borderRadius: "var(--radius-md)", background: "var(--color-bg-subtle)" }}>
            <p style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", color: "var(--color-text-primary)" }}>
              Delete this budget?
            </p>
            <p style={{ marginTop: "var(--space-1)", fontSize: "var(--text-sm)", color: "var(--color-text-secondary)" }}>
              {budget.is_default
                ? "This removes the recurring budget from every month."
                : `This removes the ${periodLabel} amount. A recurring budget may take effect again.`}
            </p>
            <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-4)" }}>
              <button ref={keepBudgetRef} type="button" data-sheet-no-dirty onClick={() => { deleteMutation.reset(); setIsConfirmingDelete(false); }} disabled={isBusy} style={{ flex: 1, minHeight: 44, border: "1px solid var(--color-border-strong)", borderRadius: "var(--radius-md)", background: "var(--color-bg-elevated)", color: "var(--color-text-primary)", cursor: "pointer" }}>
                Keep budget
              </button>
              <button type="button" data-sheet-no-dirty onClick={() => deleteMutation.mutate()} disabled={isBusy} style={{ flex: 1, minHeight: 44, border: "none", borderRadius: "var(--radius-md)", background: "var(--color-negative)", color: "var(--color-accent-fg)", fontWeight: "var(--weight-medium)", cursor: isBusy ? "not-allowed" : "pointer" }}>
                {deleteMutation.isPending ? "Deleting…" : "Delete budget"}
              </button>
            </div>
          </div>
        ) : (
          <button ref={deleteTriggerRef} type="button" data-sheet-no-dirty onClick={() => setIsConfirmingDelete(true)} disabled={isBusy} style={{ minHeight: 44, border: "1px solid var(--color-border-strong)", borderRadius: "var(--radius-md)", background: "transparent", color: "var(--color-negative)", fontSize: "var(--text-base)", cursor: isBusy ? "not-allowed" : "pointer" }}>
            Delete budget
          </button>
        ))}
      </form>
    </BottomSheet>
  );
}

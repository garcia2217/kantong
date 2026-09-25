"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BottomSheet } from "@/src/components/ui/BottomSheet";
import { Field, inputBaseStyle } from "@/src/components/ui/Field";
import { SheetSubmitButton } from "@/src/components/ui/SheetSubmitButton";
import { categorySchema } from "@/src/lib/validations/settings";
import { categoryService } from "@/src/lib/api/services/categories";
import { CATEGORY_KEYS } from "@/src/lib/api/keys";
import { parseZodErrors } from "@/src/lib/utils/form";
import type { Category, CategoryType } from "@/src/types";

interface CategorySheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (message: string) => void;
  category?: Category;
  defaultType?: CategoryType;
}

export function CategorySheet({
  isOpen,
  onClose,
  onSaved,
  category,
  defaultType = "expense",
}: CategorySheetProps) {
  if (!isOpen) return null;
  return <OpenCategorySheet key={category?.id ?? defaultType} onClose={onClose} onSaved={onSaved} category={category} defaultType={defaultType} />;
}

function OpenCategorySheet({
  onClose,
  onSaved,
  category,
  defaultType,
}: Omit<CategorySheetProps, "isOpen" | "defaultType"> & { defaultType: CategoryType }) {
  const queryClient = useQueryClient();
  const isEdit = !!category;

  const [name, setName] = useState(category?.name ?? "");
  const [type, setType] = useState<CategoryType>(category?.type ?? defaultType);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: (data: { name: string; type: CategoryType }) =>
      category
        ? categoryService.update(category.id, { name: data.name })
        : categoryService.create({ name: data.name, type: data.type }),
    onSuccess: (saved) => {
      void queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.all });
      onSaved(category ? `Category "${saved.name}" updated.` : `Category "${saved.name}" added.`);
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = categorySchema.safeParse({ name, type });
    if (!result.success) {
      setErrors(parseZodErrors(result.error));
      return;
    }
    setErrors({});
    mutation.mutate(result.data);
  };

  return (
    <BottomSheet
      isOpen
      onClose={onClose}
      title={isEdit ? "Edit category" : "Add category"}
    >
      <form
        onSubmit={handleSubmit}
        noValidate
        style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}
      >
        {/* Type toggle — only shown in add mode; type is fixed when editing */}
        {!isEdit && (
          <fieldset
            style={{
              display: "flex",
              gap: "var(--space-1)",
              background: "var(--color-bg-subtle)",
              border: "0.5px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              padding: "var(--space-1)",
              minWidth: 0,
            }}
          >
            <legend style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "var(--color-text-secondary)" }}>
              Category type
            </legend>
            {(["expense", "income"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setType(t);
                  if (mutation.isError) mutation.reset();
                }}
                aria-pressed={type === t}
                style={{
                  flex: 1,
                  padding: "var(--space-2)",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "var(--text-sm)",
                  fontWeight: type === t ? "var(--weight-medium)" : "var(--weight-normal)",
                  background: type === t ? "var(--color-accent)" : "transparent",
                  color: type === t ? "var(--color-accent-fg)" : "var(--color-text-secondary)",
                  border: "none",
                  cursor: "pointer",
                  minHeight: 44,
                  textTransform: "capitalize",
                }}
              >
                {t}
              </button>
            ))}
          </fieldset>
        )}

        <Field label="Category name" htmlFor="category-name" error={errors.name}>
          <input
            id="category-name"
            type="text"
            autoComplete="off"
            placeholder={type === "income" ? "e.g. Salary, Bonus" : "e.g. Food, Transport"}
            maxLength={100}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setErrors((current) => ({ ...current, name: "" }));
              if (mutation.isError) mutation.reset();
            }}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "category-name-error" : undefined}
            style={{
              ...inputBaseStyle,
              border: `0.5px solid ${errors.name ? "var(--color-negative)" : "var(--color-border)"}`,
            }}
          />
        </Field>

        {mutation.isError && (
          <p role="alert" style={{ fontSize: "var(--text-sm)", color: "var(--color-negative)" }}>
            Could not save the category. Try again.
          </p>
        )}

        <SheetSubmitButton
          isPending={mutation.isPending}
          label={isEdit ? "Save changes" : "Add category"}
          pendingLabel="Saving…"
        />
      </form>
    </BottomSheet>
  );
}

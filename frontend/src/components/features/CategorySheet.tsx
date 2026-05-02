"use client";

import { useEffect, useState } from "react";
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
  category?: Category;
  defaultType?: CategoryType;
}

export function CategorySheet({
  isOpen,
  onClose,
  category,
  defaultType = "expense",
}: CategorySheetProps) {
  const queryClient = useQueryClient();
  const isEdit = !!category;

  const [name, setName] = useState("");
  const [type, setType] = useState<CategoryType>(defaultType);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setName(category?.name ?? "");
      setType(category?.type ?? defaultType);
      setErrors({});
    }
  }, [isOpen, category, defaultType]);

  const mutation = useMutation({
    mutationFn: (data: { name: string; type: CategoryType }) =>
      category
        ? categoryService.update(category.id, { name: data.name })
        : categoryService.create({ name: data.name, type: data.type }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.all });
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
      isOpen={isOpen}
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
            {(["expense", "income"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
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
                  minHeight: 36,
                  textTransform: "capitalize",
                }}
              >
                {t}
              </button>
            ))}
          </div>
        )}

        <Field label="Category name" htmlFor="category-name" error={errors.name}>
          <input
            id="category-name"
            type="text"
            autoComplete="off"
            placeholder={type === "income" ? "e.g. Salary, Bonus" : "e.g. Food, Transport"}
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              ...inputBaseStyle,
              border: `0.5px solid ${errors.name ? "var(--color-negative)" : "var(--color-border)"}`,
            }}
          />
        </Field>

        {mutation.isError && (
          <p style={{ fontSize: "var(--text-sm)", color: "var(--color-negative)" }}>
            Something went wrong. Please try again.
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

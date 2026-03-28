"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BottomSheet } from "@/src/components/ui/BottomSheet";
import { categorySchema } from "@/src/lib/validations/settings";
import { categoryService } from "@/src/lib/api/services/categories";
import { CATEGORY_KEYS } from "@/src/lib/api/keys";
import { MOCK_USER_ID } from "@/src/lib/mock/mock-user";
import type { Category, CategoryType } from "@/src/types";

interface CategorySheetProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category;       // undefined = add mode
  defaultType?: CategoryType; // pre-selects the type in add mode
}

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
        : categoryService.create({ name: data.name, type: data.type, user_id: MOCK_USER_ID }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.all });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = categorySchema.safeParse({ name, type });
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.errors.forEach((err) => {
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

        <Field label="Category name" error={errors.name}>
          <input
            type="text"
            autoComplete="off"
            placeholder={type === "income" ? "e.g. Salary, Bonus" : "e.g. Food, Transport"}
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              ...inputStyle,
              border: `0.5px solid ${errors.name ? "var(--color-negative)" : "var(--color-border)"}`,
            }}
          />
        </Field>

        {mutation.isError && (
          <p style={{ fontSize: "var(--text-sm)", color: "var(--color-negative)" }}>
            Something went wrong. Please try again.
          </p>
        )}

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
          {mutation.isPending ? "Saving…" : isEdit ? "Save changes" : "Add category"}
        </button>
      </form>
    </BottomSheet>
  );
}

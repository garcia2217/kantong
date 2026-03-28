"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BottomSheet } from "@/src/components/ui/BottomSheet";
import { debtSchema, settleSchema } from "@/src/lib/validations/debt";
import { debtService } from "@/src/lib/api/services/debts";
import { personService } from "@/src/lib/api/services/persons";
import { DEBT_KEYS, PERSON_KEYS } from "@/src/lib/api/keys";
import { MOCK_USER_ID } from "@/src/lib/mock/mock-user";
import { formatIDR, formatDueDate } from "@/src/lib/utils/format";
import type { Debt, DebtType, Person } from "@/src/types";

// ─── Shared styles ─────────────────────────────────────────────────────────────

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
        <p style={{ fontSize: "var(--text-sm)", color: "var(--color-negative)" }}>{error}</p>
      )}
    </div>
  );
}

// ─── Add Debt Sheet ────────────────────────────────────────────────────────────

interface AddDebtSheetProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: DebtType;
  persons: Person[];
}

export function AddDebtSheet({
  isOpen,
  onClose,
  defaultType = "receivable",
  persons,
}: AddDebtSheetProps) {
  const queryClient = useQueryClient();
  const [type, setType] = useState<DebtType>(defaultType);
  const [personId, setPersonId] = useState("");
  const [newPersonName, setNewPersonName] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setType(defaultType);
      setPersonId("");
      setNewPersonName("");
      setAmount("");
      setDescription("");
      setDueDate("");
      setErrors({});
    }
  }, [isOpen, defaultType]);

  const mutation = useMutation({
    mutationFn: async (data: {
      personId: string;
      newPersonName: string;
      type: DebtType;
      amount: number;
      description: string;
      dueDate: string;
    }) => {
      let resolvedPersonId = data.personId;
      if (data.personId === "__new__" && data.newPersonName.trim()) {
        const created = await personService.create({
          name: data.newPersonName.trim(),
          user_id: MOCK_USER_ID,
        });
        resolvedPersonId = created.id;
      }
      return debtService.create({
        person_id: resolvedPersonId,
        type: data.type,
        amount: data.amount,
        description: data.description || undefined,
        due_date: data.dueDate || undefined,
        user_id: MOCK_USER_ID,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEBT_KEYS.all });
      queryClient.invalidateQueries({ queryKey: PERSON_KEYS.all });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const effectivePersonId =
      personId === "__new__" ? (newPersonName.trim() ? "__new__" : "") : personId;

    const result = debtSchema.safeParse({
      person_id: effectivePersonId,
      new_person_name: newPersonName,
      type,
      amount: amount !== "" ? parseFloat(amount) : NaN,
      description,
      due_date: dueDate,
    });

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
    mutation.mutate({
      personId,
      newPersonName,
      type: result.data.type,
      amount: result.data.amount,
      description: result.data.description ?? "",
      dueDate: result.data.due_date ?? "",
    });
  };

  const borderFor = (field: string): React.CSSProperties => ({
    ...inputStyle,
    border: `0.5px solid ${errors[field] ? "var(--color-negative)" : "var(--color-border)"}`,
  });

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Add debt">
      <form
        onSubmit={handleSubmit}
        noValidate
        style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}
      >
        {/* Type toggle */}
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
          {(["receivable", "payable"] as const).map((t) => (
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
              }}
            >
              {t === "receivable" ? "They owe me" : "I owe them"}
            </button>
          ))}
        </div>

        {/* Person */}
        <Field label="Person" error={errors.person_id}>
          <select
            value={personId}
            onChange={(e) => setPersonId(e.target.value)}
            style={borderFor("person_id")}
          >
            <option value="">Select a person…</option>
            {persons.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
            <option value="__new__">+ Add new person</option>
          </select>
        </Field>

        {personId === "__new__" && (
          <Field label="New person's name" error={errors.new_person_name}>
            <input
              type="text"
              autoComplete="off"
              placeholder="e.g. Budi"
              value={newPersonName}
              onChange={(e) => setNewPersonName(e.target.value)}
              style={borderFor("new_person_name")}
            />
          </Field>
        )}

        {/* Amount */}
        <Field label="Amount (Rp)" error={errors.amount}>
          <input
            type="number"
            inputMode="decimal"
            autoComplete="off"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={borderFor("amount")}
          />
        </Field>

        {/* Description */}
        <Field label="Description (optional)" error={errors.description}>
          <input
            type="text"
            autoComplete="off"
            placeholder="What was this for?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ ...inputStyle, border: "0.5px solid var(--color-border)" }}
          />
        </Field>

        {/* Due date */}
        <Field label="Due date (optional)" error={errors.due_date}>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            style={{ ...inputStyle, border: "0.5px solid var(--color-border)" }}
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
          {mutation.isPending ? "Saving…" : "Add debt"}
        </button>
      </form>
    </BottomSheet>
  );
}

// ─── Settle Sheet ──────────────────────────────────────────────────────────────

interface SettleSheetProps {
  isOpen: boolean;
  onClose: () => void;
  debt: Debt | null;
}

export function SettleSheet({ isOpen, onClose, debt }: SettleSheetProps) {
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (isOpen && debt) {
      const outstanding = debt.amount - debt.amount_settled;
      setAmount(String(outstanding));
      setError(undefined);
    }
  }, [isOpen, debt]);

  const mutation = useMutation({
    mutationFn: ({ id, newSettled }: { id: string; newSettled: number }) =>
      debtService.update(id, { amount_settled: newSettled }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEBT_KEYS.all });
      onClose();
    },
  });

  if (!debt) return null;

  const outstanding = debt.amount - debt.amount_settled;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = settleSchema.safeParse({
      amount_settled: amount !== "" ? parseFloat(amount) : NaN,
    });
    if (!result.success) {
      setError(result.error.errors[0]?.message);
      return;
    }
    const newSettled = Math.min(
      debt.amount_settled + result.data.amount_settled,
      debt.amount,
    );
    if (result.data.amount_settled > outstanding) {
      setError(`Max settlement is ${formatIDR(outstanding)}`);
      return;
    }
    setError(undefined);
    mutation.mutate({ id: debt.id, newSettled });
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Record settlement">
      <form
        onSubmit={handleSubmit}
        noValidate
        style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}
      >
        {/* Summary */}
        <div
          style={{
            background: "var(--color-bg-subtle)",
            border: "0.5px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-3) var(--space-4)",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-1)",
          }}
        >
          <p
            style={{
              fontSize: "var(--text-sm)",
              color: "var(--color-text-secondary)",
            }}
          >
            Outstanding
          </p>
          <p
            style={{
              fontSize: "var(--text-lg)",
              fontWeight: "var(--weight-semibold)",
              color: "var(--color-text-primary)",
            }}
          >
            {formatIDR(outstanding)}
          </p>
          {debt.due_date && (
            <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>
              Due {formatDueDate(debt.due_date)}
            </p>
          )}
        </div>

        <Field label="Amount to settle (Rp)" error={error}>
          <input
            type="number"
            inputMode="decimal"
            autoComplete="off"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{
              ...inputStyle,
              border: `0.5px solid ${error ? "var(--color-negative)" : "var(--color-border)"}`,
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
          {mutation.isPending ? "Recording…" : "Record settlement"}
        </button>
      </form>
    </BottomSheet>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BottomSheet } from "@/src/components/ui/BottomSheet";
import { AmountInput } from "@/src/components/ui/AmountInput";
import { Field, inputBaseStyle } from "@/src/components/ui/Field";
import { SheetSubmitButton } from "@/src/components/ui/SheetSubmitButton";
import { debtSchema, settleSchema } from "@/src/lib/validations/debt";
import { debtService } from "@/src/lib/api/services/debts";
import { personService } from "@/src/lib/api/services/persons";
import { DEBT_KEYS, PERSON_KEYS } from "@/src/lib/api/keys";
import { parseZodErrors } from "@/src/lib/utils/form";
import { formatIDR, formatDueDate } from "@/src/lib/utils/format";
import type { Debt, DebtType, Person } from "@/src/types";

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
        const created = await personService.create({ name: data.newPersonName.trim() });
        resolvedPersonId = created.id;
      }
      return debtService.create({
        person_id: resolvedPersonId,
        type: data.type,
        amount: data.amount,
        description: data.description || undefined,
        due_date: data.dueDate || undefined,
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
      setErrors(parseZodErrors(result.error));
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
    ...inputBaseStyle,
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

        <Field label="Person" htmlFor="debt-person" error={errors.person_id}>
          <select
            id="debt-person"
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
          <Field label="New person's name" htmlFor="debt-new-person" error={errors.new_person_name}>
            <input
              id="debt-new-person"
              type="text"
              autoComplete="off"
              placeholder="e.g. Budi"
              value={newPersonName}
              onChange={(e) => setNewPersonName(e.target.value)}
              style={borderFor("new_person_name")}
            />
          </Field>
        )}

        <Field label="Amount (Rp)" htmlFor="debt-amount" error={errors.amount}>
          <AmountInput
            id="debt-amount"
            value={amount}
            onChange={setAmount}
            style={borderFor("amount")}
          />
        </Field>

        <Field label="Description (optional)" htmlFor="debt-description" error={errors.description}>
          <input
            id="debt-description"
            type="text"
            autoComplete="off"
            placeholder="What was this for?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ ...inputBaseStyle, border: "0.5px solid var(--color-border)" }}
          />
        </Field>

        <Field label="Due date (optional)" htmlFor="debt-due-date" error={errors.due_date}>
          <input
            id="debt-due-date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            style={{ ...inputBaseStyle, border: "0.5px solid var(--color-border)" }}
          />
        </Field>

        {mutation.isError && (
          <p style={{ fontSize: "var(--text-sm)", color: "var(--color-negative)" }}>
            Something went wrong. Please try again.
          </p>
        )}

        <SheetSubmitButton
          isPending={mutation.isPending}
          label="Add debt"
          pendingLabel="Saving…"
        />
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
      queryClient.invalidateQueries({ queryKey: DEBT_KEYS.netPosition });
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
      setError(result.error.issues[0]?.message);
      return;
    }
    if (result.data.amount_settled > outstanding) {
      setError(`Max settlement is ${formatIDR(outstanding)}`);
      return;
    }
    setError(undefined);
    const newSettled = Math.min(
      debt.amount_settled + result.data.amount_settled,
      debt.amount,
    );
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
          <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)" }}>
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

        <Field label="Amount to settle (Rp)" htmlFor="settle-amount" error={error}>
          <AmountInput
            id="settle-amount"
            value={amount}
            onChange={setAmount}
            style={{
              ...inputBaseStyle,
              border: `0.5px solid ${error ? "var(--color-negative)" : "var(--color-border)"}`,
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
          label="Record settlement"
          pendingLabel="Recording…"
        />
      </form>
    </BottomSheet>
  );
}

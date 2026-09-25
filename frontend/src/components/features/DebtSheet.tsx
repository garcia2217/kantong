"use client";

import { useState } from "react";
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
import type { DebtBrowseItem, DebtType, Person } from "@/src/types";

// ─── Add Debt Sheet ────────────────────────────────────────────────────────────

interface AddDebtSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
  defaultType?: DebtType;
  persons: Person[];
}

export function AddDebtSheet({
  isOpen,
  onClose,
  onCreated,
  defaultType = "receivable",
  persons,
}: AddDebtSheetProps) {
  if (!isOpen) return null;
  return <OpenAddDebtSheet key={defaultType} onClose={onClose} onCreated={onCreated} defaultType={defaultType} persons={persons} />;
}

function OpenAddDebtSheet({
  onClose,
  onCreated,
  defaultType,
  persons,
}: Omit<AddDebtSheetProps, "isOpen" | "defaultType"> & { defaultType: DebtType }) {
  const queryClient = useQueryClient();
  const [type, setType] = useState<DebtType>(defaultType);
  const [personId, setPersonId] = useState("");
  const [newPersonName, setNewPersonName] = useState("");
  const [createdPerson, setCreatedPerson] = useState<Person | null>(null);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

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
      if (data.personId === "__new__") {
        const created = await personService.create({ name: data.newPersonName });
        resolvedPersonId = created.id;
        setCreatedPerson(created);
        setPersonId(created.id);
        void queryClient.invalidateQueries({ queryKey: PERSON_KEYS.all });
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
      void queryClient.invalidateQueries({ queryKey: DEBT_KEYS.all });
      onCreated();
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = debtSchema.safeParse({
      person_id: personId,
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
      newPersonName: result.data.new_person_name,
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
  const clearError = (field: string) => {
    if (mutation.isError) mutation.reset();
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };
  const availablePersons = createdPerson && !persons.some((person) => person.id === createdPerson.id)
    ? [...persons, createdPerson]
    : persons;

  return (
    <BottomSheet isOpen onClose={onClose} title="Add debt">
      <form
        onSubmit={handleSubmit}
        noValidate
        style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}
      >
        {/* Type toggle */}
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
            Who owes whom?
          </legend>
          {(["receivable", "payable"] as const).map((t) => (
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
              }}
            >
              {t === "receivable" ? "They owe me" : "I owe them"}
            </button>
          ))}
        </fieldset>

        <Field label="Person" htmlFor="debt-person" error={errors.person_id}>
          <select
            id="debt-person"
            value={personId}
            onChange={(e) => {
              setPersonId(e.target.value);
              clearError("person_id");
            }}
            aria-invalid={!!errors.person_id}
            aria-describedby={errors.person_id ? "debt-person-error" : undefined}
            style={borderFor("person_id")}
          >
            <option value="">Select a person…</option>
            {availablePersons.map((p) => (
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
              maxLength={100}
              value={newPersonName}
              onChange={(e) => {
                setNewPersonName(e.target.value);
                clearError("new_person_name");
              }}
              aria-invalid={!!errors.new_person_name}
              aria-describedby={errors.new_person_name ? "debt-new-person-error" : undefined}
              style={borderFor("new_person_name")}
            />
          </Field>
        )}

        <Field label="Amount (Rp)" htmlFor="debt-amount" error={errors.amount}>
          <AmountInput
            id="debt-amount"
            value={amount}
            ariaInvalid={!!errors.amount}
            ariaDescribedBy={errors.amount ? "debt-amount-error" : undefined}
            onChange={(value) => {
              setAmount(value);
              clearError("amount");
            }}
            style={borderFor("amount")}
          />
        </Field>

        <Field label="Description (optional)" htmlFor="debt-description" error={errors.description}>
          <input
            id="debt-description"
            type="text"
            autoComplete="off"
            placeholder="What was this for?"
            maxLength={500}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              clearError("description");
            }}
            aria-invalid={!!errors.description}
            aria-describedby={errors.description ? "debt-description-error" : undefined}
            style={{ ...inputBaseStyle, border: "0.5px solid var(--color-border)" }}
          />
        </Field>

        <Field label="Due date (optional)" htmlFor="debt-due-date" error={errors.due_date}>
          <input
            id="debt-due-date"
            type="date"
            value={dueDate}
            onChange={(e) => {
              setDueDate(e.target.value);
              clearError("due_date");
            }}
            aria-invalid={!!errors.due_date}
            aria-describedby={errors.due_date ? "debt-due-date-error" : undefined}
            style={{ ...inputBaseStyle, border: "0.5px solid var(--color-border)" }}
          />
        </Field>

        {mutation.isError && (
          <p role="alert" style={{ fontSize: "var(--text-sm)", color: "var(--color-negative)" }}>
            Could not add the debt. Try again.
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
  onRecorded: () => void;
  debt: DebtBrowseItem | null;
}

export function SettleSheet({ isOpen, onClose, onRecorded, debt }: SettleSheetProps) {
  if (!isOpen || !debt) return null;
  return <OpenSettleSheet key={debt.id} debt={debt} onClose={onClose} onRecorded={onRecorded} />;
}

function OpenSettleSheet({ debt, onClose, onRecorded }: { debt: DebtBrowseItem; onClose: () => void; onRecorded: () => void }) {
  const queryClient = useQueryClient();
  const outstanding = Math.max(0, debt.amount - debt.amount_settled);
  const [amount, setAmount] = useState(String(outstanding));
  const [error, setError] = useState<string | undefined>();
  const enteredAmount = amount ? Number(amount) : 0;
  const exceedsOutstanding = enteredAmount > outstanding;
  const remainingAfterPayment = Math.max(0, outstanding - enteredAmount);
  const isReceivable = debt.type === "receivable";

  const mutation = useMutation({
    mutationFn: ({ id, newSettled }: { id: string; newSettled: number }) =>
      debtService.update(id, { amount_settled: newSettled }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: DEBT_KEYS.all });
      onRecorded();
      onClose();
    },
  });

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
      setError(`Payment cannot exceed ${formatIDR(outstanding)}`);
      return;
    }
    setError(undefined);
    const newSettled = Math.min(debt.amount_settled + result.data.amount_settled, debt.amount);
    mutation.mutate({ id: debt.id, newSettled });
  };

  return (
    <BottomSheet isOpen onClose={onClose} title="Record payment">
      <form
        onSubmit={handleSubmit}
        noValidate
        style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}
      >
        <div className="debt-payment-summary">
          <p className="debt-payment-person">{debt.person_name}</p>
          <p className="debt-payment-direction">
            {isReceivable ? "They owe you" : "You owe them"}
          </p>
          <p className="debt-payment-outstanding">{formatIDR(outstanding)} remaining</p>
          {debt.due_date && (
            <p className="debt-payment-due">
              Due {formatDueDate(debt.due_date)}
            </p>
          )}
        </div>

        <Field
          label={isReceivable ? "Payment received (Rp)" : "Payment made (Rp)"}
          htmlFor="settle-amount"
          error={error}
        >
          <AmountInput
            id="settle-amount"
            value={amount}
            ariaInvalid={!!error}
            ariaDescribedBy={error ? "settle-amount-error" : undefined}
            onChange={(value) => {
              setAmount(value);
              setError(undefined);
              if (mutation.isError) mutation.reset();
            }}
            style={{
              ...inputBaseStyle,
              border: `0.5px solid ${error ? "var(--color-negative)" : "var(--color-border)"}`,
            }}
          />
        </Field>
        <button
          type="button"
          className="debt-payment-full"
          onClick={() => {
            setAmount(String(outstanding));
            setError(undefined);
            if (mutation.isError) mutation.reset();
          }}
        >
          Use full balance
        </button>

        {exceedsOutstanding ? (
          <p className="debt-payment-error" role="alert">
            Payment cannot exceed the {formatIDR(outstanding)} remaining balance.
          </p>
        ) : (
          <div className="debt-payment-preview" aria-live="polite">
            <span>Remaining after payment</span>
            <strong>{formatIDR(remainingAfterPayment)}</strong>
          </div>
        )}

        {mutation.isError && (
          <p role="alert" style={{ fontSize: "var(--text-sm)", color: "var(--color-negative)" }}>
            Could not record the payment. Try again.
          </p>
        )}

        <SheetSubmitButton
          isPending={mutation.isPending}
          label="Record payment"
          pendingLabel="Recording…"
        />
      </form>
    </BottomSheet>
  );
}

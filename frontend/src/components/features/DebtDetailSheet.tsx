"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BottomSheet } from "@/src/components/ui/BottomSheet";
import { Field, inputBaseStyle } from "@/src/components/ui/Field";
import { SheetSubmitButton } from "@/src/components/ui/SheetSubmitButton";
import { debtService } from "@/src/lib/api/services/debts";
import { DEBT_KEYS } from "@/src/lib/api/keys";
import { debtDetailsSchema } from "@/src/lib/validations/debt";
import { formatDueDate, formatIDR } from "@/src/lib/utils/format";
import type { DebtBrowseItem } from "@/src/types";

interface DebtDetailSheetProps {
  debt: DebtBrowseItem | null;
  onClose: () => void;
  onUpdated: (debt: DebtBrowseItem) => void;
  onDelete: () => void;
  isDeleting: boolean;
  deleteError: boolean;
}

export function DebtDetailSheet({ debt, onClose, onUpdated, onDelete, isDeleting, deleteError }: DebtDetailSheetProps) {
  if (!debt) return null;
  return (
    <OpenDebtDetailSheet
      key={debt.id}
      debt={debt}
      onClose={onClose}
      onUpdated={onUpdated}
      onDelete={onDelete}
      isDeleting={isDeleting}
      deleteError={deleteError}
    />
  );
}

function OpenDebtDetailSheet({ debt, onClose, onUpdated, onDelete, isDeleting, deleteError }: Omit<DebtDetailSheetProps, "debt"> & { debt: DebtBrowseItem }) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(debt.description ?? "");
  const [dueDate, setDueDate] = useState(debt.due_date?.slice(0, 10) ?? "");
  const [descriptionError, setDescriptionError] = useState<string | undefined>();
  const outstanding = Math.max(0, debt.amount - debt.amount_settled);

  const update = useMutation({
    mutationFn: () => debtService.updateDetails(debt.id, {
      description: description.trim() || null,
      due_date: dueDate ? `${dueDate}T00:00:00` : null,
    }),
    onSuccess: (saved) => {
      void queryClient.invalidateQueries({ queryKey: DEBT_KEYS.all });
      onUpdated({ ...saved, person_name: debt.person_name });
      onClose();
    },
  });

  const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = debtDetailsSchema.safeParse({ description, due_date: dueDate });
    if (!result.success) {
      setDescriptionError(result.error.issues[0]?.message);
      return;
    }
    setDescriptionError(undefined);
    update.mutate();
  };

  return (
    <BottomSheet isOpen onClose={onClose} title={debt.person_name}>
      {isEditing ? (
        <form onSubmit={handleSave} noValidate className="debt-detail-form">
          <Field label="Description (optional)" htmlFor="debt-detail-description" error={descriptionError}>
            <textarea
              id="debt-detail-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              style={{ ...inputBaseStyle, border: "1px solid var(--color-border-strong)", resize: "vertical" }}
            />
          </Field>
          <Field label="Due date (optional)" htmlFor="debt-detail-due-date">
            <input
              id="debt-detail-due-date"
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              style={{ ...inputBaseStyle, border: "1px solid var(--color-border-strong)" }}
            />
          </Field>
          {update.isError && <p role="alert" className="debt-detail-error">Could not save changes. Try again.</p>}
          <SheetSubmitButton isPending={update.isPending} label="Save changes" pendingLabel="Saving…" />
        </form>
      ) : (
        <div className="debt-detail-content">
          <p className="debt-detail-direction">
            {debt.type === "receivable" ? "They owe me" : "I owe them"} · {debt.status === "settled" ? "Settled" : "Active"}
          </p>
          <p className="debt-detail-balance">{formatIDR(outstanding)} remaining</p>
          <dl className="debt-detail-facts">
            <div><dt>Original amount</dt><dd>{formatIDR(debt.amount)}</dd></div>
            <div><dt>Paid so far</dt><dd>{formatIDR(debt.amount_settled)}</dd></div>
            <div><dt>Due date</dt><dd>{debt.due_date ? formatDueDate(debt.due_date) : "Not set"}</dd></div>
            <div><dt>Description</dt><dd>{debt.description || "Not set"}</dd></div>
          </dl>
          <button type="button" data-sheet-no-dirty className="debt-detail-edit" onClick={() => setIsEditing(true)}>
            Edit details
          </button>
          {deleteError && <p role="alert" className="debt-detail-error">Could not delete this debt. Try again.</p>}
          <button
            type="button"
            data-sheet-no-dirty
            className="debt-detail-delete"
            onClick={onDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting…" : "Delete debt"}
          </button>
        </div>
      )}
    </BottomSheet>
  );
}

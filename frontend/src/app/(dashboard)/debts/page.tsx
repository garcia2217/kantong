"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { debtService } from "@/src/lib/api/services/debts";
import { personService } from "@/src/lib/api/services/persons";
import { DEBT_KEYS, PERSON_KEYS } from "@/src/lib/api/keys";
import { formatIDR, formatIDRCompact, formatDueDate } from "@/src/lib/utils/format";
import { StatCard } from "@/src/components/ui/StatCard";
import { AddDebtSheet, SettleSheet } from "@/src/components/features/DebtSheet";
import type { Debt, DebtType } from "@/src/types";

// ─── Icons ─────────────────────────────────────────────────────────────────────

const strokeProps = {
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" {...strokeProps}>
    <path d="M7 2V12M2 7H12" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" {...strokeProps}>
    <path d="M2.5 7L5.5 10L11.5 4" />
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" {...strokeProps}>
    <path d="M2 3.5H12M5 3.5V2.5C5 2 5.5 1.5 6 1.5H8C8.5 1.5 9 2 9 2.5V3.5M5.5 6V11M8.5 6V11M2.5 3.5L3 12C3 12.5 3.5 13 4 13H10C10.5 13 11 12.5 11 12L11.5 3.5" />
  </svg>
);

// ─── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Debt["status"] }) {
  const styles: Record<Debt["status"], { color: string; bg: string; label: string }> = {
    pending: {
      color: "var(--color-text-secondary)",
      bg: "var(--color-tag-bg)",
      label: "Pending",
    },
    partial: {
      color: "#B45309",
      bg: "#FEF3C7",
      label: "Partial",
    },
    settled: {
      color: "var(--color-positive)",
      bg: "var(--color-positive-bg)",
      label: "Settled",
    },
  };
  const s = styles[status];
  return (
    <span
      style={{
        fontSize: "var(--text-xs)",
        fontWeight: "var(--weight-medium)",
        color: s.color,
        background: s.bg,
        padding: "1px 6px",
        borderRadius: "var(--radius-full)",
        flexShrink: 0,
      }}
    >
      {s.label}
    </span>
  );
}

// ─── Debt row ──────────────────────────────────────────────────────────────────

interface DebtRowProps {
  debt: Debt;
  personName: string;
  onSettle: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

function DebtRow({ debt, personName, onSettle, onDelete, isDeleting }: DebtRowProps) {
  const outstanding = debt.amount - debt.amount_settled;
  const isSettled = debt.status === "settled";

  const actionBtn: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 44,
    minHeight: 44,
    padding: "var(--space-2)",
    background: "transparent",
    border: "none",
    borderRadius: "var(--radius-sm)",
    cursor: "pointer",
  };

  return (
    <div
      style={{
        padding: "var(--space-3) var(--space-4)",
        display: "flex",
        alignItems: "flex-start",
        gap: "var(--space-3)",
        minHeight: 64,
        opacity: isSettled ? 0.6 : 1,
      }}
    >
      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Name + badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
            flexWrap: "wrap",
            marginBottom: 2,
          }}
        >
          <span
            style={{
              fontSize: "var(--text-base)",
              fontWeight: "var(--weight-medium)",
              color: "var(--color-text-primary)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {personName}
          </span>
          <StatusBadge status={debt.status} />
        </div>

        {/* Description */}
        {debt.description && (
          <p
            style={{
              fontSize: "var(--text-sm)",
              color: "var(--color-text-secondary)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              marginBottom: 2,
            }}
          >
            {debt.description}
          </p>
        )}

        {/* Amount + due */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-3)",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: "var(--text-sm)",
              fontWeight: "var(--weight-semibold)",
              color: isSettled ? "var(--color-text-tertiary)" : "var(--color-text-primary)",
            }}
          >
            {formatIDR(debt.amount)}
          </span>
          {debt.amount_settled > 0 && !isSettled && (
            <span
              style={{
                fontSize: "var(--text-xs)",
                color: "var(--color-text-tertiary)",
              }}
            >
              {formatIDR(outstanding)} outstanding
            </span>
          )}
          {debt.due_date && !isSettled && (
            <span
              style={{
                fontSize: "var(--text-xs)",
                color: "var(--color-text-tertiary)",
              }}
            >
              Due {formatDueDate(debt.due_date)}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", flexShrink: 0 }}>
        {!isSettled && (
          <button
            onClick={onSettle}
            aria-label={`Settle debt with ${personName}`}
            style={{ ...actionBtn, color: "var(--color-positive)" }}
          >
            <CheckIcon />
          </button>
        )}
        <button
          onClick={onDelete}
          disabled={isDeleting}
          aria-label={`Delete debt with ${personName}`}
          style={{
            ...actionBtn,
            color: isDeleting ? "var(--color-text-tertiary)" : "var(--color-negative)",
          }}
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}

// ─── Section card ──────────────────────────────────────────────────────────────

interface SectionCardProps {
  title: string;
  count: number;
  isLoading: boolean;
  children: React.ReactNode;
}

function SectionCard({ title, count, isLoading, children }: SectionCardProps) {
  const divider: React.CSSProperties = {
    margin: "0 var(--space-4)",
    height: "0.5px",
    background: "var(--color-border)",
  };

  return (
    <div
      style={{
        background: "var(--color-bg-elevated)",
        border: "0.5px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "var(--space-3) var(--space-4)",
          borderBottom: "0.5px solid var(--color-border)",
        }}
      >
        <h2
          style={{
            fontSize: "var(--text-base)",
            fontWeight: "var(--weight-semibold)",
            color: "var(--color-text-primary)",
          }}
        >
          {title}
        </h2>
        <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-tertiary)" }}>
          {isLoading ? "…" : `${count} item${count !== 1 ? "s" : ""}`}
        </span>
      </div>

      {/* Rows */}
      {isLoading ? (
        [0, 1].map((i) => (
          <div key={i}>
            {i > 0 && <div style={divider} />}
            <div
              style={{
                padding: "var(--space-4)",
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-2)",
              }}
            >
              <div
                style={{
                  height: 16,
                  width: "35%",
                  background: "var(--color-bg-subtle)",
                  borderRadius: "var(--radius-sm)",
                }}
              />
              <div
                style={{
                  height: 12,
                  width: "55%",
                  background: "var(--color-bg-subtle)",
                  borderRadius: "var(--radius-sm)",
                }}
              />
            </div>
          </div>
        ))
      ) : count === 0 ? (
        <p
          style={{
            padding: "var(--space-6) var(--space-4)",
            textAlign: "center",
            fontSize: "var(--text-sm)",
            color: "var(--color-text-tertiary)",
          }}
        >
          None recorded.
        </p>
      ) : (
        children
      )}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

interface AddSheetState {
  open: boolean;
  defaultType: DebtType;
}

export default function DebtsPage() {
  const queryClient = useQueryClient();

  const [addSheet, setAddSheet] = useState<AddSheetState>({
    open: false,
    defaultType: "receivable",
  });
  const [settleDebt, setSettleDebt] = useState<Debt | null>(null);

  const { data: debtsRaw, isLoading: debtsLoading } = useQuery({
    queryKey: DEBT_KEYS.all,
    queryFn: debtService.getAll,
  });
  const debts = Array.isArray(debtsRaw) ? debtsRaw : [];

  const { data: netPosition, isLoading: netLoading } = useQuery({
    queryKey: DEBT_KEYS.netPosition,
    queryFn: debtService.getNetPosition,
  });

  const { data: persons = [], isLoading: personsLoading } = useQuery({
    queryKey: PERSON_KEYS.all,
    queryFn: personService.getAll,
  });

  const deleteDebt = useMutation({
    mutationFn: debtService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEBT_KEYS.all });
      queryClient.invalidateQueries({ queryKey: DEBT_KEYS.netPosition });
    },
  });

  const isLoading = debtsLoading || personsLoading;
  const personMap = new Map(persons.map((p) => [p.id, p.name]));

  const receivables = debts.filter((d) => d.type === "receivable");
  const payables = debts.filter((d) => d.type === "payable");

  const handleDelete = (debt: Debt) => {
    const name = personMap.get(debt.person_id) ?? "this person";
    if (
      window.confirm(
        `Delete debt with "${name}" for ${formatIDR(debt.amount)}? This cannot be undone.`,
      )
    ) {
      deleteDebt.mutate(debt.id);
    }
  };

  const renderRows = (list: Debt[]) => {
    const divider: React.CSSProperties = {
      margin: "0 var(--space-4)",
      height: "0.5px",
      background: "var(--color-border)",
    };
    return list.map((debt, idx) => (
      <div key={debt.id}>
        {idx > 0 && <div style={divider} />}
        <DebtRow
          debt={debt}
          personName={personMap.get(debt.person_id) ?? "Unknown"}
          onSettle={() => setSettleDebt(debt)}
          onDelete={() => handleDelete(debt)}
          isDeleting={deleteDebt.isPending && deleteDebt.variables === debt.id}
        />
      </div>
    ));
  };

  return (
    <>
      <div className="debts-page">
        <header className="debts-header">
          <div>
            <h1>Debts</h1>
            <p className="debts-subtitle">Keep track of money owed between you and others</p>
          </div>
          <button
            type="button"
            className="debts-add btn-primary"
            onClick={() => setAddSheet({ open: true, defaultType: "receivable" })}
            aria-label="Add debt"
          >
            <PlusIcon />
            <span className="debts-add-label">Add debt</span>
          </button>
        </header>

        <div className="debts-content">
          {/* Net position stat cards */}
          <div className="debts-summary grid grid-cols-2 gap-3">
            <StatCard
              label="They owe me"
              value={formatIDRCompact(netPosition?.totalReceivable ?? 0)}
              isLoading={netLoading}
            />
            <StatCard
              label="I owe them"
              value={formatIDRCompact(netPosition?.totalPayable ?? 0)}
              isLoading={netLoading}
            />
          </div>

          <SectionCard title="They owe me" count={receivables.length} isLoading={isLoading}>
            {renderRows(receivables)}
          </SectionCard>

          <SectionCard title="I owe them" count={payables.length} isLoading={isLoading}>
            {renderRows(payables)}
          </SectionCard>
        </div>
      </div>

      {/* Add sheet */}
      <AddDebtSheet
        isOpen={addSheet.open}
        onClose={() => setAddSheet((s) => ({ ...s, open: false }))}
        defaultType={addSheet.defaultType}
        persons={persons}
      />

      {/* Settle sheet */}
      <SettleSheet
        isOpen={!!settleDebt}
        onClose={() => setSettleDebt(null)}
        debt={settleDebt}
      />
    </>
  );
}

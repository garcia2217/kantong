"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { debtService } from "@/src/lib/api/services/debts";
import { personService } from "@/src/lib/api/services/persons";
import { DEBT_KEYS, PERSON_KEYS } from "@/src/lib/api/keys";
import { formatIDR } from "@/src/lib/utils/format";
import { AddDebtSheet, SettleSheet } from "@/src/components/features/DebtSheet";
import { DebtDetailSheet } from "@/src/components/features/DebtDetailSheet";
import type { Debt, DebtBrowseItem, DebtBrowsePage, DebtType } from "@/src/types";

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

const DAY_MS = 24 * 60 * 60 * 1000;
const DUE_SOON_DAYS = 7;

function calendarDayStamp(value: string): number {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

function dueInfo(dueDate: string | null, today: Date) {
  if (!dueDate) return { label: "", tone: "" };

  const day = calendarDayStamp(dueDate);
  const todayDay = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const daysUntilDue = Math.round((day - todayDay) / DAY_MS);
  const dateLabel = new Date(day).toLocaleDateString("en-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

  if (daysUntilDue < 0) {
    const daysOverdue = Math.abs(daysUntilDue);
    return {
      label: `Overdue by ${daysOverdue} day${daysOverdue === 1 ? "" : "s"} · ${dateLabel}`,
      tone: "overdue",
    };
  }
  if (daysUntilDue <= DUE_SOON_DAYS) {
    const when = daysUntilDue === 0
      ? "Due today"
      : daysUntilDue === 1
        ? "Due tomorrow"
        : `Due in ${daysUntilDue} days`;
    return { label: `${when} · ${dateLabel}`, tone: "soon" };
  }
  return { label: `Due ${dateLabel}`, tone: "" };
}

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
  debt: DebtBrowseItem;
  onDetails: () => void;
  onSettle: () => void;
}

function DebtRow({ debt, onDetails, onSettle }: DebtRowProps) {
  const outstanding = Math.max(0, debt.amount - debt.amount_settled);
  const isSettled = debt.status === "settled";
  const due = !isSettled ? dueInfo(debt.due_date, new Date()) : null;
  const personName = debt.person_name;

  return (
    <div className="debt-row">
      {/* Content */}
      <button
        type="button"
        className="debt-row-open"
        onClick={onDetails}
        aria-label={`View debt with ${personName}`}
      >
        {/* Name + badge */}
        <span
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
          {isSettled && (
            <span className="debt-row-direction">
              {debt.type === "receivable" ? "They owed me" : "I owed them"}
            </span>
          )}
          <StatusBadge status={debt.status} />
        </span>

        <span className="debt-row-amount">
          {isSettled ? `${formatIDR(debt.amount)} paid` : `${formatIDR(outstanding)} remaining`}
        </span>
        {debt.amount_settled > 0 && !isSettled && (
          <span className="debt-row-progress">
            {formatIDR(debt.amount_settled)} of {formatIDR(debt.amount)} paid
          </span>
        )}
        {debt.description && <span className="debt-row-description">{debt.description}</span>}
        {due?.label && (
          <span className={`debt-row-due${due.tone ? ` debt-row-due--${due.tone}` : ""}`}>
            {due.label}
          </span>
        )}
        <span className="debt-row-view">View details →</span>
      </button>

      {!isSettled && (
        <div className="debt-row-actions">
          <button
            type="button"
            className="debt-record-payment"
            onClick={onSettle}
            aria-label={`Record payment with ${personName}`}
          >
            Record payment
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Section card ──────────────────────────────────────────────────────────────

interface SectionCardProps {
  title: string;
  pageData: DebtBrowsePage | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onPageChange: (page: number) => void;
  emptyMessage: string;
  children: React.ReactNode;
}

function SectionCard({ title, pageData, isLoading, isError, onRetry, onPageChange, emptyMessage, children }: SectionCardProps) {
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
          {isLoading ? "…" : isError && !pageData ? "—" : `${pageData?.total ?? 0} item${pageData?.total !== 1 ? "s" : ""}`}
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
      ) : isError ? (
        <div className="debt-list-state" role="alert">
          <p>Could not load {title.toLowerCase()}.</p>
          <button type="button" onClick={onRetry}>Try again</button>
        </div>
      ) : !pageData?.items.length ? (
        <p
          style={{
            padding: "var(--space-6) var(--space-4)",
            textAlign: "center",
            fontSize: "var(--text-sm)",
            color: "var(--color-text-tertiary)",
          }}
        >
          {pageData?.total ? "No debts on this page. Go to the previous page." : emptyMessage}
        </p>
      ) : (
        children
      )}
      {pageData && (pageData.total > pageData.page_size || pageData.page > 1) && (
        <div className="debt-pagination">
          <button type="button" disabled={pageData.page <= 1} onClick={() => onPageChange(pageData.page - 1)}>
            Previous
          </button>
          <span>Page {pageData.page} of {Math.max(1, Math.ceil(pageData.total / pageData.page_size))}</span>
          <button
            type="button"
            disabled={pageData.page >= Math.ceil(pageData.total / pageData.page_size)}
            onClick={() => onPageChange(pageData.page + 1)}
          >
            Next
          </button>
        </div>
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
  const [settleDebt, setSettleDebt] = useState<DebtBrowseItem | null>(null);
  const [detailDebt, setDetailDebt] = useState<DebtBrowseItem | null>(null);
  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const [receivablePage, setReceivablePage] = useState(1);
  const [payablePage, setPayablePage] = useState(1);
  const [settledPage, setSettledPage] = useState(1);
  const [settledOpen, setSettledOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const receivables = useQuery({
    queryKey: DEBT_KEYS.browse("active", "receivable", search, receivablePage),
    queryFn: () => debtService.browse({ status: "active", debtType: "receivable", search, page: receivablePage }),
  });
  const payables = useQuery({
    queryKey: DEBT_KEYS.browse("active", "payable", search, payablePage),
    queryFn: () => debtService.browse({ status: "active", debtType: "payable", search, page: payablePage }),
  });
  const settled = useQuery({
    queryKey: DEBT_KEYS.browse("settled", null, search, settledPage),
    queryFn: () => debtService.browse({ status: "settled", search, page: settledPage }),
    enabled: settledOpen,
  });

  const {
    data: netPosition,
    isLoading: netLoading,
    isError: netError,
    refetch: refetchNet,
  } = useQuery({
    queryKey: DEBT_KEYS.netPosition,
    queryFn: debtService.getNetPosition,
  });

  const { data: persons = [] } = useQuery({
    queryKey: PERSON_KEYS.all,
    queryFn: personService.getAll,
  });

  const deleteDebt = useMutation({
    mutationFn: debtService.delete,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: DEBT_KEYS.all });
      setDetailDebt(null);
      setNotice("Debt deleted.");
    },
  });

  const handleDelete = (debt: DebtBrowseItem) => {
    if (
      window.confirm(
        `Delete debt with "${debt.person_name}" for ${formatIDR(debt.amount)}? This cannot be undone.`,
      )
    ) {
      deleteDebt.mutate(debt.id);
    }
  };

  const renderRows = (list: DebtBrowseItem[]) => {
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
          onDetails={() => {
            deleteDebt.reset();
            setDetailDebt(debt);
          }}
          onSettle={() => setSettleDebt(debt)}
        />
      </div>
    ));
  };

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearch(searchDraft.trim());
    setReceivablePage(1);
    setPayablePage(1);
    setSettledPage(1);
    if (searchDraft.trim()) setSettledOpen(true);
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
          {notice && (
            <div
              role="status"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "var(--space-3)",
                padding: "var(--space-3) var(--space-4)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                background: "var(--color-positive-bg)",
                color: "var(--color-text-primary)",
              }}
            >
              <span>{notice}</span>
              <button
                type="button"
                onClick={() => setNotice(null)}
                aria-label="Dismiss notification"
                style={{ minHeight: 44, padding: "0 var(--space-2)", color: "var(--color-accent)", cursor: "pointer" }}
              >
                Dismiss
              </button>
            </div>
          )}
          <div className="debts-summary" aria-label="Outstanding balances">
            <div className="debts-summary-item">
              <p>To collect</p>
              <strong>
                {netLoading ? "…" : netPosition ? formatIDR(netPosition.totalReceivable) : "Unavailable"}
              </strong>
            </div>
            <div className="debts-summary-item">
              <p>To pay</p>
              <strong>
                {netLoading ? "…" : netPosition ? formatIDR(netPosition.totalPayable) : "Unavailable"}
              </strong>
            </div>
          </div>
          {netError && (
            <p className="debts-summary-error" role="alert">
              {netPosition ? "Balances could not be refreshed." : "Balances could not be loaded."}{" "}
              <button type="button" onClick={() => void refetchNet()}>
                Try again
              </button>
            </p>
          )}

          <form className="debts-search" role="search" onSubmit={handleSearch}>
            <label htmlFor="debt-search">Find a debt</label>
            <div>
              <input
                id="debt-search"
                type="search"
                value={searchDraft}
                onChange={(event) => setSearchDraft(event.target.value)}
                placeholder="Search person or description"
              />
              <button type="submit">Search</button>
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchDraft("");
                    setSearch("");
                    setReceivablePage(1);
                    setPayablePage(1);
                    setSettledPage(1);
                  }}
                >
                  Clear
                </button>
              )}
            </div>
          </form>

          <SectionCard
            title="They owe me"
            pageData={receivables.data}
            isLoading={receivables.isLoading}
            isError={receivables.isError}
            onRetry={() => void receivables.refetch()}
            onPageChange={setReceivablePage}
            emptyMessage={search ? "No matching debts to collect." : "Nobody owes you money yet."}
          >
            {renderRows(receivables.data?.items ?? [])}
          </SectionCard>

          <SectionCard
            title="I owe them"
            pageData={payables.data}
            isLoading={payables.isLoading}
            isError={payables.isError}
            onRetry={() => void payables.refetch()}
            onPageChange={setPayablePage}
            emptyMessage={search ? "No matching debts to pay." : "You do not owe anyone money yet."}
          >
            {renderRows(payables.data?.items ?? [])}
          </SectionCard>

          <section className="debts-history">
            <button
              type="button"
              className="debts-history-toggle"
              aria-expanded={settledOpen}
              onClick={() => setSettledOpen((open) => !open)}
            >
              <span>Settled history</span>
              <span aria-hidden="true">{settledOpen ? "−" : "+"}</span>
            </button>
            {settledOpen && (
              <SectionCard
                title="Settled history"
                pageData={settled.data}
                isLoading={settled.isLoading}
                isError={settled.isError}
                onRetry={() => void settled.refetch()}
                onPageChange={setSettledPage}
                emptyMessage={search ? "No matching settled debts." : "No settled debts yet."}
              >
                {renderRows(settled.data?.items ?? [])}
              </SectionCard>
            )}
          </section>
        </div>
      </div>

      {/* Add sheet */}
      <AddDebtSheet
        isOpen={addSheet.open}
        onClose={() => setAddSheet((s) => ({ ...s, open: false }))}
        onCreated={() => setNotice("Debt added.")}
        defaultType={addSheet.defaultType}
        persons={persons}
      />

      {/* Settle sheet */}
      <SettleSheet
        isOpen={!!settleDebt}
        onClose={() => setSettleDebt(null)}
        onRecorded={() => setNotice("Payment recorded.")}
        debt={settleDebt}
      />
      <DebtDetailSheet
        debt={detailDebt}
        onClose={() => setDetailDebt(null)}
        onUpdated={setDetailDebt}
        onSaved={() => setNotice("Debt details saved.")}
        onDelete={() => {
          if (detailDebt) handleDelete(detailDebt);
        }}
        isDeleting={deleteDebt.isPending}
        deleteError={deleteDebt.isError}
      />
    </>
  );
}

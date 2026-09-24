"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const focusableSelector =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
  if (!isOpen) return null;
  return <OpenBottomSheet onClose={onClose} title={title}>{children}</OpenBottomSheet>;
}

function OpenBottomSheet({ onClose, title, children }: Omit<BottomSheetProps, "isOpen">) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const keepEditingRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const isDirtyRef = useRef(false);
  const [showDiscardPrompt, setShowDiscardPrompt] = useState(false);

  const keepEditing = useCallback(() => {
    setShowDiscardPrompt(false);
    previousFocusRef.current?.focus();
  }, []);

  const requestClose = useCallback(() => {
    if (showDiscardPrompt) {
      keepEditing();
    } else if (isDirtyRef.current) {
      previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setShowDiscardPrompt(true);
    } else {
      onClose();
    }
  }, [keepEditing, onClose, showDiscardPrompt]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, []);

  useEffect(() => {
    if (showDiscardPrompt) keepEditingRef.current?.focus();
  }, [showDiscardPrompt]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        requestClose();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(focusableSelector))
        .filter((element) => element.getClientRects().length > 0);
      if (focusable.length === 0) {
        event.preventDefault();
        dialogRef.current.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const focusIsOutside = !dialogRef.current.contains(document.activeElement);
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current || focusIsOutside)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialogRef.current || focusIsOutside)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [requestClose]);

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col justify-end md:items-center md:justify-center"
      style={{ background: "rgba(0, 0, 0, 0.4)" }}
      onClick={(event) => {
        if (event.target === event.currentTarget) requestClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="w-full overflow-y-auto rounded-t-[var(--radius-xl)] md:max-w-[480px] md:rounded-[var(--radius-xl)]"
        style={{
          background: "var(--color-bg-elevated)",
          maxHeight: "90dvh",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <header
          className="sticky top-0 z-10 flex items-center justify-between border-b"
          style={{
            padding: "var(--space-3) var(--space-5)",
            background: "var(--color-bg-elevated)",
            borderColor: "var(--color-border)",
          }}
        >
          <h2 id={titleId} style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "var(--color-text-primary)" }}>
            {title}
          </h2>
          <button
            type="button"
            onClick={requestClose}
            aria-label={`Close ${title}`}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-md"
            style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--color-text-secondary)", fontSize: "var(--text-lg)" }}
          >
            ✕
          </button>
        </header>

        <div style={{ padding: "var(--space-5)" }}>
          {showDiscardPrompt && (
            <div role="alert" style={{ padding: "var(--space-4)", marginBottom: "var(--space-4)", border: "1px solid var(--color-border-strong)", borderRadius: "var(--radius-md)", background: "var(--color-bg-subtle)" }}>
              <p style={{ fontWeight: "var(--weight-semibold)", color: "var(--color-text-primary)" }}>Discard your changes?</p>
              <p style={{ marginTop: "var(--space-1)", color: "var(--color-text-secondary)" }}>Your unsaved entries will be lost.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button ref={keepEditingRef} type="button" onClick={keepEditing} className="min-h-11 rounded-md px-4" style={{ background: "var(--color-accent)", color: "var(--color-accent-fg)" }}>
                  Keep editing
                </button>
                <button type="button" onClick={onClose} className="min-h-11 rounded-md px-4" style={{ border: "1px solid var(--color-border-strong)", color: "var(--color-text-primary)" }}>
                  Discard changes
                </button>
              </div>
            </div>
          )}
          <div
            onInputCapture={() => { isDirtyRef.current = true; }}
            onChangeCapture={() => { isDirtyRef.current = true; }}
            onClickCapture={(event) => {
              if (event.target instanceof Element && event.target.closest('button[type="button"]')) {
                isDirtyRef.current = true;
              }
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect } from "react";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
  // Prevent background scroll while sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    // Backdrop
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[200] flex flex-col justify-end md:justify-center md:items-center"
      style={{ background: "rgba(0, 0, 0, 0.4)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Sheet / Dialog */}
      <div
        className="w-full md:max-w-[480px]"
        style={{
          background: "var(--color-bg-elevated)",
          borderRadius: "var(--radius-xl) var(--radius-xl) 0 0",
          maxHeight: "90vh",
          overflowY: "auto",
          paddingBottom: "calc(var(--space-5) + env(safe-area-inset-bottom))",
        }}
        // Prevent clicks inside the sheet from closing it
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle — visible on mobile only */}
        <div
          className="md:hidden"
          style={{
            width: 36,
            height: 4,
            borderRadius: 2,
            background: "var(--color-border-strong)",
            margin: "var(--space-3) auto var(--space-1)",
          }}
        />

        {/* Desktop header with title + close button */}
        <div
          className="hidden md:flex"
          style={{
            alignItems: "center",
            justifyContent: "space-between",
            padding: "var(--space-5) var(--space-5) 0",
          }}
        >
          <p
            style={{
              fontSize: "var(--text-lg)",
              fontWeight: "var(--weight-semibold)",
              color: "var(--color-text-primary)",
            }}
          >
            {title}
          </p>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              minWidth: 44,
              minHeight: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "var(--color-text-secondary)",
              fontSize: "var(--text-lg)",
            }}
          >
            ✕
          </button>
        </div>

        {/* Sheet content */}
        <div style={{ padding: "var(--space-5)" }}>
          {children}

          {/* Full-width cancel — mobile only */}
          <button
            className="md:hidden"
            onClick={onClose}
            style={{
              width: "100%",
              minHeight: 44,
              marginTop: "var(--space-4)",
              background: "transparent",
              border: "0.5px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              fontSize: "var(--text-base)",
              color: "var(--color-text-secondary)",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BottomSheet } from "@/src/components/ui/BottomSheet";
import { walletSchema } from "@/src/lib/validations/settings";
import { walletService } from "@/src/lib/api/services/wallets";
import { WALLET_KEYS } from "@/src/lib/api/keys";
import { MOCK_USER_ID } from "@/src/lib/mock/mock-user";
import type { Wallet } from "@/src/types";

interface WalletSheetProps {
  isOpen: boolean;
  onClose: () => void;
  wallet?: Wallet; // undefined = add mode
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

export function WalletSheet({ isOpen, onClose, wallet }: WalletSheetProps) {
  const queryClient = useQueryClient();
  const isEdit = !!wallet;

  const [name, setName] = useState("");
  const [balance, setBalance] = useState("0");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setName(wallet?.name ?? "");
      setBalance(wallet ? String(wallet.balance) : "0");
      setErrors({});
    }
  }, [isOpen, wallet]);

  const mutation = useMutation({
    mutationFn: (data: { name: string; balance: number }) =>
      wallet
        ? walletService.update(wallet.id, { name: data.name })
        : walletService.create({ name: data.name, balance: data.balance, user_id: MOCK_USER_ID }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WALLET_KEYS.all });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = walletSchema.safeParse({
      name,
      balance: balance !== "" ? parseFloat(balance) : NaN,
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
    mutation.mutate(result.data);
  };

  const borderFor = (field: string): React.CSSProperties => ({
    ...inputStyle,
    border: `0.5px solid ${errors[field] ? "var(--color-negative)" : "var(--color-border)"}`,
  });

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit wallet" : "Add wallet"}
    >
      <form
        onSubmit={handleSubmit}
        noValidate
        style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}
      >
        <Field label="Wallet name" error={errors.name}>
          <input
            type="text"
            autoComplete="off"
            placeholder="e.g. BCA, Cash, GoPay"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={borderFor("name")}
          />
        </Field>

        {/* Balance only shown when creating a new wallet */}
        {!isEdit && (
          <Field label="Initial balance (Rp)" error={errors.balance}>
            <input
              type="number"
              inputMode="decimal"
              autoComplete="off"
              placeholder="0"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              style={borderFor("balance")}
            />
          </Field>
        )}

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
          {mutation.isPending ? "Saving…" : isEdit ? "Save changes" : "Add wallet"}
        </button>
      </form>
    </BottomSheet>
  );
}

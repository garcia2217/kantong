"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BottomSheet } from "@/src/components/ui/BottomSheet";
import { AmountInput } from "@/src/components/ui/AmountInput";
import { Field, inputBaseStyle } from "@/src/components/ui/Field";
import { SheetSubmitButton } from "@/src/components/ui/SheetSubmitButton";
import { walletSchema } from "@/src/lib/validations/settings";
import { walletService } from "@/src/lib/api/services/wallets";
import { WALLET_KEYS } from "@/src/lib/api/keys";
import { parseZodErrors } from "@/src/lib/utils/form";
import type { Wallet } from "@/src/types";

interface WalletSheetProps {
  isOpen: boolean;
  onClose: () => void;
  wallet?: Wallet;
}

export function WalletSheet({ isOpen, onClose, wallet }: WalletSheetProps) {
  if (!isOpen) return null;
  return <OpenWalletSheet key={wallet?.id ?? "new"} onClose={onClose} wallet={wallet} />;
}

function OpenWalletSheet({ onClose, wallet }: Omit<WalletSheetProps, "isOpen">) {
  const queryClient = useQueryClient();
  const isEdit = !!wallet;

  const [name, setName] = useState(wallet?.name ?? "");
  const [balance, setBalance] = useState(wallet ? String(wallet.balance) : "0");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: (data: { name: string; balance: number }) =>
      wallet
        ? walletService.update(wallet.id, { name: data.name })
        : walletService.create({ name: data.name, balance: data.balance }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: WALLET_KEYS.all });
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
      setErrors(parseZodErrors(result.error));
      return;
    }
    setErrors({});
    mutation.mutate(result.data);
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

  return (
    <BottomSheet
      isOpen
      onClose={onClose}
      title={isEdit ? "Edit wallet" : "Add wallet"}
    >
      <form
        onSubmit={handleSubmit}
        noValidate
        style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}
      >
        <Field label="Wallet name" htmlFor="wallet-name" error={errors.name}>
          <input
            id="wallet-name"
            type="text"
            autoComplete="off"
            placeholder="e.g. BCA, Cash, GoPay"
            maxLength={100}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              clearError("name");
            }}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "wallet-name-error" : undefined}
            style={borderFor("name")}
          />
        </Field>

        {!isEdit && (
          <Field label="Initial balance (Rp)" htmlFor="wallet-balance" error={errors.balance}>
            <AmountInput
              id="wallet-balance"
              value={balance}
              ariaInvalid={!!errors.balance}
              ariaDescribedBy={errors.balance ? "wallet-balance-error" : undefined}
              onChange={(value) => {
                setBalance(value);
                clearError("balance");
              }}
              style={borderFor("balance")}
            />
          </Field>
        )}

        {mutation.isError && (
          <p role="alert" style={{ fontSize: "var(--text-sm)", color: "var(--color-negative)" }}>
            Could not save the wallet. Try again.
          </p>
        )}

        <SheetSubmitButton
          isPending={mutation.isPending}
          label={isEdit ? "Save changes" : "Add wallet"}
          pendingLabel="Saving…"
        />
      </form>
    </BottomSheet>
  );
}

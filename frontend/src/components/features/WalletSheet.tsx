"use client";

import { useEffect, useState } from "react";
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
        : walletService.create({ name: data.name, balance: data.balance }),
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
        <Field label="Wallet name" htmlFor="wallet-name" error={errors.name}>
          <input
            id="wallet-name"
            type="text"
            autoComplete="off"
            placeholder="e.g. BCA, Cash, GoPay"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={borderFor("name")}
          />
        </Field>

        {!isEdit && (
          <Field label="Initial balance (Rp)" htmlFor="wallet-balance" error={errors.balance}>
            <AmountInput
              id="wallet-balance"
              value={balance}
              onChange={setBalance}
              style={borderFor("balance")}
            />
          </Field>
        )}

        {mutation.isError && (
          <p style={{ fontSize: "var(--text-sm)", color: "var(--color-negative)" }}>
            Something went wrong. Please try again.
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

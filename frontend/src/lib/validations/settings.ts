import { z } from "zod";

export const walletSchema = z.object({
  name: z.string().min(1, "Wallet name is required").max(100),
  balance: z
    .number({ error: "Enter a valid amount" })
    .min(0, "Balance cannot be negative"),
});

export type WalletFormValues = z.infer<typeof walletSchema>;

export const categorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(100),
  type: z.enum(["income", "expense"] as const),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

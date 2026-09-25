import { z } from "zod";

export const walletSchema = z.object({
  name: z.string().trim().min(1, "Enter a wallet name").max(100, "Name must be 100 characters or fewer"),
  balance: z
    .number({ error: "Enter a valid amount" })
    .min(0, "Balance cannot be negative"),
});

export type WalletFormValues = z.infer<typeof walletSchema>;

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Enter a category name").max(100, "Name must be 100 characters or fewer"),
  type: z.enum(["income", "expense"] as const),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

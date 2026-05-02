import { z } from "zod";

export const transactionSchema = z
  .object({
    type: z.enum(["income", "expense", "transfer"]),
    amount: z
      .number({ error: "Enter a valid amount" })
      .positive("Amount must be greater than 0"),
    description: z.string().min(1, "Description is required"),
    wallet_id: z.string().min(1, "Please select a wallet"),
    category_id: z.string().optional(),
    destination_wallet_id: z.string().optional(),
    transaction_date: z.string().min(1, "Date is required"),
  })
  .superRefine((data, ctx) => {
    if (data.type !== "transfer" && !data.category_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please select a category",
        path: ["category_id"],
      });
    }
    if (data.type === "transfer") {
      if (!data.destination_wallet_id) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please select a destination wallet",
          path: ["destination_wallet_id"],
        });
      } else if (data.destination_wallet_id === data.wallet_id) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Destination must differ from source wallet",
          path: ["destination_wallet_id"],
        });
      }
    }
  });

export type TransactionFormValues = z.infer<typeof transactionSchema>;

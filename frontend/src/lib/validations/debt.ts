import { z } from "zod";

export const debtSchema = z.object({
  person_id: z.string().min(1, "Select or enter a person"),
  new_person_name: z.string().optional(),
  type: z.enum(["receivable", "payable"] as const),
  amount: z
    .number({ invalid_type_error: "Enter a valid amount" })
    .positive("Amount must be greater than 0"),
  description: z.string().optional(),
  due_date: z.string().optional(),
});

export type DebtFormValues = z.infer<typeof debtSchema>;

/** Schema for recording a partial or full settlement against an existing debt. */
export const settleSchema = z.object({
  amount_settled: z
    .number({ invalid_type_error: "Enter a valid amount" })
    .positive("Settlement amount must be greater than 0"),
});

export type SettleFormValues = z.infer<typeof settleSchema>;

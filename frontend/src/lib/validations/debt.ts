import { z } from "zod";

export const debtSchema = z.object({
  person_id: z.string().min(1, "Select a person"),
  new_person_name: z.string().trim().max(100, "Name must be 100 characters or fewer"),
  type: z.enum(["receivable", "payable"] as const),
  amount: z
    .number({ error: "Enter a valid amount" })
    .positive("Amount must be greater than 0"),
  description: z.string().max(500, "Description must be 500 characters or fewer"),
  due_date: z.string().optional(),
}).superRefine((values, context) => {
  if (values.person_id === "__new__" && !values.new_person_name) {
    context.addIssue({
      code: "custom",
      path: ["new_person_name"],
      message: "Enter the person's name",
    });
  }
});

export type DebtFormValues = z.infer<typeof debtSchema>;

/** Schema for recording a partial or full settlement against an existing debt. */
export const settleSchema = z.object({
  amount_settled: z
    .number({ error: "Enter a valid amount" })
    .positive("Settlement amount must be greater than 0"),
});

export type SettleFormValues = z.infer<typeof settleSchema>;

export const debtDetailsSchema = z.object({
  description: z.string().max(500, "Description must be 500 characters or fewer"),
  due_date: z.string(),
});

import { z } from "zod";

export const budgetSchema = z.object({
  category_id: z.string().min(1, "Please select a category"),
  amount: z
    .number({ error: "Enter a valid amount" })
    .positive("Amount must be greater than 0"),
});

export type BudgetFormValues = z.infer<typeof budgetSchema>;

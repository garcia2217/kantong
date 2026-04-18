import type { Budget, BudgetCreate, BudgetUpdate } from "@/src/types";
import { apiClient } from "@/src/lib/api/client";

export const budgetService = {
  getForMonth: async (year: number, month: number): Promise<Budget[]> => {
    const { data } = await apiClient.get<Budget[]>("/budgets/effective", { params: { year, month } });
    return data;
  },

  create: async (payload: BudgetCreate): Promise<Budget> => {
    const { data } = await apiClient.post<Budget>("/budgets", payload);
    return data;
  },

  update: async (id: string, payload: BudgetUpdate): Promise<Budget> => {
    const { data } = await apiClient.patch<Budget>(`/budgets/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/budgets/${id}`);
  },
};

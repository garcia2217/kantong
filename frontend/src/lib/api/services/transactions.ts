import type { Transaction, TransactionCreate, TransactionUpdate } from "@/src/types";
import { mockTransactions } from "@/src/lib/mock/mock-transactions";
import { apiClient } from "@/src/lib/api/client";

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const store: Transaction[] = [...mockTransactions];

export const transactionService = {
  getAll: async (): Promise<Transaction[]> => {
    const { data } = await apiClient.get<Transaction[]>("/transactions");
    return data;
  },

  getByWallet: async (walletId: string): Promise<Transaction[]> => {
    await delay(300);
    return store
      .filter((t) => t.wallet_id === walletId || t.destination_wallet_id === walletId)
      .sort(
        (a, b) =>
          new Date(b.transaction_date).getTime() -
          new Date(a.transaction_date).getTime(),
      )
      .map((t) => ({ ...t }));
  },

  getByMonth: async (year: number, month: number): Promise<Transaction[]> => {
    const { data } = await apiClient.get<Transaction[]>("/transactions", { params: { year, month } });
    return data;
  },

  getRecent: async (limit: number): Promise<Transaction[]> => {
    const { data } = await apiClient.get<Transaction[]>("/transactions/recent", {
      params: { limit },
    });
    return data;
  },

  create: async (payload: TransactionCreate): Promise<Transaction> => {
    const { data } = await apiClient.post<Transaction>("/transactions", payload);
    return data;
  },

  update: async (id: string, payload: TransactionUpdate): Promise<Transaction> => {
    const { data } = await apiClient.patch<Transaction>(`/transactions/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/transactions/${id}`);
  },

  getMonthlySummary: async (
    year: number,
    month: number,
  ): Promise<{ totalIncome: number; totalExpense: number }> => {
    const { data } = await apiClient.get<{ totalIncome: number; totalExpense: number }>(
      "/transactions/summary",
      { params: { year, month } },
    );
    return data;
  },
};

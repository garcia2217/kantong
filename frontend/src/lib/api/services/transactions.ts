import type { Transaction, TransactionCreate, TransactionUpdate } from "@/src/types";
import { mockTransactions } from "@/src/lib/mock/mock-transactions";
import { apiClient } from "@/src/lib/api/client";

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

let store: Transaction[] = [...mockTransactions];

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
    await delay(300);
    return [...store]
      .sort(
        (a, b) =>
          new Date(b.transaction_date).getTime() -
          new Date(a.transaction_date).getTime(),
      )
      .slice(0, limit)
      .map((t) => ({ ...t }));
  },

  create: async (payload: TransactionCreate): Promise<Transaction> => {
    const { data } = await apiClient.post<Transaction>("/transactions", payload);
    return data;
  },

  update: async (id: string, payload: TransactionUpdate): Promise<Transaction> => {
    await delay(400);
    const idx = store.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error(`Transaction ${id} not found`);
    const updated: Transaction = { ...store[idx], ...payload };
    store = store.map((t) => (t.id === id ? updated : t));
    return { ...updated };
  },

  delete: async (id: string): Promise<void> => {
    await delay(400);
    if (!store.find((t) => t.id === id)) throw new Error(`Transaction ${id} not found`);
    store = store.filter((t) => t.id !== id);
  },

  /** Returns total income and total expense for a given month. */
  getMonthlySummary: async (
    year: number,
    month: number,
  ): Promise<{ totalIncome: number; totalExpense: number }> => {
    await delay(300);
    const txs = store.filter((t) => {
      const d = new Date(t.transaction_date);
      return d.getFullYear() === year && d.getMonth() + 1 === month;
    });
    const totalIncome = txs
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = txs
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    return { totalIncome, totalExpense };
  },
};

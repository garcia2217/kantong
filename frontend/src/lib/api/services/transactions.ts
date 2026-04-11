import type { Transaction, TransactionCreate, TransactionUpdate } from "@/src/types";
import { mockTransactions } from "@/src/lib/mock/mock-transactions";
import { MOCK_USER_ID } from "@/src/lib/mock/mock-user";

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// ─── Migration reference ──────────────────────────────────────────────────────
// Replace each mock below with the corresponding apiClient call.
// The response interceptor unwraps the envelope — callers receive T directly.
//
//   getAll:           const { data } = await apiClient.get<Transaction[]>("/transactions");
//   getByWallet:      const { data } = await apiClient.get<Transaction[]>("/transactions", { params: { wallet_id } });
//   getByMonth:       const { data } = await apiClient.get<Transaction[]>("/transactions", { params: { year, month } });
//   getRecent:        const { data } = await apiClient.get<Transaction[]>("/transactions/recent", { params: { limit } });
//   create:           const { data } = await apiClient.post<Transaction>("/transactions", payload);
//   update:           const { data } = await apiClient.patch<Transaction>(`/transactions/${id}`, payload);
//   delete:           await apiClient.delete(`/transactions/${id}`);
//   getMonthlySummary: const { data } = await apiClient.get<{ totalIncome: number; totalExpense: number }>(
//                       "/transactions/summary", { params: { year, month } });
// ─────────────────────────────────────────────────────────────────────────────

let store: Transaction[] = [...mockTransactions];

export const transactionService = {
  getAll: async (): Promise<Transaction[]> => {
    await delay(350);
    return [...store].sort(
      (a, b) =>
        new Date(b.transaction_date).getTime() -
        new Date(a.transaction_date).getTime(),
    );
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
    await delay(300);
    return store
      .filter((t) => {
        const d = new Date(t.transaction_date);
        return d.getFullYear() === year && d.getMonth() + 1 === month;
      })
      .sort(
        (a, b) =>
          new Date(b.transaction_date).getTime() -
          new Date(a.transaction_date).getTime(),
      )
      .map((t) => ({ ...t }));
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
    await delay(450);
    const created: Transaction = {
      id: `tx-${Date.now()}`,
      user_id: MOCK_USER_ID,
      wallet_id: payload.wallet_id,
      category_id: payload.category_id ?? null,
      amount: payload.amount,
      type: payload.type,
      description: payload.description,
      destination_wallet_id: payload.destination_wallet_id ?? null,
      transaction_date: payload.transaction_date,
      created_at: new Date().toISOString(),
    };
    store = [created, ...store];
    return { ...created };
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

import type { Wallet, WalletCreate, WalletUpdate } from "@/src/types";
import { mockWallets } from "@/src/lib/mock/mock-data";
import { MOCK_USER_ID } from "@/src/lib/mock/mock-user";

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// ─── Migration reference ──────────────────────────────────────────────────────
// Replace each mock below with the corresponding apiClient call.
// The response interceptor unwraps the envelope — callers receive T directly.
//
//   getAll:         const { data } = await apiClient.get<Wallet[]>("/wallets");
//   getById:        const { data } = await apiClient.get<Wallet>(`/wallets/${id}`);
//   create:         const { data } = await apiClient.post<Wallet>("/wallets", payload);
//   update:         const { data } = await apiClient.patch<Wallet>(`/wallets/${id}`, payload);
//   delete:         await apiClient.delete(`/wallets/${id}`);
//
// Note: adjustBalance is not a separate backend call — wallet balances are updated
// automatically when a transaction is created. Remove this method when migrating.
// ─────────────────────────────────────────────────────────────────────────────

// Mutable in-memory store — mirrors the real API behaviour during development
let store: Wallet[] = [...mockWallets];

export const walletService = {
  getAll: async (): Promise<Wallet[]> => {
    await delay(300);
    return [...store];
  },

  getById: async (id: string): Promise<Wallet> => {
    await delay(200);
    const wallet = store.find((w) => w.id === id);
    if (!wallet) throw new Error(`Wallet ${id} not found`);
    return { ...wallet };
  },

  create: async (payload: WalletCreate): Promise<Wallet> => {
    await delay(400);
    const created: Wallet = {
      id: `wallet-${Date.now()}`,
      user_id: MOCK_USER_ID,
      name: payload.name,
      balance: payload.balance,
      created_at: new Date().toISOString(),
      updated_at: null,
    };
    store = [...store, created];
    return { ...created };
  },

  update: async (id: string, payload: WalletUpdate): Promise<Wallet> => {
    await delay(400);
    const idx = store.findIndex((w) => w.id === id);
    if (idx === -1) throw new Error(`Wallet ${id} not found`);
    const updated: Wallet = {
      ...store[idx],
      ...payload,
      updated_at: new Date().toISOString(),
    };
    store = store.map((w) => (w.id === id ? updated : w));
    return { ...updated };
  },

  delete: async (id: string): Promise<void> => {
    await delay(400);
    if (!store.find((w) => w.id === id)) throw new Error(`Wallet ${id} not found`);
    store = store.filter((w) => w.id !== id);
  },

  /** Adjusts the balance of a wallet by a signed delta (positive = credit, negative = debit). */
  adjustBalance: async (id: string, delta: number): Promise<Wallet> => {
    await delay(200);
    const idx = store.findIndex((w) => w.id === id);
    if (idx === -1) throw new Error(`Wallet ${id} not found`);
    const updated: Wallet = {
      ...store[idx],
      balance: store[idx].balance + delta,
      updated_at: new Date().toISOString(),
    };
    store = store.map((w) => (w.id === id ? updated : w));
    return { ...updated };
  },
};

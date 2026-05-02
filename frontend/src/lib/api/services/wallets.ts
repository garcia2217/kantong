import type { Wallet, WalletCreate, WalletUpdate } from "@/src/types";
// import { mockWallets } from "@/src/lib/mock/mock-data";
import { apiClient } from "@/src/lib/api/client";

// const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// let store: Wallet[] = [...mockWallets];

export const walletService = {
  getAll: async (): Promise<Wallet[]> => {
    const { data } = await apiClient.get<Wallet[]>("/wallets");
    return data;
  },

  // getById: async (id: string): Promise<Wallet> => {
  //   await delay(200);
  //   const wallet = store.find((w) => w.id === id);
  //   if (!wallet) throw new Error(`Wallet ${id} not found`);
  //   return { ...wallet };
  // },

  create: async (payload: WalletCreate): Promise<Wallet> => {
    const { data } = await apiClient.post<Wallet>("/wallets", {
      name: payload.name,
      balance: payload.balance,
    });
    return data;
  },

  update: async (id: string, payload: WalletUpdate): Promise<Wallet> => {
    const { data } = await apiClient.patch<Wallet>(`/wallets/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/wallets/${id}`);
  },
};

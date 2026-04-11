import { create } from "zustand";
import type { User } from "@/src/types";
import { apiClient } from "@/src/lib/api/client";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (username: string, password: string) => {
    set({ isLoading: true });
    try {
      const { data } = await apiClient.post<{ user: User }>("/auth/login", {
        username,
        password,
      });
      set({ user: data.user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    // Fire-and-forget — clear local state regardless of backend response
    apiClient.post("/auth/logout").catch(() => undefined);
    set({ user: null, isAuthenticated: false });
  },
}));

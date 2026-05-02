import { create } from "zustand";
import type { User } from "@/src/types";
import { apiClient } from "@/src/lib/api/client";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  checkAuth: () => Promise<void>;
  initiateOAuth: () => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,

  checkAuth: async () => {
    try {
      const { data } = await apiClient.get<{ user: User }>("/users/me");
      set({ user: data.user, isAuthenticated: true });
    } catch {
      set({ user: null, isAuthenticated: false });
    }
  },

  initiateOAuth: () => {
    window.location.href = `${process.env.NEXT_PUBLIC_FINANCIAL_TRACKER_API_BASE_URL}/auth/google/login`;
  },

  logout: async () => {
    // Fire-and-forget — clear local state regardless of backend response
    apiClient.post("/auth/logout").catch(() => undefined);
    set({ user: null, isAuthenticated: false });
  },
}));

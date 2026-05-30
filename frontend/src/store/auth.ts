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
    // Same-origin path so the whole OAuth flow goes through the /api/* proxy
    // and stays first-party (see next.config.ts / docs/MOBILE_AUTH_FIX.md).
    window.location.href = "/api/v1/auth/google/login";
  },

  logout: async () => {
    // Fire-and-forget — clear local state regardless of backend response
    apiClient.post("/auth/logout").catch(() => undefined);
    set({ user: null, isAuthenticated: false });
  },
}));

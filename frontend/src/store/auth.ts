import { create } from "zustand";
import type { User } from "@/src/types";
import { mockUser } from "@/src/lib/mock/mock-user";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (username: string, _password: string) => {
    set({ isLoading: true });
    // TODO: replace with real API call — POST /auth/login — once backend is ready
    await delay(800);
    set({
      user: { ...mockUser, username },
      isAuthenticated: true,
      isLoading: false,
    });
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
  },
}));

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

    // TODO: replace mock below with the real API call once backend is ready:
    //
    //   import { apiClient } from "@/src/lib/api/client";
    //
    //   const { data } = await apiClient.post<{ user: User }>("/auth/login", {
    //     username,
    //     password,
    //   });
    //   set({ user: data.user, isAuthenticated: true, isLoading: false });
    //
    // The interceptor in client.ts unwraps the envelope, so `data` is already
    // the inner object { user: User } — not the raw { status, meta, data } wrapper.
    // The httpOnly cookie is set by the backend via Set-Cookie; nothing to store here.
    // On failure the interceptor throws Error with a `.code` of "AUTH_UNAUTHORIZED".

    await delay(800);
    set({
      user: { ...mockUser, username },
      isAuthenticated: true,
      isLoading: false,
    });
  },

  logout: () => {
    // TODO: call the backend to clear the httpOnly cookie before wiping local state:
    //
    //   await apiClient.post("/auth/logout");
    //
    // Fire-and-forget is acceptable here — local state is cleared regardless.

    set({ user: null, isAuthenticated: false });
  },
}));

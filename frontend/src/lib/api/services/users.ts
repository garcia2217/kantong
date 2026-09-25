import { apiClient } from "@/src/lib/api/client";
import type { User } from "@/src/types";

export const userService = {
  getCurrentUser: async (): Promise<User> => {
    const { data } = await apiClient.get<{ user: User }>("/users/me");
    return data.user;
  },

  generateTelegramLinkCode: async (): Promise<{ code: string }> => {
    const { data } = await apiClient.post<{ code: string }>("/users/telegram-link");
    return data;
  },
};

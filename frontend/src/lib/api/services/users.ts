import { apiClient } from "@/src/lib/api/client";

export const userService = {
  generateTelegramLinkCode: async (): Promise<{ code: string }> => {
    const { data } = await apiClient.post<{ code: string }>("/users/telegram-link");
    return data;
  },
};

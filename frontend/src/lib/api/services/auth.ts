import { apiClient } from "@/src/lib/api/client";

export const authService = {
  exchangeOAuthCode: async (code: string): Promise<void> => {
    await apiClient.post("/auth/exchange", null, { params: { code } });
  },
};

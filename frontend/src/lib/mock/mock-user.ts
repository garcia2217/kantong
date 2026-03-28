import type { User } from "@/src/types";

export const MOCK_USER_ID = "550e8400-e29b-41d4-a716-446655440000";

export const mockUser: User = {
  id: MOCK_USER_ID,
  telegram_chat_id: null,
  username: "johndoe",
  telegram_state: "ACTIVE",
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
};

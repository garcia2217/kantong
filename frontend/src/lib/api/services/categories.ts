import type { Category, CategoryCreate, CategoryType, CategoryUpdate } from "@/src/types";
import { mockCategories } from "@/src/lib/mock/mock-data";
import { MOCK_USER_ID } from "@/src/lib/mock/mock-user";
import { apiClient } from "@/src/lib/api/client";

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

let store: Category[] = [...mockCategories];

export const categoryService = {
  getAll: async (): Promise<Category[]> => {
    const { data } = await apiClient.get<Category[]>("/categories");
    return data;
  },

  getByType: async (type: CategoryType): Promise<Category[]> => {
    await delay(200);
    return store.filter((c) => c.type === type).map((c) => ({ ...c }));
  },

  getById: async (id: string): Promise<Category> => {
    await delay(200);
    const cat = store.find((c) => c.id === id);
    if (!cat) throw new Error(`Category ${id} not found`);
    return { ...cat };
  },

  create: async (payload: CategoryCreate): Promise<Category> => {
    await delay(400);
    const created: Category = {
      id: `cat-${Date.now()}`,
      user_id: MOCK_USER_ID,
      name: payload.name,
      type: payload.type,
      created_at: new Date().toISOString(),
    };
    store = [...store, created];
    return { ...created };
  },

  update: async (id: string, payload: CategoryUpdate): Promise<Category> => {
    await delay(400);
    const idx = store.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error(`Category ${id} not found`);
    const updated: Category = { ...store[idx], ...payload };
    store = store.map((c) => (c.id === id ? updated : c));
    return { ...updated };
  },

  delete: async (id: string): Promise<void> => {
    await delay(400);
    if (!store.find((c) => c.id === id)) throw new Error(`Category ${id} not found`);
    store = store.filter((c) => c.id !== id);
  },
};

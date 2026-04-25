import type { Category, CategoryCreate, CategoryType, CategoryUpdate } from "@/src/types";
import { mockCategories } from "@/src/lib/mock/mock-data";
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
    const { data } = await apiClient.post<Category>("/categories", {
      name: payload.name,
      type: payload.type,
    });
    return data;
  },

  update: async (id: string, payload: CategoryUpdate): Promise<Category> => {
    const { data } = await apiClient.patch<Category>(`/categories/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/categories/${id}`);
  },
};

import type { Category, CategoryCreate, CategoryUpdate } from "@/src/types";
import { apiClient } from "@/src/lib/api/client";

export const categoryService = {
  getAll: async (): Promise<Category[]> => {
    const { data } = await apiClient.get<Category[]>("/categories");
    return data;
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

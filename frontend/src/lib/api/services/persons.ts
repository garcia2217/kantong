import type { Person, PersonCreate, PersonUpdate } from "@/src/types";
import { apiClient } from "@/src/lib/api/client";

export const personService = {
  getAll: async (): Promise<Person[]> => {
    const { data } = await apiClient.get<Person[]>("/persons");
    return data;
  },

  getById: async (id: string): Promise<Person> => {
    const { data } = await apiClient.get<Person>(`/persons/${id}`);
    return data;
  },

  create: async (payload: PersonCreate): Promise<Person> => {
    const { data } = await apiClient.post<Person>("/persons", payload);
    return data;
  },

  update: async (id: string, payload: PersonUpdate): Promise<Person> => {
    const { data } = await apiClient.patch<Person>(`/persons/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/persons/${id}`);
  },
};

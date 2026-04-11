import type { Person, PersonCreate, PersonUpdate } from "@/src/types";
import { mockPersons } from "@/src/lib/mock/mock-data";
import { MOCK_USER_ID } from "@/src/lib/mock/mock-user";

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// ─── Migration reference ──────────────────────────────────────────────────────
// Replace each mock below with the corresponding apiClient call.
// The response interceptor unwraps the envelope — callers receive T directly.
//
//   getAll:   const { data } = await apiClient.get<Person[]>("/persons");
//   getById:  const { data } = await apiClient.get<Person>(`/persons/${id}`);
//   create:   const { data } = await apiClient.post<Person>("/persons", payload);
//   update:   const { data } = await apiClient.patch<Person>(`/persons/${id}`, payload);
//   delete:   await apiClient.delete(`/persons/${id}`);
// ─────────────────────────────────────────────────────────────────────────────

let store: Person[] = [...mockPersons];

export const personService = {
  getAll: async (): Promise<Person[]> => {
    await delay(300);
    return [...store].sort((a, b) => a.name.localeCompare(b.name));
  },

  getById: async (id: string): Promise<Person> => {
    await delay(200);
    const person = store.find((p) => p.id === id);
    if (!person) throw new Error(`Person ${id} not found`);
    return { ...person };
  },

  create: async (payload: PersonCreate): Promise<Person> => {
    await delay(400);
    const created: Person = {
      id: `person-${Date.now()}`,
      user_id: MOCK_USER_ID,
      name: payload.name,
      created_at: new Date().toISOString(),
      updated_at: null,
    };
    store = [...store, created];
    return { ...created };
  },

  update: async (id: string, payload: PersonUpdate): Promise<Person> => {
    await delay(400);
    const idx = store.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error(`Person ${id} not found`);
    const updated: Person = {
      ...store[idx],
      ...payload,
      updated_at: new Date().toISOString(),
    };
    store = store.map((p) => (p.id === id ? updated : p));
    return { ...updated };
  },

  delete: async (id: string): Promise<void> => {
    await delay(400);
    if (!store.find((p) => p.id === id)) throw new Error(`Person ${id} not found`);
    store = store.filter((p) => p.id !== id);
  },
};

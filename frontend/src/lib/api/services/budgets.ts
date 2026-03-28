import type { Budget, BudgetCreate, BudgetUpdate } from "@/src/types";
import { mockBudgets } from "@/src/lib/mock/mock-data";
import { MOCK_USER_ID } from "@/src/lib/mock/mock-user";

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

let store: Budget[] = [...mockBudgets];

export const budgetService = {
  getAll: async (): Promise<Budget[]> => {
    await delay(300);
    return [...store];
  },

  getDefaults: async (): Promise<Budget[]> => {
    await delay(300);
    return store.filter((b) => b.is_default).map((b) => ({ ...b }));
  },

  /**
   * Returns the effective budget for a given month.
   * A monthly override takes precedence over the default template.
   * If no override exists for a category, the default is used.
   */
  getForMonth: async (year: number, month: number): Promise<Budget[]> => {
    await delay(300);
    const defaults = store.filter((b) => b.is_default);
    const overrides = store.filter(
      (b) => !b.is_default && b.year === year && b.month === month,
    );

    const overriddenCategoryIds = new Set(overrides.map((b) => b.category_id));

    const effective = [
      ...defaults.filter((b) => !overriddenCategoryIds.has(b.category_id)),
      ...overrides,
    ];

    return effective.map((b) => ({ ...b }));
  },

  create: async (payload: BudgetCreate): Promise<Budget> => {
    await delay(400);
    const created: Budget = {
      id: `budget-${Date.now()}`,
      user_id: MOCK_USER_ID,
      category_id: payload.category_id,
      amount: payload.amount,
      month: payload.month ?? null,
      year: payload.year ?? null,
      is_default: payload.is_default,
      created_at: new Date().toISOString(),
    };
    store = [...store, created];
    return { ...created };
  },

  update: async (id: string, payload: BudgetUpdate): Promise<Budget> => {
    await delay(400);
    const idx = store.findIndex((b) => b.id === id);
    if (idx === -1) throw new Error(`Budget ${id} not found`);
    const updated: Budget = { ...store[idx], ...payload };
    store = store.map((b) => (b.id === id ? updated : b));
    return { ...updated };
  },

  delete: async (id: string): Promise<void> => {
    await delay(400);
    if (!store.find((b) => b.id === id)) throw new Error(`Budget ${id} not found`);
    store = store.filter((b) => b.id !== id);
  },
};

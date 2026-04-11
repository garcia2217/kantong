import type { Debt, DebtCreate, DebtStatus, DebtType, DebtUpdate } from "@/src/types";
import { mockDebts } from "@/src/lib/mock/mock-data";
import { MOCK_USER_ID } from "@/src/lib/mock/mock-user";

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// ─── Migration reference ──────────────────────────────────────────────────────
// Replace each mock below with the corresponding apiClient call.
// The response interceptor unwraps the envelope — callers receive T directly.
//
//   getAll:         const { data } = await apiClient.get<Debt[]>("/debts");
//   getByType:      const { data } = await apiClient.get<Debt[]>("/debts", { params: { type } });
//   getByPerson:    const { data } = await apiClient.get<Debt[]>("/debts", { params: { person_id } });
//   create:         const { data } = await apiClient.post<Debt>("/debts", payload);
//   update:         const { data } = await apiClient.patch<Debt>(`/debts/${id}`, payload);
//   delete:         await apiClient.delete(`/debts/${id}`);
//   getNetPosition: const { data } = await apiClient.get<{ totalReceivable: number; totalPayable: number }>(
//                     "/debts/net-position");
// ─────────────────────────────────────────────────────────────────────────────

let store: Debt[] = [...mockDebts];

/** Derives the correct status from settled vs total amounts. */
const deriveStatus = (amount: number, amountSettled: number): DebtStatus => {
  if (amountSettled <= 0) return "pending";
  if (amountSettled >= amount) return "settled";
  return "partial";
};

export const debtService = {
  getAll: async (): Promise<Debt[]> => {
    await delay(300);
    return [...store].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  },

  getByType: async (type: DebtType): Promise<Debt[]> => {
    await delay(300);
    return store
      .filter((d) => d.type === type)
      .sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
      .map((d) => ({ ...d }));
  },

  getByPerson: async (personId: string): Promise<Debt[]> => {
    await delay(200);
    return store.filter((d) => d.person_id === personId).map((d) => ({ ...d }));
  },

  create: async (payload: DebtCreate): Promise<Debt> => {
    await delay(450);
    const created: Debt = {
      id: `debt-${Date.now()}`,
      user_id: MOCK_USER_ID,
      person_id: payload.person_id,
      amount: payload.amount,
      amount_settled: 0,
      type: payload.type,
      status: "pending",
      description: payload.description ?? null,
      due_date: payload.due_date ?? null,
      created_at: new Date().toISOString(),
      updated_at: null,
    };
    store = [created, ...store];
    return { ...created };
  },

  update: async (id: string, payload: DebtUpdate): Promise<Debt> => {
    await delay(400);
    const idx = store.findIndex((d) => d.id === id);
    if (idx === -1) throw new Error(`Debt ${id} not found`);

    const current = store[idx];
    const amountSettled = payload.amount_settled ?? current.amount_settled;

    // Auto-derive status from settled amount unless explicitly provided
    const status =
      payload.status ?? deriveStatus(current.amount, amountSettled);

    const updated: Debt = {
      ...current,
      ...payload,
      amount_settled: amountSettled,
      status,
      updated_at: new Date().toISOString(),
    };
    store = store.map((d) => (d.id === id ? updated : d));
    return { ...updated };
  },

  delete: async (id: string): Promise<void> => {
    await delay(400);
    if (!store.find((d) => d.id === id)) throw new Error(`Debt ${id} not found`);
    store = store.filter((d) => d.id !== id);
  },

  /**
   * Returns net position summary: total outstanding receivables and payables.
   * Only includes debts that are not fully settled.
   */
  getNetPosition: async (): Promise<{
    totalReceivable: number;
    totalPayable: number;
  }> => {
    await delay(200);
    const active = store.filter((d) => d.status !== "settled");
    const totalReceivable = active
      .filter((d) => d.type === "receivable")
      .reduce((sum, d) => sum + (d.amount - d.amount_settled), 0);
    const totalPayable = active
      .filter((d) => d.type === "payable")
      .reduce((sum, d) => sum + (d.amount - d.amount_settled), 0);
    return { totalReceivable, totalPayable };
  },
};

import type {
  Debt,
  DebtBrowsePage,
  DebtCreate,
  DebtDetailsUpdate,
  DebtType,
  DebtUpdate,
} from "@/src/types";
import { apiClient } from "@/src/lib/api/client";

export const debtService = {
  getAll: async (): Promise<Debt[]> => {
    const { data } = await apiClient.get<Debt[]>("/debts");
    return data;
  },

  browse: async (params: {
    status: "active" | "settled";
    debtType?: DebtType;
    search: string;
    page: number;
  }): Promise<DebtBrowsePage> => {
    const { data } = await apiClient.get<DebtBrowsePage>("/debts/browse", {
      params: {
        status: params.status,
        debt_type: params.debtType,
        search: params.search,
        page: params.page,
      },
    });
    return data;
  },

  getByType: async (type: DebtType): Promise<Debt[]> => {
    const { data } = await apiClient.get<Debt[]>("/debts", { params: { type } });
    return data;
  },

  getByPerson: async (personId: string): Promise<Debt[]> => {
    const { data } = await apiClient.get<Debt[]>("/debts", { params: { person_id: personId } });
    return data;
  },

  create: async (payload: DebtCreate): Promise<Debt> => {
    const { data } = await apiClient.post<Debt>("/debts", payload);
    return data;
  },

  update: async (id: string, payload: DebtUpdate): Promise<Debt> => {
    const { data } = await apiClient.patch<Debt>(`/debts/${id}`, payload);
    return data;
  },

  updateDetails: async (id: string, payload: DebtDetailsUpdate): Promise<Debt> => {
    const { data } = await apiClient.patch<Debt>(`/debts/${id}/details`, payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/debts/${id}`);
  },

  getNetPosition: async (): Promise<{ totalReceivable: number; totalPayable: number }> => {
    const { data } = await apiClient.get<{ totalReceivable: number; totalPayable: number }>(
      "/debts/net-position",
    );
    return data;
  },
};

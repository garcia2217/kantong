// React Query key constants — one namespace per domain.
// Always import these instead of using inline string arrays to
// ensure consistent cache invalidation across the app.

export const WALLET_KEYS = {
  all: ["wallets"] as const,
  byId: (id: string) => ["wallets", id] as const,
};

export const CATEGORY_KEYS = {
  all: ["categories"] as const,
  byType: (type: "income" | "expense") => ["categories", type] as const,
};

export const TRANSACTION_KEYS = {
  all: ["transactions"] as const,
  byWallet: (walletId: string) => ["transactions", "wallet", walletId] as const,
  /** Full transaction list for a calendar month (array). */
  byMonth: (year: number, month: number) =>
    ["transactions", "month", year, month] as const,
  /** Aggregated income/expense totals for a month — NOT the same shape as byMonth. */
  monthlySummary: (year: number, month: number) =>
    ["transactions", "monthlySummary", year, month] as const,
  recent: (limit: number) => ["transactions", "recent", limit] as const,
};

export const BUDGET_KEYS = {
  all: ["budgets"] as const,
  defaults: ["budgets", "defaults"] as const,
  byMonth: (year: number, month: number) =>
    ["budgets", "month", year, month] as const,
};

export const PERSON_KEYS = {
  all: ["persons"] as const,
  byId: (id: string) => ["persons", id] as const,
};

export const DEBT_KEYS = {
  all: ["debts"] as const,
  /** Net position summary — NOT the same shape as `all` (object vs array). */
  netPosition: ["debts", "netPosition"] as const,
  byPerson: (personId: string) => ["debts", "person", personId] as const,
  byType: (type: "receivable" | "payable") => ["debts", type] as const,
};

export const USER_KEYS = {
  me: ["user", "me"] as const,
};

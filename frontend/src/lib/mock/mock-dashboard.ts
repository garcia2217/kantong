export type DashboardTrendDirection = "up" | "down" | "neutral";

export type DashboardAttentionTone = "warning" | "danger" | "info";

export interface DashboardCashFlowPoint {
  month: string;
  income: number;
  expenses: number;
}

export interface DashboardBalanceSummary {
  availableBalance: number;
  changePercentage: number;
  trend: DashboardTrendDirection;
  walletCount: number;
}

export interface DashboardBudgetSummary {
  spent: number;
  limit: number;
  remaining: number;
  percentageUsed: number;
}

export interface DashboardAttentionItem {
  id: string;
  title: string;
  description: string;
  tone: DashboardAttentionTone;
  href: string;
}

export interface DashboardCategorySpend {
  id: string;
  name: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface DashboardRecentTransaction {
  id: string;
  description: string;
  category: string;
  amount: number;
  type: "income" | "expense";
  occurredAt: string;
}

export interface DashboardMockData {
  userName: string;
  periodLabel: string;
  balance: DashboardBalanceSummary;
  cashFlow: DashboardCashFlowPoint[];
  budget: DashboardBudgetSummary;
  attentionItems: DashboardAttentionItem[];
  topCategories: DashboardCategorySpend[];
  recentTransactions: DashboardRecentTransaction[];
}

export const mockDashboardData: DashboardMockData = {
  userName: "Garcia",
  periodLabel: "September 2026",
  balance: {
    availableBalance: 9_720_000,
    changePercentage: 8.4,
    trend: "up",
    walletCount: 4,
  },
  cashFlow: [
    { month: "Apr", income: 10_800_000, expenses: 7_900_000 },
    { month: "May", income: 11_200_000, expenses: 8_600_000 },
    { month: "Jun", income: 10_600_000, expenses: 7_400_000 },
    { month: "Jul", income: 12_100_000, expenses: 9_100_000 },
    { month: "Aug", income: 11_500_000, expenses: 8_300_000 },
    { month: "Sep", income: 12_500_000, expenses: 8_100_000 },
  ],
  budget: {
    spent: 3_200_000,
    limit: 5_000_000,
    remaining: 1_800_000,
    percentageUsed: 64,
  },
  attentionItems: [
    {
      id: "attention-dining-budget",
      title: "Dining is close to its limit",
      description: "Rp 80,000 remains from this month's dining budget.",
      tone: "warning",
      href: "/budget",
    },
    {
      id: "attention-debt-due",
      title: "Payment to Mom is due soon",
      description: "Rp 2,000,000 is due in 3 days.",
      tone: "danger",
      href: "/debts",
    },
  ],
  topCategories: [
    {
      id: "category-food",
      name: "Food & Drink",
      amount: 1_200_000,
      percentage: 37.5,
      color: "var(--color-category-food)",
    },
    {
      id: "category-transport",
      name: "Transport",
      amount: 680_000,
      percentage: 21.25,
      color: "var(--color-category-transport)",
    },
    {
      id: "category-shopping",
      name: "Shopping",
      amount: 520_000,
      percentage: 16.25,
      color: "var(--color-category-shopping)",
    },
    {
      id: "category-other",
      name: "Other",
      amount: 800_000,
      percentage: 25,
      color: "#8A8881",
    },
  ],
  recentTransactions: [
    {
      id: "dashboard-transaction-001",
      description: "Lunch at Sederhana",
      category: "Food & Drink",
      amount: 85_000,
      type: "expense",
      occurredAt: "2026-09-22T12:35:00+07:00",
    },
    {
      id: "dashboard-transaction-002",
      description: "Monthly salary",
      category: "Salary",
      amount: 12_500_000,
      type: "income",
      occurredAt: "2026-09-22T09:00:00+07:00",
    },
    {
      id: "dashboard-transaction-003",
      description: "Ride home",
      category: "Transport",
      amount: 42_000,
      type: "expense",
      occurredAt: "2026-09-21T19:15:00+07:00",
    },
    {
      id: "dashboard-transaction-004",
      description: "Weekly groceries",
      category: "Groceries",
      amount: 326_500,
      type: "expense",
      occurredAt: "2026-09-21T16:40:00+07:00",
    },
  ],
};

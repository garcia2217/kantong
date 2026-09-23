import { useQueries, useQuery } from "@tanstack/react-query";
import { budgetService } from "@/src/lib/api/services/budgets";
import { categoryService } from "@/src/lib/api/services/categories";
import { debtService } from "@/src/lib/api/services/debts";
import { transactionService } from "@/src/lib/api/services/transactions";
import { walletService } from "@/src/lib/api/services/wallets";
import { BUDGET_KEYS, CATEGORY_KEYS, DEBT_KEYS, TRANSACTION_KEYS, WALLET_KEYS } from "@/src/lib/api/keys";
import { formatDueDate, formatIDRCompact, formatMonthYear } from "@/src/lib/utils/format";
import type { DashboardMockData, DashboardCategorySpend, DashboardAttentionItem } from "@/src/lib/mock/mock-dashboard";
import type { Transaction } from "@/src/types";

const categoryColors = [
  "var(--color-category-food)",
  "var(--color-category-transport)",
  "var(--color-category-shopping)",
];

const monthOffset = (date: Date, offset: number): { year: number; month: number; label: string } => {
  const month = new Date(date.getFullYear(), date.getMonth() + offset, 1);
  return {
    year: month.getFullYear(),
    month: month.getMonth() + 1,
    label: month.toLocaleDateString("en-ID", { month: "short" }),
  };
};

interface OverviewResult {
  data: DashboardMockData | null;
  isLoading: boolean;
  isError: boolean;
  hasBudget: boolean;
}

export function useOverviewData(userName: string): OverviewResult {
  const today = new Date();
  const months = Array.from({ length: 6 }, (_, index) => monthOffset(today, index - 5));
  const current = months[5];

  const wallets = useQuery({ queryKey: WALLET_KEYS.all, queryFn: walletService.getAll });
  const categories = useQuery({ queryKey: CATEGORY_KEYS.all, queryFn: categoryService.getAll });
  const budgets = useQuery({
    queryKey: BUDGET_KEYS.byMonth(current.year, current.month),
    queryFn: () => budgetService.getForMonth(current.year, current.month),
  });
  const transactions = useQuery({
    queryKey: TRANSACTION_KEYS.byMonth(current.year, current.month),
    queryFn: () => transactionService.getByMonth(current.year, current.month),
  });
  const recent = useQuery({
    queryKey: TRANSACTION_KEYS.recent(5),
    queryFn: () => transactionService.getRecent(5),
  });
  const debts = useQuery({ queryKey: DEBT_KEYS.all, queryFn: debtService.getAll });
  const summaries = useQueries({
    queries: months.map(({ year, month }) => ({
      queryKey: TRANSACTION_KEYS.monthlySummary(year, month),
      queryFn: () => transactionService.getMonthlySummary(year, month),
    })),
  });

  const allQueries = [wallets, categories, budgets, transactions, recent, debts, ...summaries];
  if (allQueries.some((query) => query.isPending)) {
    return { data: null, isLoading: true, isError: false, hasBudget: false };
  }
  if (allQueries.some((query) => query.isError)) {
    return { data: null, isLoading: false, isError: true, hasBudget: false };
  }

  const categoryNames = new Map(categories.data?.map((category) => [category.id, category.name]));
  const expenses = (transactions.data ?? []).filter((transaction) => transaction.type === "expense");
  const spendByCategory = new Map<string, number>();
  for (const transaction of expenses) {
    const key = transaction.category_id ?? "uncategorized";
    spendByCategory.set(key, (spendByCategory.get(key) ?? 0) + transaction.amount);
  }

  const totalExpense = summaries[5].data?.totalExpense ?? 0;
  const ranked = [...spendByCategory.entries()].sort((a, b) => b[1] - a[1]);
  const topCategories: DashboardCategorySpend[] = ranked.slice(0, 3).map(([id, amount], index) => ({
    id,
    name: categoryNames.get(id) ?? "Uncategorized",
    amount,
    percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
    color: categoryColors[index],
  }));
  const otherAmount = ranked.slice(3).reduce((sum, [, amount]) => sum + amount, 0);
  if (otherAmount > 0) {
    topCategories.push({
      id: "other",
      name: "Other",
      amount: otherAmount,
      percentage: totalExpense > 0 ? (otherAmount / totalExpense) * 100 : 0,
      color: "var(--color-text-tertiary)",
    });
  }

  const budgetedCategoryIds = new Set(budgets.data?.map((budget) => budget.category_id));
  const limit = (budgets.data ?? []).reduce((sum, budget) => sum + budget.amount, 0);
  const spent = expenses.reduce(
    (sum, transaction) => sum + (transaction.category_id && budgetedCategoryIds.has(transaction.category_id) ? transaction.amount : 0),
    0,
  );
  const attentionItems: DashboardAttentionItem[] = [];
  for (const budget of budgets.data ?? []) {
    const categorySpent = spendByCategory.get(budget.category_id) ?? 0;
    if (budget.amount > 0 && categorySpent / budget.amount >= 0.8) {
      const remaining = budget.amount - categorySpent;
      attentionItems.push({
        id: `budget-${budget.id}`,
        title: `${categoryNames.get(budget.category_id) ?? "Category"} budget ${remaining < 0 ? "exceeded" : "nearly used"}`,
        description: remaining < 0 ? `${formatIDRCompact(-remaining)} over the limit.` : `${formatIDRCompact(remaining)} remaining this month.`,
        tone: remaining < 0 ? "danger" : "warning",
        href: "/budget",
      });
    }
  }
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  for (const debt of debts.data ?? []) {
    if (!debt.due_date || debt.status === "settled") continue;
    const daysUntilDue = Math.ceil((new Date(debt.due_date).getTime() - todayStart) / 86_400_000);
    if (daysUntilDue > 7) continue;
    attentionItems.push({
      id: `debt-${debt.id}`,
      title: debt.type === "payable" ? "Payment due" : "Payment expected",
      description: `${formatIDRCompact(debt.amount - debt.amount_settled)} ${daysUntilDue < 0 ? "overdue" : `due ${formatDueDate(debt.due_date)}`}.`,
      tone: daysUntilDue < 0 ? "danger" : "warning",
      href: "/debts",
    });
  }

  const data: DashboardMockData = {
    userName,
    periodLabel: formatMonthYear(current.year, current.month),
    balance: {
      availableBalance: (wallets.data ?? []).reduce((sum, wallet) => sum + wallet.balance, 0),
      changePercentage: 0,
      trend: "neutral",
      walletCount: wallets.data?.length ?? 0,
    },
    cashFlow: months.map((month, index) => ({
      month: month.label,
      income: summaries[index].data?.totalIncome ?? 0,
      expenses: summaries[index].data?.totalExpense ?? 0,
    })),
    budget: {
      spent,
      limit,
      remaining: limit - spent,
      percentageUsed: limit > 0 ? Math.round((spent / limit) * 100) : 0,
    },
    attentionItems: attentionItems.slice(0, 4),
    topCategories,
    recentTransactions: (recent.data ?? []).map((transaction: Transaction) => ({
      id: transaction.id,
      description: transaction.description || (transaction.type === "transfer" ? "Transfer" : "Transaction"),
      category: transaction.type === "transfer" ? "Transfer" : categoryNames.get(transaction.category_id ?? "") ?? "Uncategorized",
      amount: transaction.amount,
      type: transaction.type,
      occurredAt: transaction.transaction_date,
    })),
  };

  return { data, isLoading: false, isError: false, hasBudget: limit > 0 };
}

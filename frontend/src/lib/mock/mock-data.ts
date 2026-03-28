import type { Budget, Category, Debt, Person, Wallet } from "@/src/types";
import { MOCK_USER_ID } from "./mock-user";

// ─── Wallets ──────────────────────────────────────────────────────────────────

export const mockWallets: Wallet[] = [
  {
    id: "wallet-001",
    user_id: MOCK_USER_ID,
    name: "BCA",
    balance: 8500000,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: null,
  },
  {
    id: "wallet-002",
    user_id: MOCK_USER_ID,
    name: "Cash",
    balance: 750000,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: null,
  },
  {
    id: "wallet-003",
    user_id: MOCK_USER_ID,
    name: "GoPay",
    balance: 320000,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: null,
  },
  {
    id: "wallet-004",
    user_id: MOCK_USER_ID,
    name: "Dana",
    balance: 150000,
    created_at: "2025-01-15T00:00:00Z",
    updated_at: null,
  },
];

// ─── Categories ───────────────────────────────────────────────────────────────

export const mockCategories: Category[] = [
  // Income
  {
    id: "cat-001",
    user_id: MOCK_USER_ID,
    name: "Salary",
    type: "income",
    created_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "cat-002",
    user_id: MOCK_USER_ID,
    name: "Freelance",
    type: "income",
    created_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "cat-003",
    user_id: MOCK_USER_ID,
    name: "Investment",
    type: "income",
    created_at: "2025-01-01T00:00:00Z",
  },
  // Expense
  {
    id: "cat-004",
    user_id: MOCK_USER_ID,
    name: "Food & Drink",
    type: "expense",
    created_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "cat-005",
    user_id: MOCK_USER_ID,
    name: "Transport",
    type: "expense",
    created_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "cat-006",
    user_id: MOCK_USER_ID,
    name: "Groceries",
    type: "expense",
    created_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "cat-007",
    user_id: MOCK_USER_ID,
    name: "Entertainment",
    type: "expense",
    created_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "cat-008",
    user_id: MOCK_USER_ID,
    name: "Health",
    type: "expense",
    created_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "cat-009",
    user_id: MOCK_USER_ID,
    name: "Shopping",
    type: "expense",
    created_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "cat-010",
    user_id: MOCK_USER_ID,
    name: "Bills & Utilities",
    type: "expense",
    created_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "cat-011",
    user_id: MOCK_USER_ID,
    name: "Subscriptions",
    type: "expense",
    created_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "cat-012",
    user_id: MOCK_USER_ID,
    name: "Gifts",
    type: "expense",
    created_at: "2025-01-01T00:00:00Z",
  },
];

// ─── Budgets ──────────────────────────────────────────────────────────────────

export const mockBudgets: Budget[] = [
  // Default (template) budgets
  {
    id: "budget-001",
    user_id: MOCK_USER_ID,
    category_id: "cat-004",
    amount: 1500000,
    month: null,
    year: null,
    is_default: true,
    created_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "budget-002",
    user_id: MOCK_USER_ID,
    category_id: "cat-005",
    amount: 600000,
    month: null,
    year: null,
    is_default: true,
    created_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "budget-003",
    user_id: MOCK_USER_ID,
    category_id: "cat-006",
    amount: 800000,
    month: null,
    year: null,
    is_default: true,
    created_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "budget-004",
    user_id: MOCK_USER_ID,
    category_id: "cat-007",
    amount: 500000,
    month: null,
    year: null,
    is_default: true,
    created_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "budget-005",
    user_id: MOCK_USER_ID,
    category_id: "cat-008",
    amount: 300000,
    month: null,
    year: null,
    is_default: true,
    created_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "budget-006",
    user_id: MOCK_USER_ID,
    category_id: "cat-009",
    amount: 700000,
    month: null,
    year: null,
    is_default: true,
    created_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "budget-007",
    user_id: MOCK_USER_ID,
    category_id: "cat-010",
    amount: 400000,
    month: null,
    year: null,
    is_default: true,
    created_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "budget-008",
    user_id: MOCK_USER_ID,
    category_id: "cat-011",
    amount: 200000,
    month: null,
    year: null,
    is_default: true,
    created_at: "2025-01-01T00:00:00Z",
  },
  // Monthly override — December gifts budget
  {
    id: "budget-009",
    user_id: MOCK_USER_ID,
    category_id: "cat-012",
    amount: 1000000,
    month: 12,
    year: 2025,
    is_default: false,
    created_at: "2025-11-01T00:00:00Z",
  },
];

// ─── Persons ──────────────────────────────────────────────────────────────────

export const mockPersons: Person[] = [
  {
    id: "person-001",
    user_id: MOCK_USER_ID,
    name: "Budi",
    created_at: "2025-02-01T00:00:00Z",
    updated_at: null,
  },
  {
    id: "person-002",
    user_id: MOCK_USER_ID,
    name: "Sari",
    created_at: "2025-02-15T00:00:00Z",
    updated_at: null,
  },
  {
    id: "person-003",
    user_id: MOCK_USER_ID,
    name: "Andi",
    created_at: "2025-03-01T00:00:00Z",
    updated_at: null,
  },
  {
    id: "person-004",
    user_id: MOCK_USER_ID,
    name: "Mom",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: null,
  },
];

// ─── Debts ────────────────────────────────────────────────────────────────────

export const mockDebts: Debt[] = [
  {
    id: "debt-001",
    user_id: MOCK_USER_ID,
    person_id: "person-001",
    amount: 500000,
    amount_settled: 0,
    type: "receivable",
    status: "pending",
    description: "Lunch split last month",
    due_date: "2026-04-30T00:00:00Z",
    created_at: "2026-03-01T00:00:00Z",
    updated_at: null,
  },
  {
    id: "debt-002",
    user_id: MOCK_USER_ID,
    person_id: "person-002",
    amount: 1200000,
    amount_settled: 600000,
    type: "receivable",
    status: "partial",
    description: "Concert ticket advance",
    due_date: "2026-05-01T00:00:00Z",
    created_at: "2026-02-20T00:00:00Z",
    updated_at: "2026-03-10T00:00:00Z",
  },
  {
    id: "debt-003",
    user_id: MOCK_USER_ID,
    person_id: "person-003",
    amount: 300000,
    amount_settled: 300000,
    type: "receivable",
    status: "settled",
    description: "Grab fare split",
    due_date: null,
    created_at: "2026-01-15T00:00:00Z",
    updated_at: "2026-02-01T00:00:00Z",
  },
  {
    id: "debt-004",
    user_id: MOCK_USER_ID,
    person_id: "person-004",
    amount: 2000000,
    amount_settled: 0,
    type: "payable",
    status: "pending",
    description: "Borrowed for new laptop accessories",
    due_date: "2026-06-01T00:00:00Z",
    created_at: "2026-03-05T00:00:00Z",
    updated_at: null,
  },
];

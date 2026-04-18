import type { CategoryType, DebtStatus, DebtType, TransactionType } from "./entities";

// ─── User Payloads ────────────────────────────────────────────────────────────

export interface UserCreate {
  telegram_chat_id?: number;
  username?: string;
  password: string;
  telegram_state: string;
}

export interface UserUpdate {
  username?: string;
  password?: string;
  telegram_state?: string;
}

// ─── Wallet Payloads ──────────────────────────────────────────────────────────

export interface WalletCreate {
  name: string;
  user_id: string;
  balance: number;
}

export interface WalletUpdate {
  name?: string;
  balance?: number;
}

// ─── Category Payloads ────────────────────────────────────────────────────────

export interface CategoryCreate {
  name: string;
  type: CategoryType;
  user_id: string;
}

export interface CategoryUpdate {
  name?: string;
  type?: CategoryType;
}

// ─── Transaction Payloads ─────────────────────────────────────────────────────

export interface TransactionCreate {
  amount: number;
  type: TransactionType;
  description: string;
  wallet_id: string;
  category_id?: string;
  destination_wallet_id?: string;
  transaction_date: string;
}

export interface TransactionUpdate {
  amount?: number;
  type?: TransactionType;
  description?: string;
  wallet_id?: string;
  category_id?: string | null;
  destination_wallet_id?: string | null;
  transaction_date?: string;
}

// ─── Budget Payloads ──────────────────────────────────────────────────────────

export interface BudgetCreate {
  category_id: string;
  amount: number;
  month?: number | null;
  year?: number | null;
  is_default: boolean;
}

export interface BudgetUpdate {
  amount?: number;
  month?: number | null;
  year?: number | null;
  is_default?: boolean;
}

// ─── Person Payloads ──────────────────────────────────────────────────────────

export interface PersonCreate {
  name: string;
  user_id: string;
}

export interface PersonUpdate {
  name?: string;
}

// ─── Debt Payloads ────────────────────────────────────────────────────────────

export interface DebtCreate {
  person_id: string;
  amount: number;
  type: DebtType;
  description?: string;
  due_date?: string;
  user_id: string;
}

export interface DebtUpdate {
  amount_settled?: number;
  status?: DebtStatus;
  description?: string;
  due_date?: string | null;
}

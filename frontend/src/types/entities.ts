// ─── Union Types ──────────────────────────────────────────────────────────────

export type CategoryType = "income" | "expense";

export type TransactionType = "income" | "expense" | "transfer";

export type DebtType = "receivable" | "payable";

export type DebtStatus = "pending" | "partial" | "settled";

// ─── Entity Interfaces ────────────────────────────────────────────────────────

export interface User {
  id: string;
  telegram_chat_id: number | null;
  username: string | null;
  telegram_state: string;
  created_at: string;
  updated_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  name: string;
  balance: number;
  created_at: string;
  updated_at: string | null;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: CategoryType;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  wallet_id: string;
  category_id: string | null;
  amount: number;
  type: TransactionType;
  description: string;
  destination_wallet_id: string | null;
  transaction_date: string;
  created_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  month: number | null;
  year: number | null;
  is_default: boolean;
  created_at: string;
}

export interface Person {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string | null;
}

export interface Debt {
  id: string;
  user_id: string;
  person_id: string;
  amount: number;
  amount_settled: number;
  type: DebtType;
  status: DebtStatus;
  description: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string | null;
}

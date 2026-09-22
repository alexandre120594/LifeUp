export type FinanceRecordType = "income" | "expense";
export type FinancialCommitmentRecurrence = "none" | "monthly";
export type FinancialCommitmentStatus = "active" | "completed" | "cancelled";

export interface FinancePeriod {
  month?: number;
  year: number;
}

export interface FinancialAccount {
  id: string;
  name: string;
  openingBalance: number;
  balance: number;
  isActive: boolean;
}

export interface FinancialCategory {
  id: string;
  name: string;
  type: FinanceRecordType;
  color?: string | null;
  isDefault: boolean;
}

export interface FinancialTransaction {
  id: string;
  title: string;
  amount: number;
  type: FinanceRecordType;
  date: string;
  notes?: string | null;
  accountId: string;
  account?: Pick<FinancialAccount, "id" | "name">;
  categoryId?: string | null;
  category?: FinancialCategory | null;
  commitmentId?: string | null;
  importId?: string | null;
}

export interface FinancialCommitment {
  id: string;
  title: string;
  amount: number;
  type: FinanceRecordType;
  dueDate: string;
  recurrence: FinancialCommitmentRecurrence;
  status: FinancialCommitmentStatus;
  notes?: string | null;
  accountId?: string | null;
  account?: Pick<FinancialAccount, "id" | "name"> | null;
  categoryId?: string | null;
  category?: FinancialCategory | null;
}

export interface FinancialGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string | null;
  status: "active" | "completed" | "archived" | "cancelled";
  progress: number;
}

export interface FinanceWorkspace {
  accounts: FinancialAccount[];
  categories: FinancialCategory[];
  transactions: FinancialTransaction[];
  commitments: FinancialCommitment[];
  goals: FinancialGoal[];
  summary: {
    balance: number;
    income: number;
    expenses: number;
    net: number;
  };
}

export interface FinancialAccountInput {
  name: string;
  openingBalance?: number;
}

export interface FinancialTransactionInput {
  title: string;
  amount: number;
  type: FinanceRecordType;
  date: string;
  accountId: string;
  categoryId?: string | null;
  notes?: string;
}

export interface FinancialCommitmentInput {
  title: string;
  amount: number;
  type: FinanceRecordType;
  dueDate: string;
  recurrence?: FinancialCommitmentRecurrence;
  accountId?: string | null;
  categoryId?: string | null;
  notes?: string;
}

export interface FinancialGoalInput {
  title: string;
  targetAmount: number;
  targetDate?: string | null;
  status?: FinancialGoal["status"];
}

export interface FinancialContributionInput {
  amount: number;
  date?: string;
  notes?: string;
}

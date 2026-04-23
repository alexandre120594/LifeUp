// src/types/index.ts

export interface Task {
  id: string;
  title?: string;
  completed?: boolean;
  date?: Date | string;
  projectId?: string;
  habitId?: string | null;
  dateFinish?: Date | string;
  time?: string;
  project?: Project;
  habit?: Habit | null;
}

export interface Habit {
  id: string;
  title: string;
  projectId: string;
  streak: number;
  history: string[];
  frequency: string;
  tasks?: Task[];
  project?: Project; 
}

export interface Project {
  id: string;
  title: string;  
  color: string;
  userId: number;
  lastActivityDate?: Date | string;
  streakGlobal?:number
  createdAt: Date | string;
  habits?: Habit[]; 
  tasks?: Task[]; 
}
export interface ProjectRequest {
  title: string;
  color: string | null;
  userId: number;
  createdAt: Date | string;
  lastActivityDate?: Date | string;
  streakGlobal?:number
  habits?: Habit[]; 
  tasks?: Task[]; 
}

export interface ProjectCreateInput {
  title?: string;
  color?: string;
}

export interface HabitCreateInput {
  title: string;
  projectId?: string;
}

export interface TaskCreateInput {
  title: string;
  projectId: string;
  habitId: string;
}

export type ProjectsResponse = Project[];

export type FinanceRecordType = "income" | "expense";

export interface FinancialCategory {
  id: string;
  name: string;
  type: FinanceRecordType;
  color?: string | null;
  icon?: string | null;
  isDefault: boolean;
}

export interface FinancialTransaction {
  id: string;
  title: string;
  amount: number | string;
  type: FinanceRecordType;
  date: Date | string;
  notes?: string | null;
  categoryId: string;
  category?: FinancialCategory;
}

export interface Budget {
  id: string;
  title: string;
  amount: number | string;
  month: string;
  categoryId: string;
  category?: FinancialCategory;
}

export interface RecurringBill {
  id: string;
  title: string;
  amount: number | string;
  dueDay: number;
  frequency: string;
  isActive: boolean;
  categoryId: string;
  category?: FinancialCategory;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number | string;
  currentAmount: number | string;
  targetDate?: Date | string | null;
  isCompleted: boolean;
}

export interface FinanceInsight {
  title: string;
  description: string;
  tone: "good" | "warning" | "neutral";
}

export interface FinanceSummary {
  month: string;
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  upcomingBillsTotal: number;
  savingsProgress: number;
  budgetUsedPercent: number;
  insights: FinanceInsight[];
}

export interface FinanceDashboardResponse {
  categories: FinancialCategory[];
  transactions: FinancialTransaction[];
  budgets: Budget[];
  recurringBills: RecurringBill[];
  savingsGoals: SavingsGoal[];
  summary: FinanceSummary;
}

export interface FinancialCategoryCreateInput {
  name: string;
  type: FinanceRecordType;
  color?: string;
}

export interface FinancialTransactionCreateInput {
  title: string;
  amount: number;
  type: FinanceRecordType;
  date: string;
  categoryId: string;
  notes?: string;
}

export interface BudgetCreateInput {
  title: string;
  amount: number;
  month: string;
  categoryId: string;
}

export interface RecurringBillCreateInput {
  title: string;
  amount: number;
  dueDay: number;
  categoryId: string;
}

export interface SavingsGoalCreateInput {
  title: string;
  targetAmount: number;
  currentAmount?: number;
  targetDate?: string;
}

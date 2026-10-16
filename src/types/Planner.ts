import type { FinancialAccount, FinancialCategory, FinancialCommitment } from "@/types/Finance";
import type { Goal } from "@/types/Goal";

export type PlannerTaskStatus = "pending" | "in_progress" | "done" | "cancelled";
export type PlannerTaskPriority = "low" | "medium" | "high";
export type PlannedPurchaseStatus = "idea" | "planned" | "bought" | "cancelled";
export type PlannedPurchaseNecessity = "need" | "want";

export interface PlannerTask {
  id: string;
  title: string;
  description?: string | null;
  dueDate?: string | null;
  priority: PlannerTaskPriority;
  status: PlannerTaskStatus;
  goalId?: string | null;
  goal?: Pick<Goal, "id" | "title" | "color"> | null;
  createdAt: string;
  updatedAt: string;
}

export interface PlannerTaskInput {
  title: string;
  description?: string | null;
  dueDate?: string | null;
  priority?: PlannerTaskPriority;
  status?: PlannerTaskStatus;
  goalId?: string | null;
}

export interface PlannedPurchase {
  id: string;
  title: string;
  description?: string | null;
  estimatedAmount?: number | null;
  plannedDate?: string | null;
  priority: PlannerTaskPriority;
  necessity: PlannedPurchaseNecessity;
  status: PlannedPurchaseStatus;
  goalId?: string | null;
  goal?: Pick<Goal, "id" | "title" | "color"> | null;
  financialCommitments: FinancialCommitment[];
  createdAt: string;
  updatedAt: string;
}

export interface PlannedPurchaseInput {
  title: string;
  description?: string | null;
  estimatedAmount?: number | null;
  plannedDate?: string | null;
  priority?: PlannerTaskPriority;
  necessity?: PlannedPurchaseNecessity;
  goalId?: string | null;
}

export interface PlanPurchaseInput {
  plannedDate: string;
  estimatedAmount: number;
  accountId?: string | null;
  categoryId?: string | null;
  installmentCount?: number;
}

export interface BuyPurchaseInput {
  accountId: string;
  date?: string;
}

export interface PlannerPeriod {
  month: number;
  year: number;
}

export interface PlannerWorkspace {
  tasks: PlannerTask[];
  purchases: PlannedPurchase[];
  upcomingCommitments: FinancialCommitment[];
  accounts: FinancialAccount[];
  categories: FinancialCategory[];
  summary: {
    pendingTasks: number;
    purchaseIdeas: number;
    purchaseIdeasAmount: number;
    plannedPurchases: number;
    plannedPurchasesAmount: number;
    financialCommitments: number;
    financialCommitmentsAmount: number;
  };
}

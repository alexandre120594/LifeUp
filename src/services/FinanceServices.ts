import { apiClient } from "./api-client";
import type {
  Budget,
  AccountSpendImportResponse,
  AccountSpendTrackerResponse,
  BudgetCreateInput,
  FinancePaymentInput,
  FinanceDashboardResponse,
  FinancialCategory,
  FinancialCategoryCreateInput,
  FinancialTransaction,
  FinancialTransactionCreateInput,
  PlannedExpense,
  PlannedExpenseCreateInput,
  RecurringBill,
  RecurringBillCreateInput,
  SavingsContribution,
  SavingsContributionCreateInput,
  SavingsGoal,
  SavingsGoalCreateInput,
} from "@/types/BaseInterfaces";

export const FinanceServices = {
  getDashboard: () => apiClient<FinanceDashboardResponse>("/api/finance"),
  getAccountSpendTracker: ({
    month,
    page,
    pageSize,
    sourceType,
  }: {
    month?: string;
    page: number;
    pageSize: number;
    sourceType: "extrato" | "fatura";
  }) => {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
      sourceType,
    });

    if (month) {
      params.set("month", month);
    }

    return apiClient<AccountSpendTrackerResponse>(
      `/api/finance/spending-tracker?${params.toString()}`
    );
  },
  importAccountSpendCsv: (data: FormData) =>
    fetch("/api/finance/spending-tracker", {
      method: "POST",
      body: data,
    }).then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Unable to import CSV.");
      }

      return response.json() as Promise<AccountSpendImportResponse>;
    }),
  deleteAccountSpendImport: (importId: string) =>
    apiClient<{ ok: boolean }>(
      `/api/finance/spending-tracker?importId=${encodeURIComponent(importId)}`,
      {
        method: "DELETE",
      }
    ),
  createCategory: (data: FinancialCategoryCreateInput) =>
    apiClient<FinancialCategory>("/api/finance/categories", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateCategory: ({
    data,
    id,
  }: {
    data: FinancialCategoryCreateInput;
    id: string;
  }) =>
    apiClient<FinancialCategory>(`/api/finance/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteCategory: (id: string) =>
    apiClient<{ ok: boolean }>(`/api/finance/categories/${id}`, {
      method: "DELETE",
    }),
  createTransaction: (data: FinancialTransactionCreateInput) =>
    apiClient<FinancialTransaction>("/api/finance/transactions", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateTransaction: ({
    data,
    id,
  }: {
    data: FinancialTransactionCreateInput;
    id: string;
  }) =>
    apiClient<FinancialTransaction>(`/api/finance/transactions/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteTransaction: (id: string) =>
    apiClient<{ ok: boolean }>(`/api/finance/transactions/${id}`, {
      method: "DELETE",
    }),
  createBudget: (data: BudgetCreateInput) =>
    apiClient<Budget>("/api/finance/budgets", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateBudget: ({ data, id }: { data: BudgetCreateInput; id: string }) =>
    apiClient<Budget>(`/api/finance/budgets/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteBudget: (id: string) =>
    apiClient<{ ok: boolean }>(`/api/finance/budgets/${id}`, {
      method: "DELETE",
    }),
  createRecurringBill: (data: RecurringBillCreateInput) =>
    apiClient<RecurringBill>("/api/finance/recurring-bills", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateRecurringBill: ({
    data,
    id,
  }: {
    data: RecurringBillCreateInput;
    id: string;
  }) =>
    apiClient<RecurringBill>(`/api/finance/recurring-bills/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteRecurringBill: (id: string) =>
    apiClient<{ ok: boolean }>(`/api/finance/recurring-bills/${id}`, {
      method: "DELETE",
    }),
  createPlannedExpense: (data: PlannedExpenseCreateInput) =>
    apiClient<PlannedExpense>("/api/finance/planned-expenses", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updatePlannedExpense: ({
    data,
    id,
  }: {
    data: PlannedExpenseCreateInput;
    id: string;
  }) =>
    apiClient<PlannedExpense>(`/api/finance/planned-expenses/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deletePlannedExpense: (id: string) =>
    apiClient<{ ok: boolean }>(`/api/finance/planned-expenses/${id}`, {
      method: "DELETE",
    }),
  markPlannedExpenseDone: ({
    data,
    id,
  }: {
    data?: FinancePaymentInput;
    id: string;
  }) =>
    apiClient<FinancialTransaction>(`/api/finance/planned-expenses/${id}/pay`, {
      method: "POST",
      body: JSON.stringify(data ?? {}),
    }),
  createSavingsGoal: (data: SavingsGoalCreateInput) =>
    apiClient<SavingsGoal>("/api/finance/savings-goals", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateSavingsGoal: ({
    data,
    id,
  }: {
    data: SavingsGoalCreateInput;
    id: string;
  }) =>
    apiClient<SavingsGoal>(`/api/finance/savings-goals/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteSavingsGoal: (id: string) =>
    apiClient<{ ok: boolean }>(`/api/finance/savings-goals/${id}`, {
      method: "DELETE",
    }),
  createSavingsContribution: ({
    data,
    goalId,
  }: {
    data: SavingsContributionCreateInput;
    goalId: string;
  }) =>
    apiClient<SavingsContribution>(
      `/api/finance/savings-goals/${goalId}/contributions`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    ),
  updateSavingsContribution: ({
    contributionId,
    data,
    goalId,
  }: {
    contributionId: string;
    data: SavingsContributionCreateInput;
    goalId: string;
  }) =>
    apiClient<SavingsContribution>(
      `/api/finance/savings-goals/${goalId}/contributions/${contributionId}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      }
    ),
  deleteSavingsContribution: ({
    contributionId,
    goalId,
  }: {
    contributionId: string;
    goalId: string;
  }) =>
    apiClient<{ ok: boolean }>(
      `/api/finance/savings-goals/${goalId}/contributions/${contributionId}`,
      {
        method: "DELETE",
      }
    ),
};

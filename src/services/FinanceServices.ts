import { apiClient } from "./api-client";
import type {
  Budget,
  BudgetCreateInput,
  FinanceDashboardResponse,
  FinancialCategory,
  FinancialCategoryCreateInput,
  FinancialTransaction,
  FinancialTransactionCreateInput,
  RecurringBill,
  RecurringBillCreateInput,
  SavingsGoal,
  SavingsGoalCreateInput,
} from "@/types/BaseInterfaces";

export const FinanceServices = {
  getDashboard: () => apiClient<FinanceDashboardResponse>("/api/finance"),
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
};

import { FinanceServices } from "@/services/FinanceServices";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useFinanceDashboard() {
  return useQuery({
    queryKey: ["finance"],
    queryFn: FinanceServices.getDashboard,
  });
}

export function useCreateFinancialCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: FinanceServices.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance"] });
    },
  });
}

export function useUpdateFinancialCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: FinanceServices.updateCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance"] });
    },
  });
}

export function useDeleteFinancialCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: FinanceServices.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance"] });
    },
  });
}

export function useCreateFinancialTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: FinanceServices.createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance"] });
    },
  });
}

export function useUpdateFinancialTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: FinanceServices.updateTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance"] });
    },
  });
}

export function useDeleteFinancialTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: FinanceServices.deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance"] });
    },
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: FinanceServices.createBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance"] });
    },
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: FinanceServices.updateBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance"] });
    },
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: FinanceServices.deleteBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance"] });
    },
  });
}

export function useCreateRecurringBill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: FinanceServices.createRecurringBill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance"] });
    },
  });
}

export function useUpdateRecurringBill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: FinanceServices.updateRecurringBill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance"] });
    },
  });
}

export function useDeleteRecurringBill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: FinanceServices.deleteRecurringBill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance"] });
    },
  });
}

export function useCreatePlannedExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: FinanceServices.createPlannedExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance"] });
    },
  });
}

export function useUpdatePlannedExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: FinanceServices.updatePlannedExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance"] });
    },
  });
}

export function useDeletePlannedExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: FinanceServices.deletePlannedExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance"] });
    },
  });
}

export function useMarkPlannedExpenseDone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: FinanceServices.markPlannedExpenseDone,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance"] });
    },
  });
}

export function useCreateSavingsGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: FinanceServices.createSavingsGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance"] });
    },
  });
}

export function useUpdateSavingsGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: FinanceServices.updateSavingsGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance"] });
    },
  });
}

export function useDeleteSavingsGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: FinanceServices.deleteSavingsGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance"] });
    },
  });
}

import { FinanceServices } from "@/services/FinanceServices";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useFinanceDashboard() {
  return useQuery({
    queryKey: ["finance"],
    queryFn: FinanceServices.getDashboard,
  });
}

export function useAccountSpendTracker({
  importId,
  month,
  page,
  pageSize,
  sourceType,
}: {
  importId?: string;
  month?: string;
  page: number;
  pageSize: number;
  sourceType: "extrato" | "fatura";
}) {
  return useQuery({
    queryKey: [
      "finance",
      "spending-tracker",
      { importId, month, page, pageSize, sourceType },
    ],
    queryFn: () =>
      FinanceServices.getAccountSpendTracker({
        importId,
        month,
        page,
        pageSize,
        sourceType,
      }),
  });
}

export function useImportAccountSpendCsv() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Statement imported.", successTitle: "Saved" },
    mutationFn: FinanceServices.importAccountSpendCsv,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["finance", "spending-tracker"],
        refetchType: "all",
      });
    },
  });
}

export function useDeleteAccountSpendImport() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Statement import deleted.", successTitle: "Deleted" },
    mutationFn: FinanceServices.deleteAccountSpendImport,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["finance", "spending-tracker"],
        refetchType: "all",
      });
    },
  });
}

export function useCreateFinancialCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Category created.", successTitle: "Saved" },
    mutationFn: FinanceServices.createCategory,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["finance"], refetchType: "all" });
    },
  });
}

export function useUpdateFinancialCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Category updated.", successTitle: "Updated" },
    mutationFn: FinanceServices.updateCategory,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["finance"], refetchType: "all" });
    },
  });
}

export function useDeleteFinancialCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Category deleted.", successTitle: "Deleted" },
    mutationFn: FinanceServices.deleteCategory,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["finance"], refetchType: "all" });
    },
  });
}

export function useCreateFinancialTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Transaction created.", successTitle: "Saved" },
    mutationFn: FinanceServices.createTransaction,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["finance"], refetchType: "all" });
    },
  });
}

export function useUpdateFinancialTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Transaction updated.", successTitle: "Updated" },
    mutationFn: FinanceServices.updateTransaction,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["finance"], refetchType: "all" });
    },
  });
}

export function useDeleteFinancialTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Transaction deleted.", successTitle: "Deleted" },
    mutationFn: FinanceServices.deleteTransaction,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["finance"], refetchType: "all" });
    },
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Budget created.", successTitle: "Saved" },
    mutationFn: FinanceServices.createBudget,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["finance"], refetchType: "all" });
    },
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Budget updated.", successTitle: "Updated" },
    mutationFn: FinanceServices.updateBudget,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["finance"], refetchType: "all" });
    },
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Budget deleted.", successTitle: "Deleted" },
    mutationFn: FinanceServices.deleteBudget,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["finance"], refetchType: "all" });
    },
  });
}

export function useCreateRecurringBill() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Recurring bill created.", successTitle: "Saved" },
    mutationFn: FinanceServices.createRecurringBill,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["finance"], refetchType: "all" });
    },
  });
}

export function useUpdateRecurringBill() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Recurring bill updated.", successTitle: "Updated" },
    mutationFn: FinanceServices.updateRecurringBill,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["finance"], refetchType: "all" });
    },
  });
}

export function useDeleteRecurringBill() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Recurring bill deleted.", successTitle: "Deleted" },
    mutationFn: FinanceServices.deleteRecurringBill,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["finance"], refetchType: "all" });
    },
  });
}

export function useCreatePlannedExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Planned record created.", successTitle: "Saved" },
    mutationFn: FinanceServices.createPlannedExpense,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["finance"], refetchType: "all" });
    },
  });
}

export function useUpdatePlannedExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Planned record updated.", successTitle: "Updated" },
    mutationFn: FinanceServices.updatePlannedExpense,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["finance"], refetchType: "all" });
    },
  });
}

export function useDeletePlannedExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Planned record deleted.", successTitle: "Deleted" },
    mutationFn: FinanceServices.deletePlannedExpense,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["finance"], refetchType: "all" });
    },
  });
}

export function useMarkPlannedExpenseDone() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Planned record completed.", successTitle: "Updated" },
    mutationFn: FinanceServices.markPlannedExpenseDone,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["finance"], refetchType: "all" });
    },
  });
}

export function useCreateSavingsGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Savings goal created.", successTitle: "Saved" },
    mutationFn: FinanceServices.createSavingsGoal,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["finance"], refetchType: "all" });
    },
  });
}

export function useUpdateSavingsGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Savings goal updated.", successTitle: "Updated" },
    mutationFn: FinanceServices.updateSavingsGoal,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["finance"], refetchType: "all" });
    },
  });
}

export function useDeleteSavingsGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Savings goal deleted.", successTitle: "Deleted" },
    mutationFn: FinanceServices.deleteSavingsGoal,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["finance"], refetchType: "all" });
    },
  });
}

export function useCreateSavingsContribution() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Savings contribution added.", successTitle: "Saved" },
    mutationFn: FinanceServices.createSavingsContribution,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["finance"], refetchType: "all" });
    },
  });
}

export function useUpdateSavingsContribution() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Savings contribution updated.", successTitle: "Updated" },
    mutationFn: FinanceServices.updateSavingsContribution,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["finance"], refetchType: "all" });
    },
  });
}

export function useDeleteSavingsContribution() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Savings contribution deleted.", successTitle: "Deleted" },
    mutationFn: FinanceServices.deleteSavingsContribution,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["finance"], refetchType: "all" });
    },
  });
}

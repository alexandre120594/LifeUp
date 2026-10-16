import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FinanceWorkspaceServices } from "@/services/FinanceWorkspaceServices";
import type { FinancePeriod } from "@/types/Finance";

const key = ["finance", "workspace"] as const;

export function useFinanceWorkspace(period: FinancePeriod) {
  return useQuery({ queryKey: [...key, period], queryFn: () => FinanceWorkspaceServices.get(period) });
}

function useWorkspaceMutation<TVariables>(
  mutationFn: (variables: TVariables) => Promise<unknown>,
  affectsPlanner = false
) {
  const client = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: async () => {
      const invalidations = [client.invalidateQueries({ queryKey: key })];
      if (affectsPlanner) invalidations.push(client.invalidateQueries({ queryKey: ["planner"] }));
      await Promise.all(invalidations);
    },
  });
}

export function useCreateFinancialAccount() {
  return useWorkspaceMutation(FinanceWorkspaceServices.createAccount);
}
export function useCreateFinancialTransaction() {
  return useWorkspaceMutation(FinanceWorkspaceServices.createTransaction);
}
export function useUpdateFinancialTransaction() { return useWorkspaceMutation(FinanceWorkspaceServices.updateTransaction); }
export function useDeleteFinancialTransaction() { return useWorkspaceMutation(FinanceWorkspaceServices.deleteTransaction, true); }
export function useDeleteFinancialTransactions() { return useWorkspaceMutation(FinanceWorkspaceServices.deleteTransactions, true); }
export function useDeleteFinancialTransactionsByPeriod() { return useWorkspaceMutation(FinanceWorkspaceServices.deleteTransactionsByPeriod, true); }
export function useCreateFinancialCommitment() {
  return useWorkspaceMutation(FinanceWorkspaceServices.createCommitment, true);
}
export function useUpdateFinancialCommitment() { return useWorkspaceMutation(FinanceWorkspaceServices.updateCommitment, true); }
export function useDeleteFinancialCommitment() { return useWorkspaceMutation(FinanceWorkspaceServices.deleteCommitment, true); }
export function useDeleteFinancialCommitments() { return useWorkspaceMutation(FinanceWorkspaceServices.deleteCommitments, true); }
export function usePayFinancialCommitment() {
  return useWorkspaceMutation(FinanceWorkspaceServices.payCommitment, true);
}
export function useReopenFinancialCommitment() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: FinanceWorkspaceServices.reopenCommitment,
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: ["finance"] }),
        client.invalidateQueries({ queryKey: ["planner"] }),
      ]);
    },
  });
}
export function useCreateFinancialGoal() {
  return useWorkspaceMutation(FinanceWorkspaceServices.createGoal);
}
export function useUpdateFinancialGoal() { return useWorkspaceMutation(FinanceWorkspaceServices.updateGoal); }
export function useDeleteFinancialGoal() { return useWorkspaceMutation(FinanceWorkspaceServices.deleteGoal); }
export function useDeleteFinancialGoals() { return useWorkspaceMutation(FinanceWorkspaceServices.deleteGoals); }
export function useCreateFinancialContribution() {
  return useWorkspaceMutation(FinanceWorkspaceServices.contribute);
}

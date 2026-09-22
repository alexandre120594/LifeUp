import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FinanceWorkspaceServices } from "@/services/FinanceWorkspaceServices";
import type { FinancePeriod } from "@/types/Finance";

const key = ["finance", "workspace"] as const;

export function useFinanceWorkspace(period: FinancePeriod) {
  return useQuery({ queryKey: [...key, period], queryFn: () => FinanceWorkspaceServices.get(period) });
}

function useWorkspaceMutation<TVariables>(mutationFn: (variables: TVariables) => Promise<unknown>) {
  const client = useQueryClient();
  return useMutation({ mutationFn, onSuccess: () => client.invalidateQueries({ queryKey: key }) });
}

export function useCreateFinancialAccount() {
  return useWorkspaceMutation(FinanceWorkspaceServices.createAccount);
}
export function useCreateFinancialTransaction() {
  return useWorkspaceMutation(FinanceWorkspaceServices.createTransaction);
}
export function useUpdateFinancialTransaction() { return useWorkspaceMutation(FinanceWorkspaceServices.updateTransaction); }
export function useDeleteFinancialTransaction() { return useWorkspaceMutation(FinanceWorkspaceServices.deleteTransaction); }
export function useDeleteFinancialTransactions() { return useWorkspaceMutation(FinanceWorkspaceServices.deleteTransactions); }
export function useDeleteFinancialTransactionsByPeriod() { return useWorkspaceMutation(FinanceWorkspaceServices.deleteTransactionsByPeriod); }
export function useCreateFinancialCommitment() {
  return useWorkspaceMutation(FinanceWorkspaceServices.createCommitment);
}
export function useUpdateFinancialCommitment() { return useWorkspaceMutation(FinanceWorkspaceServices.updateCommitment); }
export function useDeleteFinancialCommitment() { return useWorkspaceMutation(FinanceWorkspaceServices.deleteCommitment); }
export function useDeleteFinancialCommitments() { return useWorkspaceMutation(FinanceWorkspaceServices.deleteCommitments); }
export function usePayFinancialCommitment() {
  return useWorkspaceMutation(FinanceWorkspaceServices.payCommitment);
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

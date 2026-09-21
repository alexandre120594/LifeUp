import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FinanceWorkspaceServices } from "@/services/FinanceWorkspaceServices";

const key = ["finance", "workspace"] as const;

export function useFinanceWorkspace() {
  return useQuery({ queryKey: key, queryFn: FinanceWorkspaceServices.get });
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
export function useCreateFinancialCommitment() {
  return useWorkspaceMutation(FinanceWorkspaceServices.createCommitment);
}
export function usePayFinancialCommitment() {
  return useWorkspaceMutation(FinanceWorkspaceServices.payCommitment);
}
export function useCreateFinancialGoal() {
  return useWorkspaceMutation(FinanceWorkspaceServices.createGoal);
}
export function useCreateFinancialContribution() {
  return useWorkspaceMutation(FinanceWorkspaceServices.contribute);
}

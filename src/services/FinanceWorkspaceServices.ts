import type {
  FinanceWorkspace,
  FinancialAccount,
  FinancialAccountInput,
  FinancialCommitment,
  FinancialCommitmentInput,
  FinancialContributionInput,
  FinancialGoal,
  FinancialGoalInput,
  FinancialTransaction,
  FinancialTransactionInput,
} from "@/types/Finance";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || "Nao foi possivel concluir a operacao.");
  }
  return response.json() as Promise<T>;
}

export const FinanceWorkspaceServices = {
  get: () => request<FinanceWorkspace>("/api/finance"),
  createAccount: (data: FinancialAccountInput) => request<FinancialAccount>("/api/finance/accounts", {
    method: "POST", body: JSON.stringify(data),
  }),
  createTransaction: (data: FinancialTransactionInput) => request<FinancialTransaction>("/api/finance/transactions", {
    method: "POST", body: JSON.stringify(data),
  }),
  createCommitment: (data: FinancialCommitmentInput) => request<FinancialCommitment>("/api/finance/commitments", {
    method: "POST", body: JSON.stringify(data),
  }),
  payCommitment: ({ accountId, id }: { accountId: string; id: string }) =>
    request<{ commitment: FinancialCommitment; transaction: FinancialTransaction }>(`/api/finance/commitments/${id}/pay`, {
      method: "POST", body: JSON.stringify({ accountId }),
    }),
  createGoal: (data: FinancialGoalInput) => request<FinancialGoal>("/api/finance/savings-goals", {
    method: "POST", body: JSON.stringify(data),
  }),
  contribute: ({ data, goalId }: { data: FinancialContributionInput; goalId: string }) =>
    request(`/api/finance/savings-goals/${goalId}/contributions`, {
      method: "POST", body: JSON.stringify(data),
    }),
};

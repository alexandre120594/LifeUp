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
  FinancePeriod,
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
  get: (period: FinancePeriod) => {
    const params = new URLSearchParams({ year: String(period.year) });
    if (period.month) params.set("month", String(period.month));
    return request<FinanceWorkspace>(`/api/finance?${params}`);
  },
  createAccount: (data: FinancialAccountInput) => request<FinancialAccount>("/api/finance/accounts", {
    method: "POST", body: JSON.stringify(data),
  }),
  createTransaction: (data: FinancialTransactionInput) => request<FinancialTransaction>("/api/finance/transactions", {
    method: "POST", body: JSON.stringify(data),
  }),
  updateTransaction: ({ data, id }: { data: FinancialTransactionInput; id: string }) => request<FinancialTransaction>(`/api/finance/transactions/${id}`, {
    method: "PATCH", body: JSON.stringify(data),
  }),
  deleteTransaction: (id: string) => request<{ ok: boolean }>(`/api/finance/transactions/${id}`, { method: "DELETE" }),
  deleteTransactions: (ids: string[]) => request<{ count: number }>("/api/finance/transactions/bulk-delete", {
    method: "POST", body: JSON.stringify({ ids }),
  }),
  deleteTransactionsByPeriod: (period: FinancePeriod) => request<{ count: number }>("/api/finance/transactions/bulk-delete", {
    method: "POST", body: JSON.stringify(period.month ? { period } : { year: period.year }),
  }),
  createCommitment: (data: FinancialCommitmentInput) => request<FinancialCommitment>("/api/finance/commitments", {
    method: "POST", body: JSON.stringify(data),
  }),
  updateCommitment: ({ data, id }: { data: FinancialCommitmentInput; id: string }) => request<FinancialCommitment>(`/api/finance/commitments/${id}`, {
    method: "PATCH", body: JSON.stringify(data),
  }),
  deleteCommitment: (id: string) => request<{ ok: boolean }>(`/api/finance/commitments/${id}`, { method: "DELETE" }),
  deleteCommitments: (ids: string[]) => request<{ count: number }>("/api/finance/commitments/bulk-delete", {
    method: "POST", body: JSON.stringify({ ids }),
  }),
  payCommitment: ({ accountId, id }: { accountId: string; id: string }) =>
    request<{ commitment: FinancialCommitment; transaction: FinancialTransaction }>(`/api/finance/commitments/${id}/pay`, {
      method: "POST", body: JSON.stringify({ accountId }),
    }),
  createGoal: (data: FinancialGoalInput) => request<FinancialGoal>("/api/finance/savings-goals", {
    method: "POST", body: JSON.stringify(data),
  }),
  updateGoal: ({ data, id }: { data: FinancialGoalInput; id: string }) => request<FinancialGoal>(`/api/finance/savings-goals/${id}`, {
    method: "PATCH", body: JSON.stringify(data),
  }),
  deleteGoal: (id: string) => request<{ ok: boolean }>(`/api/finance/savings-goals/${id}`, { method: "DELETE" }),
  deleteGoals: (ids: string[]) => request<{ count: number }>("/api/finance/savings-goals/bulk-delete", {
    method: "POST", body: JSON.stringify({ ids }),
  }),
  contribute: ({ data, goalId }: { data: FinancialContributionInput; goalId: string }) =>
    request(`/api/finance/savings-goals/${goalId}/contributions`, {
      method: "POST", body: JSON.stringify(data),
    }),
};

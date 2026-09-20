import type { Goal, GoalCreateInput, GoalUpdateInput } from "@/types/Goal";
import { apiClient } from "./api-client";

export const GoalServices = {
  getAll: () => apiClient<Goal[]>("/api/goals"),
  getById: (id: string) => apiClient<Goal>(`/api/goals/${id}`),
  create: (data: GoalCreateInput) =>
    apiClient<Goal>("/api/goals", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: GoalUpdateInput) =>
    apiClient<Goal>(`/api/goals/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiClient<{ ok: boolean }>(`/api/goals/${id}`, { method: "DELETE" }),
};

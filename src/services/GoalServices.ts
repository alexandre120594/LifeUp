import type { Goal, GoalArea, GoalCreateInput, GoalStatus, GoalUpdateInput } from "@/types/Goal";
import { apiClient } from "./api-client";

export type GoalQuery = {
  area?: GoalArea;
  status?: GoalStatus;
};

function goalQueryString(query?: GoalQuery) {
  const params = new URLSearchParams();

  if (query?.area) {
    params.set("area", query.area);
  }

  if (query?.status) {
    params.set("status", query.status);
  }

  const value = params.toString();
  return value ? `?${value}` : "";
}

export const GoalServices = {
  getAll: (query?: GoalQuery) => apiClient<Goal[]>(`/api/goals${goalQueryString(query)}`),
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

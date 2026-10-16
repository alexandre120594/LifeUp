import { apiClient } from "@/services/api-client";
import type {
  BuyPurchaseInput,
  PlannedPurchase,
  PlannedPurchaseInput,
  PlannerPeriod,
  PlannerTask,
  PlannerTaskInput,
  PlannerWorkspace,
  PlanPurchaseInput,
} from "@/types/Planner";

export const PlannerServices = {
  getWorkspace: (period: PlannerPeriod) => apiClient<PlannerWorkspace>(`/api/planner?month=${period.month}&year=${period.year}`),
  createTask: (data: PlannerTaskInput) => apiClient<PlannerTask>("/api/planner/tasks", { method: "POST", body: JSON.stringify(data) }),
  updateTask: ({ data, id }: { data: Partial<PlannerTaskInput>; id: string }) => apiClient<PlannerTask>(`/api/planner/tasks/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteTask: (id: string) => apiClient<{ ok: boolean }>(`/api/planner/tasks/${id}`, { method: "DELETE" }),
  createPurchase: (data: PlannedPurchaseInput) => apiClient<PlannedPurchase>("/api/planner/purchases", { method: "POST", body: JSON.stringify(data) }),
  updatePurchase: ({ data, id }: { data: Partial<PlannedPurchaseInput>; id: string }) => apiClient<PlannedPurchase>(`/api/planner/purchases/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deletePurchase: (id: string) => apiClient<{ ok: boolean }>(`/api/planner/purchases/${id}`, { method: "DELETE" }),
  planPurchase: ({ data, id }: { data: PlanPurchaseInput; id: string }) => apiClient<PlannedPurchase>(`/api/planner/purchases/${id}/plan`, { method: "POST", body: JSON.stringify(data) }),
  buyPurchase: ({ data, id }: { data: BuyPurchaseInput; id: string }) => apiClient<{ purchase: PlannedPurchase }>(`/api/planner/purchases/${id}/buy`, { method: "POST", body: JSON.stringify(data) }),
  cancelPurchase: (id: string) => apiClient<PlannedPurchase>(`/api/planner/purchases/${id}/cancel`, { method: "POST" }),
  restorePurchase: (id: string) => apiClient<PlannedPurchase>(`/api/planner/purchases/${id}/restore`, { method: "POST" }),
};

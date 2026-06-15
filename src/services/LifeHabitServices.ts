import type {
  LifeHabit,
  LifeHabitActionInput,
  LifeHabitCreateInput,
  LifeHabitUpdateInput,
} from "@/types/BaseInterfaces";
import { apiClient } from "./api-client";

export const LifeHabitServices = {
  getAll: () => apiClient<LifeHabit[]>("/api/life-habits"),
  create: (data: LifeHabitCreateInput) =>
    apiClient<LifeHabit>("/api/life-habits", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: LifeHabitUpdateInput) =>
    apiClient<LifeHabit>(`/api/life-habits/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  action: (id: string, data: LifeHabitActionInput) =>
    apiClient<LifeHabit>(`/api/life-habits/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiClient<{ message: string }>(`/api/life-habits/${id}`, {
      method: "DELETE",
    }),
};

import type {
  LifeHabit,
  LifeHabitActionInput,
  LifeHabitCreateInput,
  LifeHabitUpdateInput,
} from "@/types/BaseInterfaces";
import { apiClient } from "./api-client";
import { normalizeHabitKind } from "@/lib/life-habits";

function normalizeHabit(habit: LifeHabit): LifeHabit {
  return { ...habit, kind: normalizeHabitKind(habit.kind) };
}

export const LifeHabitServices = {
  getAll: (archived = false) => apiClient<LifeHabit[]>(`/api/life-habits${archived ? "?archived=true" : ""}`).then((habits) => habits.map(normalizeHabit)),
  create: (data: LifeHabitCreateInput) =>
    apiClient<LifeHabit>("/api/life-habits", {
      method: "POST",
      body: JSON.stringify(data),
    }).then(normalizeHabit),
  update: (id: string, data: LifeHabitUpdateInput) =>
    apiClient<LifeHabit>(`/api/life-habits/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }).then(normalizeHabit),
  action: (id: string, data: LifeHabitActionInput) =>
    apiClient<LifeHabit>(`/api/life-habits/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }).then(normalizeHabit),
  delete: (id: string) =>
    apiClient<{ message: string }>(`/api/life-habits/${id}`, {
      method: "DELETE",
    }),
};

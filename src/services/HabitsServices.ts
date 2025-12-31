import { Habit, HabitCreateInput } from "@/types/BaseInterfaces";
import { apiClient } from "./api-client";

export const HabitsServices = {
  getAll: () => apiClient<Habit[]>("/api/habits"),
  getById: (id: string) => apiClient<Habit>(`/api/habits/${id}`),
  create: (data: HabitCreateInput) =>
    apiClient<Habit>("/api/habits", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  delete: (id?: string) => apiClient(`/api/habits/${id}`, { method: "DELETE" }),
  update: (data: HabitCreateInput, id: string) =>
    apiClient<Habit>(`/api/habits/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};

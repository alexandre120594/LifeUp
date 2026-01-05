import { Habit, Task, TaskCreateInput } from "@/types/BaseInterfaces";
import { apiClient } from "./api-client";

export const TaskService = {
  getAll: (habitId?: string) => {
    const url = habitId ? `/api/tasks?projectId=${habitId}` : "/api/tasks";
    return apiClient<Task[]>(url);
  },
  getById: (id: string) => apiClient<Task>(`/api/tasks/${id}`),
  create: (data: TaskCreateInput) =>
    apiClient<Task>("/api/tasks", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  delete: (id?: string) => apiClient(`/api/tasks/${id}`, { method: "DELETE" }),
  update: (data: Task, id: string) =>
    apiClient<Task>(`/api/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};

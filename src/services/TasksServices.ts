import { Task, TaskCreateInput } from "@/types/BaseInterfaces";
import { apiClient } from "./api-client";

export const TaskService = {
  getAll: (filters?: { habitId?: string; projectId?: string }) => {
    const searchParams = new URLSearchParams();

    if (filters?.habitId) {
      searchParams.set("habitId", filters.habitId);
    }

    if (filters?.projectId) {
      searchParams.set("projectId", filters.projectId);
    }

    const query = searchParams.toString();
    const url = query ? `/api/tasks?${query}` : "/api/tasks";
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

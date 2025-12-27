import { Task, TaskCreateInput } from "@/types/BaseInterfaces";
import { apiClient } from "./api-client";

export const TaskService = {
  getAll: () => apiClient<Task[]>("/api/tasks"),
   create: (data: TaskCreateInput) => 
      apiClient<Task>("/api/tasks", {
        method: "POST",
        body: JSON.stringify(data),
      }),
};

import { apiClient } from "./api-client";
import { Project, ProjectCreateInput } from "@/types/BaseInterfaces";

export const projectServices = {
  getAll: () => apiClient<Project[]>("/api/projects"),
  getById: (id: string) => apiClient<Project>(`/api/projects/${id}`),
  create: (data: ProjectCreateInput) =>
    apiClient<Project>("/api/projects", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiClient(`/api/projects/${id}`, { method: "DELETE" }),
  update: (data?: ProjectCreateInput, id?: string) =>
    apiClient<Project>(`/api/projects/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};

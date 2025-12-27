import { apiClient } from "./api-client";
import { Project, ProjectCreateInput } from "@/types/BaseInterfaces";

export const projectServices = {
  getAll: () => apiClient<Project[]>("/api/projects"),
  
  create: (data: ProjectCreateInput) => 
    apiClient<Project>("/api/projects", {
      method: "POST",
      body: JSON.stringify(data),
    }),
    
  delete: (id: string) => 
    apiClient(`/api/projects/${id}`, { method: "DELETE" }),
};
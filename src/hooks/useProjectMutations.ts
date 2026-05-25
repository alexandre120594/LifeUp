import { projectServices } from "@/services/ProjectsServices";
import { ProjectCreateInput } from "@/types/BaseInterfaces";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: projectServices.getAll,
  });
}

export function useProjectsById(id: string) {
  return useQuery({
    queryKey: ["projects", "habits", "task", id],
    queryFn: () => projectServices.getById(id),
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: {
      successMessage: "Project created.",
      successTitle: "Saved",
    },
    mutationFn: projectServices.create,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["projects"], refetchType: "all" });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: {
      successMessage: "Project updated.",
      successTitle: "Updated",
    },
    mutationFn: ({ id, data }: { id?: string; data?: ProjectCreateInput }) =>
      projectServices.update(data, id),
    onSuccess: async (data, variables) => {
      const id = variables.id;

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["projects"], refetchType: "all" }),
        queryClient.invalidateQueries({ queryKey: ["projects", id], refetchType: "all" }),
        queryClient.invalidateQueries({ queryKey: ["habits"], refetchType: "all" }),
      ]);
    },
  });
}

export function useDeleteProject(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    meta: {
      successMessage: "Project deleted.",
      successTitle: "Deleted",
    },
    mutationKey: ["deleteProject", id],
    mutationFn: (id: string) => projectServices.delete(id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["projects"], refetchType: "all" }),
        queryClient.invalidateQueries({ queryKey: ["projects", id], refetchType: "all" }),
        queryClient.invalidateQueries({ queryKey: ["habits"], refetchType: "all" }),
      ]);
    },
  });
}

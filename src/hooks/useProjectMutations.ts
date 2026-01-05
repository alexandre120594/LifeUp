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
    mutationFn: projectServices.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id?: string; data?: ProjectCreateInput }) =>
      projectServices.update(data, id),
    onSuccess: (data, variables) => {
      const id = variables.id;

      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects", id] });
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
  });
}

export function useDeleteProject(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["deleteProject", id],
    mutationFn: (id: string) => projectServices.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects", id] });
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
  });
}

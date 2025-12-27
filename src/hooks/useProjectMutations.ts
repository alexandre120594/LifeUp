import { projectServices } from "@/services/ProjectsServices";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";


export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: projectServices.getAll,
  });
}

export function useCreateProject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: projectServices.create,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["projects"]})
        }
    })
}
import { TaskService } from "@/services/TasksServices";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useTask() {
  return useQuery({
    queryKey: ["task"],
    queryFn: TaskService.getAll,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: TaskService.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
  });
}

import { TaskService } from "@/services/TasksServices";
import { Task } from "@/types/BaseInterfaces";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useTask(filters?: { habitId?: string; projectId?: string }) {
  return useQuery({
    queryKey: ["task", filters],
    queryFn: () => TaskService.getAll(filters),
  });
}

export function useTaskById(id: string) {
  return useQuery({
    queryKey: ["task", id],
    queryFn: () => TaskService.getById(id),
    enabled: !!id,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: TaskService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Task }) =>
      TaskService.update(data, id),
    onSuccess: (data, variables) => {
      const id = variables.id;

      queryClient.invalidateQueries({ queryKey: ["habits"] });
      queryClient.invalidateQueries({ queryKey: ["task", id] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["task"] });
    },
  });
}

export function useDeleteTask(id?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["deleteTask", id],
    mutationFn: (id: string) => TaskService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task", id] });
      queryClient.invalidateQueries({ queryKey: ["habits"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

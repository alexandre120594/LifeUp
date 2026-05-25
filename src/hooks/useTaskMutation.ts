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
    meta: {
      successMessage: "Task created.",
      successTitle: "Saved",
    },
    mutationFn: TaskService.create,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["task"], refetchType: "all" }),
        queryClient.invalidateQueries({ queryKey: ["projects"], refetchType: "all" }),
        queryClient.invalidateQueries({ queryKey: ["habits"], refetchType: "all" }),
      ]);
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: {
      successMessage: "Task updated.",
      successTitle: "Updated",
    },
    mutationFn: ({ id, data }: { id: string; data: Task }) =>
      TaskService.update(data, id),
    onSuccess: async (data, variables) => {
      const id = variables.id;

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["habits"], refetchType: "all" }),
        queryClient.invalidateQueries({ queryKey: ["task", id], refetchType: "all" }),
        queryClient.invalidateQueries({ queryKey: ["projects"], refetchType: "all" }),
        queryClient.invalidateQueries({ queryKey: ["task"], refetchType: "all" }),
      ]);
    },
  });
}

export function useDeleteTask(id?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    meta: {
      successMessage: "Task deleted.",
      successTitle: "Deleted",
    },
    mutationKey: ["deleteTask", id],
    mutationFn: (id: string) => TaskService.delete(id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["task", id], refetchType: "all" }),
        queryClient.invalidateQueries({ queryKey: ["task"], refetchType: "all" }),
        queryClient.invalidateQueries({ queryKey: ["habits"], refetchType: "all" }),
        queryClient.invalidateQueries({ queryKey: ["projects"], refetchType: "all" }),
      ]);
    },
  });
}

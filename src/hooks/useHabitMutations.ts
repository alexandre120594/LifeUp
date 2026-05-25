import { HabitsServices } from "@/services/HabitsServices";
import { HabitCreateInput } from "@/types/BaseInterfaces";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";

export function useHabit(projectId?: string) {
  return useQuery({
    queryKey: ["habits", { projectId }],
    queryFn: () => HabitsServices.getAll(projectId),
  });
}

export function useHabitDetail(id: string) {
  return useQuery({
    queryKey: ["habits", id],
    queryFn: () => HabitsServices.getById(id),
  });
}

export function useCreateHabits() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: {
      successMessage: "Habit created.",
      successTitle: "Saved",
    },
    mutationFn: HabitsServices.create,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["habits"], refetchType: "all" }),
        queryClient.invalidateQueries({ queryKey: ["projects"], refetchType: "all" }),
      ]);
    },
  });
}

export function useUpdateHabits() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: {
      successMessage: "Habit updated.",
      successTitle: "Updated",
    },
    mutationFn: ({ id, data }: { id: string; data: HabitCreateInput }) =>
      HabitsServices.update(data, id),
    onSuccess: async (data, variables) => {
      const id = variables.id;

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["projects"], refetchType: "all" }),
        queryClient.invalidateQueries({ queryKey: ["habits"], refetchType: "all" }),
        queryClient.invalidateQueries({ queryKey: ["habits", id], refetchType: "all" }),
      ]);
    },
  });
}

export function useDeleteHabits(id?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    meta: {
      successMessage: "Habit deleted.",
      successTitle: "Deleted",
    },
    mutationKey: ["deleteHabits", id],
    mutationFn: (id?: string) => HabitsServices.delete(id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["projects"], refetchType: "all" }),
        queryClient.invalidateQueries({ queryKey: ["habits"], refetchType: "all" }),
        queryClient.invalidateQueries({ queryKey: ["habits", id], refetchType: "all" }),
      ]);
    },
  });
}

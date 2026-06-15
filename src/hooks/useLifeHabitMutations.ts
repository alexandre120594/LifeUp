import { LifeHabitServices } from "@/services/LifeHabitServices";
import type {
  LifeHabitActionInput,
  LifeHabitCreateInput,
  LifeHabitUpdateInput,
} from "@/types/BaseInterfaces";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const lifeHabitQueryKey = ["life-habits"];

export function useLifeHabits() {
  return useQuery({
    queryKey: lifeHabitQueryKey,
    queryFn: LifeHabitServices.getAll,
  });
}

export function useCreateLifeHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Habit saved.", successTitle: "Saved" },
    mutationFn: (data: LifeHabitCreateInput) => LifeHabitServices.create(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: lifeHabitQueryKey,
        refetchType: "all",
      });
    },
  });
}

export function useUpdateLifeHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Habit updated.", successTitle: "Updated" },
    mutationFn: ({ data, id }: { data: LifeHabitUpdateInput; id: string }) =>
      LifeHabitServices.update(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: lifeHabitQueryKey,
        refetchType: "all",
      });
    },
  });
}

export function useLifeHabitAction() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Habit tracked.", successTitle: "Saved" },
    mutationFn: ({ data, id }: { data: LifeHabitActionInput; id: string }) =>
      LifeHabitServices.action(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: lifeHabitQueryKey,
        refetchType: "all",
      });
    },
  });
}

export function useDeleteLifeHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Habit deleted.", successTitle: "Deleted" },
    mutationFn: LifeHabitServices.delete,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: lifeHabitQueryKey,
        refetchType: "all",
      });
    },
  });
}

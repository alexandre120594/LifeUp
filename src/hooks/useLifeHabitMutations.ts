import { LifeHabitServices } from "@/services/LifeHabitServices";
import type {
  LifeHabit,
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
    meta: { successMessage: "Hábito atualizado.", successTitle: "Salvo" },
    mutationFn: ({ data, id }: { data: LifeHabitActionInput; id: string }) =>
      LifeHabitServices.action(id, data),
    onMutate: async ({ data, id }) => {
      await queryClient.cancelQueries({ queryKey: lifeHabitQueryKey });
      const previous = queryClient.getQueryData<LifeHabit[]>(lifeHabitQueryKey);
      const dayKey = data.dayKey ?? new Date().toISOString().slice(0, 10);

      queryClient.setQueryData<LifeHabit[]>(lifeHabitQueryKey, (current = []) =>
        current.map((habit) => {
          if (habit.id !== id) return habit;
          if (data.action === "toggle-checkin") {
            const checkins = habit.checkins.includes(dayKey)
              ? habit.checkins.filter((item) => item !== dayKey)
              : [...habit.checkins, dayKey];
            return { ...habit, checkins };
          }

          return {
            ...habit,
            badEvents: [...new Set([...habit.badEvents, dayKey])],
            checkins: habit.checkins.includes(dayKey)
              ? habit.checkins
              : [...habit.checkins, dayKey],
            lastBadAt: `${dayKey}T12:00:00`,
          };
        }),
      );

      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(lifeHabitQueryKey, context.previous);
      }
    },
    onSettled: async () => {
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

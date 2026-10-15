import { LifeHabitServices } from "@/services/LifeHabitServices";
import type {
  LifeHabit,
  LifeHabitActionInput,
  LifeHabitCreateInput,
  LifeHabitUpdateInput,
} from "@/types/BaseInterfaces";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getHabitCompletions } from "@/lib/life-habits";

const lifeHabitQueryKey = ["life-habits"];

export function useLifeHabits(archived = false) {
  return useQuery({
    queryKey: [...lifeHabitQueryKey, { archived }],
    queryFn: () => LifeHabitServices.getAll(archived),
  });
}

export function useCreateLifeHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Hábito criado.", successTitle: "Salvo" },
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
    meta: { successMessage: "Hábito atualizado.", successTitle: "Salvo" },
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
      const activeKey = [...lifeHabitQueryKey, { archived: false }];
      const previous = queryClient.getQueryData<LifeHabit[]>(activeKey);
      const dayKey = data.dayKey ?? new Date().toISOString().slice(0, 10);

      queryClient.setQueryData<LifeHabit[]>(activeKey, (current = []) =>
        current.map((habit) => {
          if (habit.id !== id) return habit;
          const completions = { ...getHabitCompletions(habit) };
          const currentEntry = completions[dayKey] ?? { count: 0, steps: [] };
          if (data.action === "toggle-checkin") {
            if (completions[dayKey]) delete completions[dayKey];
            else completions[dayKey] = { count: Math.max(1, habit.perDayTarget), steps: [] };
          } else if (data.action === "reset-bad") {
            completions[dayKey] = { count: 1, steps: [] };
          } else if (data.action === "increment" || data.action === "set-amount") {
            const amount = data.action === "increment" ? currentEntry.count + (data.amount ?? 0) : (data.amount ?? 0);
            if (amount <= 0) delete completions[dayKey];
            else completions[dayKey] = { ...currentEntry, count: amount };
          } else if (data.action === "toggle-step" && data.stepId) {
            const steps = new Set(currentEntry.steps);
            if (steps.has(data.stepId)) steps.delete(data.stepId); else steps.add(data.stepId);
            if (!steps.size) delete completions[dayKey];
            else completions[dayKey] = { count: steps.size, steps: [...steps] };
          }
          return { ...habit, completions };
        }),
      );

      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData([...lifeHabitQueryKey, { archived: false }], context.previous);
      }
    },
    onSuccess: (updated) => {
      queryClient.setQueriesData<LifeHabit[]>({ queryKey: lifeHabitQueryKey }, (current = []) => current.map((habit) => habit.id === updated.id ? updated : habit));
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
    meta: { successMessage: "Hábito excluído.", successTitle: "Excluído" },
    mutationFn: LifeHabitServices.delete,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: lifeHabitQueryKey,
        refetchType: "all",
      });
    },
  });
}

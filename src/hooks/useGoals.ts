import { GoalQuery, GoalServices } from "@/services/GoalServices";
import type { GoalUpdateInput } from "@/types/Goal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useGoals(query?: GoalQuery) {
  return useQuery({
    queryKey: ["goals", query],
    queryFn: () => GoalServices.getAll(query),
  });
}

export function useGoal(id: string) {
  return useQuery({
    enabled: Boolean(id),
    queryKey: ["goals", id],
    queryFn: () => GoalServices.getById(id),
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: {
      successMessage: "Goal saved.",
      successTitle: "Saved",
    },
    mutationFn: GoalServices.create,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["goals"], refetchType: "all" });
    },
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: {
      successMessage: "Goal updated.",
      successTitle: "Updated",
    },
    mutationFn: ({ data, id }: { data: GoalUpdateInput; id: string }) =>
      GoalServices.update(id, data),
    onSuccess: async (_goal, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["goals"], refetchType: "all" }),
        queryClient.invalidateQueries({ queryKey: ["goals", variables.id], refetchType: "all" }),
      ]);
    },
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: {
      successMessage: "Goal deleted.",
      successTitle: "Deleted",
    },
    mutationFn: GoalServices.delete,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["goals"], refetchType: "all" });
    },
  });
}

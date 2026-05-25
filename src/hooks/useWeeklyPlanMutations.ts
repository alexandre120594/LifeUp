import { WeeklyPlanServices } from "@/services/WeeklyPlanServices";
import type { WeeklyPlanSlotInput } from "@/types/BaseInterfaces";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useWeeklyPlan(weekStartKey: string) {
  return useQuery({
    queryKey: ["weekly-plan", weekStartKey],
    queryFn: () => WeeklyPlanServices.getBoard(weekStartKey),
    enabled: Boolean(weekStartKey),
  });
}

export function useCreateWeeklyPlanSlot() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Weekly slot saved.", successTitle: "Saved" },
    mutationFn: WeeklyPlanServices.createSlot,
    onSuccess: async (board) => {
      await queryClient.invalidateQueries({
        queryKey: ["weekly-plan", board.weekStartKey],
        refetchType: "all",
      });
    },
  });
}

export function useUpdateWeeklyPlanSlot() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Weekly slot updated.", successTitle: "Updated" },
    mutationFn: ({ id, data }: { id: string; data: WeeklyPlanSlotInput }) =>
      WeeklyPlanServices.updateSlot(id, data),
    onSuccess: async (board) => {
      await queryClient.invalidateQueries({
        queryKey: ["weekly-plan", board.weekStartKey],
        refetchType: "all",
      });
    },
  });
}

export function useDeleteWeeklyPlanSlot(weekStartKey: string) {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Weekly slot deleted.", successTitle: "Deleted" },
    mutationFn: WeeklyPlanServices.deleteSlot,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["weekly-plan", weekStartKey],
        refetchType: "all",
      });
    },
  });
}

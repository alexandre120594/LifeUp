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
    mutationFn: WeeklyPlanServices.createSlot,
    onSuccess: (board) => {
      queryClient.invalidateQueries({
        queryKey: ["weekly-plan", board.weekStartKey],
      });
    },
  });
}

export function useUpdateWeeklyPlanSlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: WeeklyPlanSlotInput }) =>
      WeeklyPlanServices.updateSlot(id, data),
    onSuccess: (board) => {
      queryClient.invalidateQueries({
        queryKey: ["weekly-plan", board.weekStartKey],
      });
    },
  });
}

export function useDeleteWeeklyPlanSlot(weekStartKey: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: WeeklyPlanServices.deleteSlot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weekly-plan", weekStartKey] });
    },
  });
}

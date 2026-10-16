import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PlannerServices } from "@/services/PlannerServices";
import type { PlannerPeriod } from "@/types/Planner";

const plannerKey = ["planner"] as const;

export function usePlanner(period: PlannerPeriod) {
  return useQuery({ queryKey: [...plannerKey, period], queryFn: () => PlannerServices.getWorkspace(period) });
}

function usePlannerMutation<TVariables>(mutationFn: (variables: TVariables) => Promise<unknown>, affectsFinance = false) {
  const client = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: async () => {
      const invalidations = [client.invalidateQueries({ queryKey: plannerKey })];
      if (affectsFinance) invalidations.push(client.invalidateQueries({ queryKey: ["finance"] }));
      await Promise.all(invalidations);
    },
  });
}

export function useCreatePlannerTask() { return usePlannerMutation(PlannerServices.createTask); }
export function useUpdatePlannerTask() { return usePlannerMutation(PlannerServices.updateTask); }
export function useDeletePlannerTask() { return usePlannerMutation(PlannerServices.deleteTask); }
export function useCreatePlannedPurchase() { return usePlannerMutation(PlannerServices.createPurchase); }
export function useUpdatePlannedPurchase() { return usePlannerMutation(PlannerServices.updatePurchase, true); }
export function useDeletePlannedPurchase() { return usePlannerMutation(PlannerServices.deletePurchase, true); }
export function usePlanPurchase() { return usePlannerMutation(PlannerServices.planPurchase, true); }
export function useBuyPurchase() { return usePlannerMutation(PlannerServices.buyPurchase, true); }
export function useCancelPurchase() { return usePlannerMutation(PlannerServices.cancelPurchase, true); }
export function useRestorePurchase() { return usePlannerMutation(PlannerServices.restorePurchase, true); }

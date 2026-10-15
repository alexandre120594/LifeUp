import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { StudyWorkspaceServices } from "@/services/StudyWorkspaceServices";
import type { StudyPlanDayProgress, StudyPlanProgressInput } from "@/types/Study";

const key = ["study", "workspace"] as const;
export function useStudyWorkspace() {
  return useQuery({ queryKey: key, queryFn: StudyWorkspaceServices.get });
}
function useWorkspaceMutation<T, TResult>(mutationFn: (value: T) => Promise<TResult>) {
  const client = useQueryClient();
  return useMutation({ mutationFn, onSuccess: () => client.invalidateQueries({ queryKey: key }) });
}
export function useCreateStudyTopic() { return useWorkspaceMutation(StudyWorkspaceServices.createTopic); }
export function useCreateStudySubject() { return useWorkspaceMutation(StudyWorkspaceServices.createSubject); }
export function useUpdateStudySubject() { return useWorkspaceMutation(StudyWorkspaceServices.updateSubject); }
export function useDeleteStudySubject() { return useWorkspaceMutation(StudyWorkspaceServices.deleteSubject); }
export function useCreateStudySession() { return useWorkspaceMutation(StudyWorkspaceServices.createSession); }
export function useUpdateStudySession() { return useWorkspaceMutation(StudyWorkspaceServices.updateSession); }
export function useDeleteStudySession() { return useWorkspaceMutation(StudyWorkspaceServices.deleteSession); }
export function useCreateStudyReview() { return useWorkspaceMutation(StudyWorkspaceServices.createReview); }
export function useUpdateStudyReview() { return useWorkspaceMutation(StudyWorkspaceServices.updateReview); }
export function useDeleteStudyReview() { return useWorkspaceMutation(StudyWorkspaceServices.deleteReview); }
export function useRescheduleStudyReview() { return useWorkspaceMutation(StudyWorkspaceServices.rescheduleReview); }
export function useMasterStudyReview() { return useWorkspaceMutation(StudyWorkspaceServices.masterReview); }

const planKey = (planId: string) => ["study", "plan", planId] as const;

export function useStudyPlanProgress(planId: string) {
  return useQuery({
    queryKey: planKey(planId),
    queryFn: () => StudyWorkspaceServices.getPlanProgress(planId),
  });
}

export function useUpdateStudyPlanProgress(planId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (value: StudyPlanProgressInput) => StudyWorkspaceServices.updatePlanProgress(value),
    onMutate: async (value) => {
      await client.cancelQueries({ queryKey: planKey(planId) });
      const previous = client.getQueryData<StudyPlanDayProgress[]>(planKey(planId));
      client.setQueryData<StudyPlanDayProgress[]>(planKey(planId), (current = []) => {
        const existing = current.find((item) => item.dayNumber === value.dayNumber) ?? { completed: false, dayNumber: value.dayNumber, score: null };
        const next = current.filter((item) => item.dayNumber !== value.dayNumber);
        return [...next, { ...existing, ...(value.completed === undefined ? {} : { completed: value.completed }), ...(value.score === undefined ? {} : { score: value.score }) }]
          .sort((a, b) => a.dayNumber - b.dayNumber);
      });
      return { previous };
    },
    onError: (_error, _value, context) => {
      if (context?.previous) client.setQueryData(planKey(planId), context.previous);
    },
    onSettled: () => client.invalidateQueries({ queryKey: planKey(planId) }),
  });
}

export function useResetStudyPlanProgress(planId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: () => StudyWorkspaceServices.resetPlanProgress(planId),
    onSuccess: () => client.setQueryData(planKey(planId), []),
    onSettled: () => client.invalidateQueries({ queryKey: planKey(planId) }),
  });
}

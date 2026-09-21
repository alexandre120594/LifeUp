import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { StudyWorkspaceServices } from "@/services/StudyWorkspaceServices";

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
export function useCreateStudySession() { return useWorkspaceMutation(StudyWorkspaceServices.createSession); }
export function useCreateStudyReview() { return useWorkspaceMutation(StudyWorkspaceServices.createReview); }
export function useRescheduleStudyReview() { return useWorkspaceMutation(StudyWorkspaceServices.rescheduleReview); }
export function useMasterStudyReview() { return useWorkspaceMutation(StudyWorkspaceServices.masterReview); }

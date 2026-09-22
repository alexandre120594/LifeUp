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

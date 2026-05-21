import { StudyServices } from "@/services/StudyServices";
import type { StudyScheduleInput, StudySubjectInput } from "@/types/BaseInterfaces";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useStudySubjects() {
  return useQuery({
    queryKey: ["study-subjects"],
    queryFn: StudyServices.getSubjects,
  });
}

export function useStudySchedule() {
  return useQuery({
    queryKey: ["study-schedule"],
    queryFn: StudyServices.getSchedule,
  });
}

export function useCreateStudySubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: StudyServices.createSubject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["study-subjects"] });
      queryClient.invalidateQueries({ queryKey: ["study-schedule"] });
    },
  });
}

export function useUpdateStudySubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: StudySubjectInput }) =>
      StudyServices.updateSubject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["study-subjects"] });
      queryClient.invalidateQueries({ queryKey: ["study-schedule"] });
    },
  });
}

export function useDeleteStudySubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: StudyServices.deleteSubject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["study-subjects"] });
      queryClient.invalidateQueries({ queryKey: ["study-schedule"] });
    },
  });
}

export function useSaveStudyScheduleBlock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StudyScheduleInput) => StudyServices.saveScheduleBlock(data),
    onSuccess: (schedule) => {
      queryClient.setQueryData(["study-schedule"], schedule);
      queryClient.invalidateQueries({ queryKey: ["study-schedule"] });
      queryClient.invalidateQueries({ queryKey: ["study-subjects"] });
    },
  });
}

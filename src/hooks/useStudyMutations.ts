import { StudyServices } from "@/services/StudyServices";
import type {
  StudyPlanBlockInput,
  StudyScheduleInput,
  StudySessionCreateInput,
  StudySubjectInput,
} from "@/types/BaseInterfaces";
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

export function useStudySessions() {
  return useQuery({
    queryKey: ["study-sessions"],
    queryFn: StudyServices.getSessions,
  });
}

export function useStudyPlanBoard(weekStartKey: string) {
  return useQuery({
    queryKey: ["study-plan", weekStartKey],
    queryFn: () => StudyServices.getPlanBoard(weekStartKey),
  });
}

export function useCreateStudySubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: StudyServices.createSubject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["study-subjects"] });
      queryClient.invalidateQueries({ queryKey: ["study-schedule"] });
      queryClient.invalidateQueries({ queryKey: ["study-plan"] });
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

export function useCreateStudyPlanBlock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StudyPlanBlockInput) =>
      StudyServices.createPlanBlock(data),
    onSuccess: (_block, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["study-plan", variables.weekStartKey],
      });
      queryClient.invalidateQueries({ queryKey: ["study-subjects"] });
    },
  });
}

export function useUpdateStudyPlanBlock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: StudyPlanBlockInput }) =>
      StudyServices.updatePlanBlock(id, data),
    onSuccess: (_block, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["study-plan", variables.data.weekStartKey],
      });
      queryClient.invalidateQueries({ queryKey: ["study-subjects"] });
    },
  });
}

export function useDeleteStudyPlanBlock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: StudyServices.deletePlanBlock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["study-plan"] });
      queryClient.invalidateQueries({ queryKey: ["study-subjects"] });
    },
  });
}

export function useCreateStudySession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StudySessionCreateInput) =>
      StudyServices.createSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["study-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["study-subjects"] });
    },
  });
}

export function useDeleteStudySession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: StudyServices.deleteSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["study-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["study-subjects"] });
    },
  });
}

import { StudyServices } from "@/services/StudyServices";
import type { StudyQuestionPracticeFilters } from "@/services/StudyServices";
import type {
  StudyPlanBlockInput,
  StudyQuestionPracticeCreateInput,
  StudyQuestionPracticeUpdateInput,
  StudyScheduleInput,
  StudySessionCreateInput,
  StudySessionUpdateInput,
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

export function useStudyQuestionPractice(filters?: StudyQuestionPracticeFilters) {
  return useQuery({
    queryKey: ["study-question-practice", filters],
    queryFn: () => StudyServices.getQuestionPractice(filters),
  });
}

export function useStudyPlanBoard(weekStartKey: string) {
  return useQuery({
    queryKey: ["study-plan", weekStartKey],
    queryFn: () => StudyServices.getPlanBoard(weekStartKey),
  });
}

export function useStudyPlanProgress(planKey: string) {
  return useQuery({
    queryKey: ["study-plan-progress", planKey],
    queryFn: () => StudyServices.getPlanProgress(planKey),
  });
}

export function useSaveStudyPlanProgress(planKey: string) {
  const queryClient = useQueryClient();

  return useMutation({
    meta: {
      successMessage: "Plan progress saved.",
      successTitle: "Saved",
    },
    mutationFn: (itemIds: string[]) =>
      StudyServices.savePlanProgress(planKey, itemIds),
    onMutate: async (itemIds) => {
      await queryClient.cancelQueries({
        queryKey: ["study-plan-progress", planKey],
      });
      queryClient.setQueryData(["study-plan-progress", planKey], { itemIds });
    },
    onSuccess: async (progress) => {
      queryClient.setQueryData(["study-plan-progress", planKey], progress);
      await queryClient.invalidateQueries({
        queryKey: ["study-plan-progress", planKey],
        refetchType: "all",
      });
    },
  });
}

export function useCreateStudySubject() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Study subject saved.", successTitle: "Saved" },
    mutationFn: StudyServices.createSubject,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["study-subjects"], refetchType: "all" }),
        queryClient.invalidateQueries({ queryKey: ["study-schedule"], refetchType: "all" }),
        queryClient.invalidateQueries({ queryKey: ["study-plan"], refetchType: "all" }),
        queryClient.invalidateQueries({ queryKey: ["pomodoro"], refetchType: "all" }),
      ]);
    },
  });
}

export function useUpdateStudySubject() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Study subject updated.", successTitle: "Updated" },
    mutationFn: ({ id, data }: { id: string; data: StudySubjectInput }) =>
      StudyServices.updateSubject(id, data),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["study-subjects"], refetchType: "all" }),
        queryClient.invalidateQueries({ queryKey: ["study-schedule"], refetchType: "all" }),
        queryClient.invalidateQueries({ queryKey: ["study-plan"], refetchType: "all" }),
        queryClient.invalidateQueries({ queryKey: ["pomodoro"], refetchType: "all" }),
      ]);
    },
  });
}

export function useDeleteStudySubject() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Study subject deleted.", successTitle: "Deleted" },
    mutationFn: StudyServices.deleteSubject,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["study-subjects"], refetchType: "all" }),
        queryClient.invalidateQueries({ queryKey: ["study-schedule"], refetchType: "all" }),
        queryClient.invalidateQueries({ queryKey: ["study-plan"], refetchType: "all" }),
        queryClient.invalidateQueries({ queryKey: ["pomodoro"], refetchType: "all" }),
      ]);
    },
  });
}

export function useSaveStudyScheduleBlock() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Study schedule saved.", successTitle: "Saved" },
    mutationFn: (data: StudyScheduleInput) => StudyServices.saveScheduleBlock(data),
    onSuccess: async (schedule) => {
      queryClient.setQueryData(["study-schedule"], schedule);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["study-schedule"], refetchType: "all" }),
        queryClient.invalidateQueries({ queryKey: ["study-subjects"], refetchType: "all" }),
      ]);
    },
  });
}

export function useCreateStudyPlanBlock() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Study plan block saved.", successTitle: "Saved" },
    mutationFn: (data: StudyPlanBlockInput) =>
      StudyServices.createPlanBlock(data),
    onSuccess: async (_block, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["study-plan", variables.weekStartKey],
        refetchType: "all",
      });
      await queryClient.invalidateQueries({ queryKey: ["study-subjects"], refetchType: "all" });
    },
  });
}

export function useUpdateStudyPlanBlock() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Study plan block updated.", successTitle: "Updated" },
    mutationFn: ({ id, data }: { id: string; data: StudyPlanBlockInput }) =>
      StudyServices.updatePlanBlock(id, data),
    onSuccess: async (_block, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["study-plan", variables.data.weekStartKey],
        refetchType: "all",
      });
      await queryClient.invalidateQueries({ queryKey: ["study-subjects"], refetchType: "all" });
    },
  });
}

export function useDeleteStudyPlanBlock() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Study plan block deleted.", successTitle: "Deleted" },
    mutationFn: StudyServices.deletePlanBlock,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["study-plan"], refetchType: "all" }),
        queryClient.invalidateQueries({ queryKey: ["study-subjects"], refetchType: "all" }),
      ]);
    },
  });
}

export function useCreateStudySession() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Study session saved.", successTitle: "Saved" },
    mutationFn: (data: StudySessionCreateInput) =>
      StudyServices.createSession(data),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["study-sessions"], refetchType: "all" }),
        queryClient.invalidateQueries({ queryKey: ["study-subjects"], refetchType: "all" }),
      ]);
    },
  });
}

export function useUpdateStudySession() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Study session updated.", successTitle: "Updated" },
    mutationFn: ({
      data,
      id,
    }: {
      data: StudySessionUpdateInput;
      id: string;
    }) => StudyServices.updateSession(id, data),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["study-sessions"],
          refetchType: "all",
        }),
        queryClient.invalidateQueries({
          queryKey: ["study-subjects"],
          refetchType: "all",
        }),
      ]);
    },
  });
}

export function useDeleteStudySession() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Study session deleted.", successTitle: "Deleted" },
    mutationFn: StudyServices.deleteSession,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["study-sessions"], refetchType: "all" }),
        queryClient.invalidateQueries({ queryKey: ["study-subjects"], refetchType: "all" }),
      ]);
    },
  });
}

export function useCreateStudyQuestionPractice() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Question practice saved.", successTitle: "Saved" },
    mutationFn: (data: StudyQuestionPracticeCreateInput) =>
      StudyServices.createQuestionPractice(data),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["study-question-practice"],
          refetchType: "all",
        }),
        queryClient.invalidateQueries({
          queryKey: ["study-subjects"],
          refetchType: "all",
        }),
      ]);
    },
  });
}

export function useUpdateStudyQuestionPractice() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: {
      successMessage: "Question practice updated.",
      successTitle: "Updated",
    },
    mutationFn: ({
      data,
      id,
    }: {
      data: StudyQuestionPracticeUpdateInput;
      id: string;
    }) => StudyServices.updateQuestionPractice(id, data),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["study-question-practice"],
          refetchType: "all",
        }),
        queryClient.invalidateQueries({
          queryKey: ["study-subjects"],
          refetchType: "all",
        }),
      ]);
    },
  });
}

export function useDeleteStudyQuestionPractice() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: {
      successMessage: "Question practice deleted.",
      successTitle: "Deleted",
    },
    mutationFn: StudyServices.deleteQuestionPractice,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["study-question-practice"],
          refetchType: "all",
        }),
        queryClient.invalidateQueries({
          queryKey: ["study-subjects"],
          refetchType: "all",
        }),
      ]);
    },
  });
}

import {
  StudyMistakeFilters,
  StudyMistakeServices,
} from "@/services/StudyMistakeServices";
import type {
  StudyMistakeCreateInput,
  StudyMistakeUpdateInput,
} from "@/types/BaseInterfaces";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useStudyMistakes(filters?: StudyMistakeFilters) {
  return useQuery({
    queryKey: ["study-mistakes", filters],
    queryFn: () => StudyMistakeServices.getAll(filters),
  });
}

export function useCreateStudyMistake() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Mistake saved.", successTitle: "Saved" },
    mutationFn: (data: StudyMistakeCreateInput) =>
      StudyMistakeServices.create(data),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["study-mistakes"], refetchType: "all" }),
        queryClient.invalidateQueries({ queryKey: ["study-subjects"], refetchType: "all" }),
      ]);
    },
  });
}

export function useUpdateStudyMistake() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Mistake updated.", successTitle: "Updated" },
    mutationFn: ({
      data,
      id,
    }: {
      data: StudyMistakeUpdateInput;
      id: string;
    }) => StudyMistakeServices.update(id, data),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["study-mistakes"], refetchType: "all" }),
        queryClient.invalidateQueries({ queryKey: ["study-subjects"], refetchType: "all" }),
      ]);
    },
  });
}

export function useDeleteStudyMistake() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Mistake deleted.", successTitle: "Deleted" },
    mutationFn: StudyMistakeServices.delete,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["study-mistakes"], refetchType: "all" }),
        queryClient.invalidateQueries({ queryKey: ["study-subjects"], refetchType: "all" }),
      ]);
    },
  });
}

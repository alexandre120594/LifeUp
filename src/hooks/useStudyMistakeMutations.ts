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
    mutationFn: (data: StudyMistakeCreateInput) =>
      StudyMistakeServices.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["study-mistakes"] });
      queryClient.invalidateQueries({ queryKey: ["study-subjects"] });
    },
  });
}

export function useUpdateStudyMistake() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      data,
      id,
    }: {
      data: StudyMistakeUpdateInput;
      id: string;
    }) => StudyMistakeServices.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["study-mistakes"] });
      queryClient.invalidateQueries({ queryKey: ["study-subjects"] });
    },
  });
}

export function useDeleteStudyMistake() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: StudyMistakeServices.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["study-mistakes"] });
      queryClient.invalidateQueries({ queryKey: ["study-subjects"] });
    },
  });
}

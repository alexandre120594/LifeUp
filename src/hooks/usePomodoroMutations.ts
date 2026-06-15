import { PomodoroServices } from "@/services/PomodoroServices";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function usePomodoroDashboard() {
  return useQuery({
    queryKey: ["pomodoro"],
    queryFn: PomodoroServices.getDashboard,
  });
}

export function useCreatePomodoroSession() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Focus session saved.", successTitle: "Saved" },
    mutationFn: PomodoroServices.createSession,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["pomodoro"],
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

export function useDeletePomodoroSession() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Focus session deleted.", successTitle: "Deleted" },
    mutationFn: PomodoroServices.deleteSession,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["pomodoro"],
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

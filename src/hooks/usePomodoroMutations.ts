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
    mutationFn: PomodoroServices.createSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pomodoro"] });
      queryClient.invalidateQueries({ queryKey: ["task"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
  });
}

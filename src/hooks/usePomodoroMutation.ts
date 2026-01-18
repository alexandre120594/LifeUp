// src/hooks/usePomodoro.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PomodoroService } from "@/services/PomodoroService";

export function useStartPomodoro(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (duration: string) => PomodoroService.start(taskId, duration),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
      queryClient.invalidateQueries({ queryKey: ["task"] });
    },
  });
  
}


export function usePatchPomodoro() {
  const queryClient = useQueryClient();

  return useMutation({
   mutationFn: ({duration,  idPomodoro, status }:{duration: string, idPomodoro: string, status: string}) =>
      PomodoroService.update(idPomodoro, duration, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task"] });
    },
  });
  
}

export function useFinishPomodoro(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pomodoroId: string) =>
      PomodoroService.finish(pomodoroId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
      queryClient.invalidateQueries({ queryKey: ["task"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
  });
}

export function useInterruptPomodoro(taskId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({duration,  idPomodoro }:{duration: string, idPomodoro: string}) =>
      PomodoroService.interrupt(idPomodoro, duration),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
      queryClient.invalidateQueries({ queryKey: ["task"] });
    },
  });
}

export function usePomodoroHistory(taskId: string) {
  return useQuery({
    queryKey: ["pomodoros", taskId],
    queryFn: () => PomodoroService.getByTaskId(taskId),
    enabled: !!taskId,
  });
}


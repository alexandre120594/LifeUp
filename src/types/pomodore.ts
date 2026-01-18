export type PomodoroStatus = "IN_PROGRESS" | "COMPLETED" | "INTERRUPTED";

export interface PomodoroSession {
  id: string;
  taskId: string;
  startedAt: string;
  endedAt?: string;
  duration: number;
  status: PomodoroStatus;
}
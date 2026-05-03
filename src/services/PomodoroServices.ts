import { apiClient } from "./api-client";
import type {
  PomodoroDashboardResponse,
  PomodoroSession,
  PomodoroSessionCreateInput,
} from "@/types/BaseInterfaces";

export const PomodoroServices = {
  createSession: (data: PomodoroSessionCreateInput) =>
    apiClient<PomodoroSession>("/api/pomodoro", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getDashboard: () => apiClient<PomodoroDashboardResponse>("/api/pomodoro"),
};

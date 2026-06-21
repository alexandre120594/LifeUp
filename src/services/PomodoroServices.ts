import { apiClient } from "./api-client";
import type {
  PomodoroDashboardResponse,
  PomodoroSession,
  PomodoroSessionCreateInput,
  PomodoroSessionUpdateInput,
} from "@/types/BaseInterfaces";

export const PomodoroServices = {
  createSession: (data: PomodoroSessionCreateInput) =>
    apiClient<PomodoroSession>("/api/pomodoro", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  deleteSession: (id: string) =>
    apiClient<PomodoroSession>(`/api/pomodoro/${id}`, {
      method: "DELETE",
    }),
  getDashboard: () => apiClient<PomodoroDashboardResponse>("/api/pomodoro"),
  updateSession: (id: string, data: PomodoroSessionUpdateInput) =>
    apiClient<PomodoroSession>(`/api/pomodoro/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};

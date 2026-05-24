import type {
  StudyScheduleBlock,
  StudyScheduleInput,
  StudyPlanBlock,
  StudyPlanBlockInput,
  StudyPlanBoard,
  StudySession,
  StudySessionCreateInput,
  StudySubject,
  StudySubjectInput,
} from "@/types/BaseInterfaces";
import { apiClient } from "./api-client";

export const StudyServices = {
  getSubjects: () => apiClient<StudySubject[]>("/api/study-subjects"),
  createSubject: (data: StudySubjectInput) =>
    apiClient<StudySubject>("/api/study-subjects", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateSubject: (id: string, data: StudySubjectInput) =>
    apiClient<StudySubject>(`/api/study-subjects/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteSubject: (id: string) =>
    apiClient<{ message: string }>(`/api/study-subjects/${id}`, {
      method: "DELETE",
    }),
  getSchedule: () => apiClient<StudyScheduleBlock[]>("/api/study-schedule"),
  saveScheduleBlock: (data: StudyScheduleInput) =>
    apiClient<StudyScheduleBlock[]>("/api/study-schedule", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getPlanBoard: (weekStartKey: string) =>
    apiClient<StudyPlanBoard>(`/api/study-plan?weekStart=${weekStartKey}`),
  createPlanBlock: (data: StudyPlanBlockInput) =>
    apiClient<StudyPlanBlock>("/api/study-plan/blocks", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updatePlanBlock: (id: string, data: StudyPlanBlockInput) =>
    apiClient<StudyPlanBlock>(`/api/study-plan/blocks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deletePlanBlock: (id: string) =>
    apiClient<{ ok: boolean }>(`/api/study-plan/blocks/${id}`, {
      method: "DELETE",
    }),
  getSessions: () => apiClient<StudySession[]>("/api/study-sessions"),
  createSession: (data: StudySessionCreateInput) =>
    apiClient<StudySession>("/api/study-sessions", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  deleteSession: (id: string) =>
    apiClient<{ ok: boolean }>(`/api/study-sessions/${id}`, {
      method: "DELETE",
    }),
};

import type {
  StudyScheduleBlock,
  StudyScheduleInput,
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
};

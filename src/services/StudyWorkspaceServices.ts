import type { StudyReview, StudyReviewInput, StudySessionCore, StudySessionCoreInput, StudySubjectCore, StudySubjectInput, StudyTopic, StudyTopicInput, StudyWorkspace } from "@/types/Study";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, headers: { "Content-Type": "application/json", ...init?.headers } });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || "Nao foi possivel concluir a operacao.");
  }
  return response.json() as Promise<T>;
}

export const StudyWorkspaceServices = {
  get: () => request<StudyWorkspace>("/api/study"),
  createSubject: (data: StudySubjectInput) => request<StudySubjectCore>("/api/study-subjects", { method: "POST", body: JSON.stringify(data) }),
  updateSubject: ({ data, id }: { data: StudySubjectInput; id: string }) => request<StudySubjectCore>(`/api/study-subjects/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteSubject: (id: string) => request<{ message: string }>(`/api/study-subjects/${id}`, { method: "DELETE" }),
  createTopic: (data: StudyTopicInput) => request<StudyTopic>("/api/study-topics", { method: "POST", body: JSON.stringify(data) }),
  createSession: (data: StudySessionCoreInput) => request<StudySessionCore>("/api/study-sessions", { method: "POST", body: JSON.stringify(data) }),
  updateSession: ({ data, id }: { data: StudySessionCoreInput; id: string }) => request<StudySessionCore>(`/api/study-sessions/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteSession: (id: string) => request<{ ok: boolean }>(`/api/study-sessions/${id}`, { method: "DELETE" }),
  createReview: (data: StudyReviewInput) => request<StudyReview>("/api/study-reviews", { method: "POST", body: JSON.stringify(data) }),
  updateReview: ({ data, id }: { data: StudyReviewInput; id: string }) => request<StudyReview>(`/api/study-reviews/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteReview: (id: string) => request<{ ok: boolean }>(`/api/study-reviews/${id}`, { method: "DELETE" }),
  rescheduleReview: ({ dueAt, id }: { dueAt: string; id: string }) => request<StudyReview>(`/api/study-reviews/${id}`, { method: "PATCH", body: JSON.stringify({ action: "reschedule", dueAt }) }),
  masterReview: (id: string) => request<StudyReview>(`/api/study-reviews/${id}`, { method: "PATCH", body: JSON.stringify({ action: "master" }) }),
};

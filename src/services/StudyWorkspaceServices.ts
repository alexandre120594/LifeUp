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
  createTopic: (data: StudyTopicInput) => request<StudyTopic>("/api/study-topics", { method: "POST", body: JSON.stringify(data) }),
  createSession: (data: StudySessionCoreInput) => request<StudySessionCore>("/api/study-sessions", { method: "POST", body: JSON.stringify(data) }),
  createReview: (data: StudyReviewInput) => request<StudyReview>("/api/study-reviews", { method: "POST", body: JSON.stringify(data) }),
  rescheduleReview: ({ dueAt, id }: { dueAt: string; id: string }) => request<StudyReview>(`/api/study-reviews/${id}`, { method: "PATCH", body: JSON.stringify({ action: "reschedule", dueAt }) }),
  masterReview: (id: string) => request<StudyReview>(`/api/study-reviews/${id}`, { method: "PATCH", body: JSON.stringify({ action: "master" }) }),
};

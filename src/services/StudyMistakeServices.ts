import type {
  StudyMistake,
  StudyMistakeCreateInput,
  StudyMistakeStatus,
  StudyMistakeUpdateInput,
} from "@/types/BaseInterfaces";
import { apiClient } from "./api-client";

export type StudyMistakeFilters = {
  due?: boolean;
  errorType?: string;
  q?: string;
  status?: StudyMistakeStatus | "all";
  subjectId?: string;
};

export const StudyMistakeServices = {
  getAll: (filters?: StudyMistakeFilters) => {
    const searchParams = new URLSearchParams();

    if (filters?.due) {
      searchParams.set("due", "true");
    }

    if (filters?.errorType) {
      searchParams.set("errorType", filters.errorType);
    }

    if (filters?.q) {
      searchParams.set("q", filters.q);
    }

    if (filters?.status && filters.status !== "all") {
      searchParams.set("status", filters.status);
    }

    if (filters?.subjectId) {
      searchParams.set("subjectId", filters.subjectId);
    }

    const query = searchParams.toString();
    const url = query ? `/api/study-mistakes?${query}` : "/api/study-mistakes";

    return apiClient<StudyMistake[]>(url);
  },
  create: (data: StudyMistakeCreateInput) =>
    apiClient<StudyMistake>("/api/study-mistakes", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiClient<{ ok: boolean }>(`/api/study-mistakes/${id}`, {
      method: "DELETE",
    }),
  update: (id: string, data: StudyMistakeUpdateInput) =>
    apiClient<StudyMistake>(`/api/study-mistakes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};

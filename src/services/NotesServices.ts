import {
  Note,
  NoteCreateInput,
  NoteUpdateInput,
} from "@/types/BaseInterfaces";
import { apiClient } from "./api-client";

export const NotesServices = {
  getAll: (filters?: {
    category?: string;
    habitId?: string;
    projectId?: string;
    q?: string;
    taskId?: string;
  }) => {
    const searchParams = new URLSearchParams();

    if (filters?.category) {
      searchParams.set("category", filters.category);
    }

    if (filters?.habitId) {
      searchParams.set("habitId", filters.habitId);
    }

    if (filters?.projectId) {
      searchParams.set("projectId", filters.projectId);
    }

    if (filters?.q) {
      searchParams.set("q", filters.q);
    }

    if (filters?.taskId) {
      searchParams.set("taskId", filters.taskId);
    }

    const query = searchParams.toString();
    const url = query ? `/api/notes?${query}` : "/api/notes";
    return apiClient<Note[]>(url);
  },
  create: (data: NoteCreateInput) =>
    apiClient<Note>("/api/notes", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiClient<{ ok: boolean }>(`/api/notes/${id}`, { method: "DELETE" }),
  update: (id: string, data: NoteUpdateInput) =>
    apiClient<Note>(`/api/notes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};

import {
  InboxItem,
  InboxItemCreateInput,
  InboxItemUpdateInput,
} from "@/types/BaseInterfaces";
import { apiClient } from "./api-client";

export const InboxServices = {
  getAll: (filters?: { status?: string }) => {
    const searchParams = new URLSearchParams();

    if (filters?.status) {
      searchParams.set("status", filters.status);
    }

    const query = searchParams.toString();
    const url = query ? `/api/inbox?${query}` : "/api/inbox";
    return apiClient<InboxItem[]>(url);
  },
  create: (data: InboxItemCreateInput) =>
    apiClient<InboxItem>("/api/inbox", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiClient<{ ok: boolean }>(`/api/inbox/${id}`, { method: "DELETE" }),
  update: (id: string, data: InboxItemUpdateInput) =>
    apiClient<InboxItem>(`/api/inbox/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};

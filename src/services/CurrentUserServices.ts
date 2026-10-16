import { apiClient } from "@/services/api-client";
import type { CurrentUser, UpdateCurrentUserInput } from "@/types/CurrentUser";

export const CurrentUserServices = {
  getCurrent: () => apiClient<CurrentUser>("/api/auth/me"),
  updateCurrent: (data: UpdateCurrentUserInput) =>
    apiClient<CurrentUser>("/api/auth/me", {
      body: JSON.stringify(data),
      method: "PATCH",
    }),
  logout: () =>
    apiClient<{ ok: boolean }>("/api/auth/logout", {
      method: "POST",
    }),
};

import type { WeeklyPlanBoard, WeeklyPlanSlotInput } from "@/types/BaseInterfaces";
import { apiClient } from "./api-client";

export const WeeklyPlanServices = {
  getBoard: (weekStartKey: string) =>
    apiClient<WeeklyPlanBoard>(`/api/weekly-plan?weekStart=${weekStartKey}`),
  createSlot: (data: WeeklyPlanSlotInput) =>
    apiClient<WeeklyPlanBoard>("/api/weekly-plan/slots", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateSlot: (id: string, data: WeeklyPlanSlotInput) =>
    apiClient<WeeklyPlanBoard>(`/api/weekly-plan/slots/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteSlot: (id: string) =>
    apiClient<WeeklyPlanBoard>(`/api/weekly-plan/slots/${id}`, {
      method: "DELETE",
    }),
};

import type {
  PlannedPurchaseInput,
  PlannedPurchaseNecessity,
  PlannerTaskInput,
  PlannerTaskPriority,
  PlannerTaskStatus,
} from "@/types/Planner";

export const PLANNER_TASK_STATUSES = ["pending", "in_progress", "done", "cancelled"] as const;
export const PLANNER_PRIORITIES = ["low", "medium", "high"] as const;
export const PURCHASE_NECESSITIES = ["need", "want"] as const;

export function isPlannerTaskStatus(value: unknown): value is PlannerTaskStatus {
  return typeof value === "string" && PLANNER_TASK_STATUSES.includes(value as PlannerTaskStatus);
}

export function isPlannerPriority(value: unknown): value is PlannerTaskPriority {
  return typeof value === "string" && PLANNER_PRIORITIES.includes(value as PlannerTaskPriority);
}

export function isPurchaseNecessity(value: unknown): value is PlannedPurchaseNecessity {
  return typeof value === "string" && PURCHASE_NECESSITIES.includes(value as PlannedPurchaseNecessity);
}

function optionalText(value: unknown) {
  return typeof value === "string" ? value.trim() || null : value === null ? null : undefined;
}

type OptionalDateResult = { value: Date | null | undefined } | { error: string };

type PlannerTaskData = Partial<Omit<PlannerTaskInput, "dueDate">> & { dueDate?: Date | null };
type PlannedPurchaseData = Partial<Omit<PlannedPurchaseInput, "plannedDate">> & { plannedDate?: Date | null };

export function parseOptionalDate(value: unknown): OptionalDateResult {
  if (value === null || value === "") return { value: null };
  if (value === undefined) return { value: undefined };
  if (typeof value !== "string") return { error: "Data inválida." };
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? { error: "Data inválida." } : { value: date };
}

export function normalizePlannerTaskInput(body: Record<string, unknown>, partial = false): { data: PlannerTaskData } | { error: string } {
  const title = typeof body.title === "string" ? body.title.trim() : undefined;
  if ((!partial || body.title !== undefined) && !title) return { error: "Informe o título da tarefa." } as const;
  if (body.priority !== undefined && !isPlannerPriority(body.priority)) return { error: "Prioridade inválida." } as const;
  if (body.status !== undefined && !isPlannerTaskStatus(body.status)) return { error: "Status inválido." } as const;
  const dueDate = parseOptionalDate(body.dueDate);
  if ("error" in dueDate) return dueDate;

  const data: PlannerTaskData = {};
  if (title !== undefined) data.title = title;
  if (body.description !== undefined) data.description = optionalText(body.description);
  if (dueDate.value !== undefined) data.dueDate = dueDate.value;
  if (body.priority !== undefined) data.priority = body.priority as PlannerTaskPriority;
  if (body.status !== undefined) data.status = body.status as PlannerTaskStatus;
  if (body.goalId !== undefined) data.goalId = optionalText(body.goalId);
  return { data } as const;
}

export function normalizePlannedPurchaseInput(body: Record<string, unknown>, partial = false): { data: PlannedPurchaseData } | { error: string } {
  const title = typeof body.title === "string" ? body.title.trim() : undefined;
  if ((!partial || body.title !== undefined) && !title) return { error: "Informe o título da compra." } as const;
  if (body.priority !== undefined && !isPlannerPriority(body.priority)) return { error: "Prioridade inválida." } as const;
  if (body.necessity !== undefined && !isPurchaseNecessity(body.necessity)) return { error: "Necessidade inválida." } as const;
  const plannedDate = parseOptionalDate(body.plannedDate);
  if ("error" in plannedDate) return plannedDate;
  const amount = body.estimatedAmount === null || body.estimatedAmount === "" ? null : body.estimatedAmount === undefined ? undefined : Number(body.estimatedAmount);
  if (amount !== undefined && amount !== null && (!Number.isFinite(amount) || amount <= 0)) return { error: "O valor estimado deve ser maior que zero." } as const;

  const data: PlannedPurchaseData = {};
  if (title !== undefined) data.title = title;
  if (body.description !== undefined) data.description = optionalText(body.description);
  if (amount !== undefined) data.estimatedAmount = amount;
  if (plannedDate.value !== undefined) data.plannedDate = plannedDate.value;
  if (body.priority !== undefined) data.priority = body.priority as PlannerTaskPriority;
  if (body.necessity !== undefined) data.necessity = body.necessity as PlannedPurchaseNecessity;
  if (body.goalId !== undefined) data.goalId = optionalText(body.goalId);
  return { data } as const;
}

export function getPlannerMonthRange(year: number, month: number) {
  return { start: new Date(year, month - 1, 1), end: new Date(year, month, 1) };
}

import { GoalArea, GoalStatus } from "@/generated/client";

const statuses = new Set<string>(Object.values(GoalStatus));
const areas = new Set<string>(Object.values(GoalArea));

export function normalizeGoalInput(input: Record<string, unknown>, partial = false) {
  const data: {
    area?: GoalArea;
    color?: string | null;
    description?: string | null;
    progress?: number;
    status?: GoalStatus;
    targetDate?: Date | null;
    title?: string;
  } = {};

  if ("title" in input) {
    if (typeof input.title !== "string" || !input.title.trim()) {
      return { error: "Title is required." };
    }
    data.title = input.title.trim();
  } else if (!partial) {
    return { error: "Title is required." };
  }

  if ("area" in input) {
    if (typeof input.area !== "string" || !areas.has(input.area)) {
      return { error: "Invalid area." };
    }
    data.area = input.area as GoalArea;
  } else if (!partial) {
    return { error: "Area is required." };
  }

  if ("description" in input) {
    data.description =
      typeof input.description === "string" && input.description.trim()
        ? input.description.trim()
        : null;
  }

  if ("color" in input) {
    data.color =
      typeof input.color === "string" && input.color.trim()
        ? input.color.trim()
        : null;
  }

  if ("status" in input) {
    if (typeof input.status !== "string" || !statuses.has(input.status)) {
      return { error: "Invalid status." };
    }
    data.status = input.status as GoalStatus;
  }

  if ("progress" in input) {
    const progress = Number(input.progress);
    if (!Number.isInteger(progress) || progress < 0 || progress > 100) {
      return { error: "Progress must be an integer from 0 to 100." };
    }
    data.progress = progress;
  }

  if ("targetDate" in input) {
    if (input.targetDate === null || input.targetDate === "") {
      data.targetDate = null;
    } else if (typeof input.targetDate === "string") {
      const targetDate = new Date(input.targetDate);
      if (Number.isNaN(targetDate.getTime())) {
        return { error: "Invalid target date." };
      }
      data.targetDate = targetDate;
    } else {
      return { error: "Invalid target date." };
    }
  }

  return { data };
}

export function isGoalArea(value: unknown): value is GoalArea {
  return typeof value === "string" && areas.has(value);
}

export function isGoalStatus(value: unknown): value is GoalStatus {
  return typeof value === "string" && statuses.has(value);
}

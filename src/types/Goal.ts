export type GoalStatus = "ACTIVE" | "PAUSED" | "COMPLETED";
export type GoalArea = "BODY" | "MIND" | "HOME";

export interface Goal {
  id: string;
  userId: number;
  title: string;
  description?: string | null;
  area: GoalArea;
  status: GoalStatus;
  progress: number;
  targetDate?: Date | string | null;
  color?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface GoalCreateInput {
  title: string;
  description?: string | null;
  area: GoalArea;
  status?: GoalStatus;
  progress?: number;
  targetDate?: string | null;
  color?: string | null;
}

export interface GoalUpdateInput {
  title?: string;
  description?: string | null;
  area?: GoalArea;
  status?: GoalStatus;
  progress?: number;
  targetDate?: string | null;
  color?: string | null;
}

export type GoalAreaFilter = "ALL" | GoalArea;
export type GoalStatusFilter = "ALL" | GoalStatus;
